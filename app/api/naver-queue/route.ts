import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

/**
 * 네이버 수집요청용 URL 큐 — 외부 제출 서버가 매일 가져가는 엔드포인트.
 *
 * GET /api/naver-queue?key=<REVALIDATE_SECRET>&limit=50
 *   → 아직 제출 안 된 발행 글 중 오래된 순 50개를 반환하고 '제출됨(오늘 날짜)'으로 마킹
 *
 * 옵션:
 *   &format=json      기본 txt(줄당 URL 1개) 대신 JSON
 *   &dryrun=1         마킹 없이 미리보기
 *   &resend=YYYY-MM-DD  그날 내줬던 배치를 다시 반환 (제출 실패 복구용)
 */

const BASE_URL = "https://mongle.plentyer.com";
const SITE = process.env.SITE_ID ?? "mongle";
const TABLE = process.env.DDB_TABLE ?? "content";
const PK = `SITE#${SITE}`;

const doc = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.APP_AWS_REGION ?? "ap-northeast-2",
    credentials: {
      accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!,
    },
  })
);

export const dynamic = "force-dynamic"; // 캐시 금지 — 매 호출이 실제 큐 소비

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (!process.env.REVALIDATE_SECRET || p.get("key") !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const limit = Math.min(parseInt(p.get("limit") ?? "50", 10) || 50, 200);
  const dryrun = p.get("dryrun") === "1";
  const resend = p.get("resend");

  // 전체 발행 글 스캔 (수백~수천 건 규모라 쿼리 몇 페이지면 충분)
  const items: Record<string, any>[] = [];
  let lek: Record<string, any> | undefined;
  do {
    const res = await doc.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: { ":pk": PK, ":sk": "POST#" },
      ExclusiveStartKey: lek,
    }));
    items.push(...(res.Items ?? []));
    lek = res.LastEvaluatedKey as typeof lek;
  } while (lek);

  const published = items.filter((i) => (i.status ?? "published") === "published");

  let batch: Record<string, any>[];
  if (resend) {
    batch = published.filter((i) => i.naverSubmitted === resend);
  } else {
    batch = published
      .filter((i) => !i.naverSubmitted)
      .sort((a, b) =>
        (a.updated ?? "").localeCompare(b.updated ?? "") ||
        (a.slug as string).localeCompare(b.slug as string, "ko"))
      .slice(0, limit);
  }

  const today = new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10); // KST
  if (!dryrun && !resend) {
    for (const it of batch) {
      await doc.send(new UpdateCommand({
        TableName: TABLE,
        Key: { PK, SK: it.SK },
        UpdateExpression: "SET naverSubmitted = :d",
        ExpressionAttributeValues: { ":d": today },
      }));
    }
  }

  const urls = batch.map((i) => `${BASE_URL}/${encodeURIComponent(i.slug)}`);
  const remaining = published.filter((i) => !i.naverSubmitted).length - (dryrun || resend ? 0 : urls.length);

  if (p.get("format") === "json") {
    return NextResponse.json({ ok: true, date: today, count: urls.length, remaining, urls });
  }
  return new Response(urls.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Queue-Remaining": String(remaining),
    },
  });
}
