import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  validateQuestion, hashIp, kstDay, checkIpQuota, claimPublishSlot,
  matchTopics, interpret, newId, putAsk, DAILY_PER_IP, type AskItem,
} from "@/lib/ask";

/**
 * POST /api/ask  { dream: string, website?: string, t?: number }
 *  → { ok, id, url, status, answer, related[] }
 * - website: 허니팟(봇이 채움) — 값이 있으면 조용히 거절
 * - t: 폼이 열린 뒤 경과 ms — 3초 미만이면 봇으로 간주
 * 로그인 없음 · 무조건 공개 · IP당 하루 2회 · 하루 공개 700건 초과분은 pending
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "잘못된 요청입니다." }, { status: 400 }); }

  // 봇 컷 — 정상 사용자에겐 보이지 않는 조건
  if (body.website) return NextResponse.json({ ok: true, id: "", url: "", status: "blocked" });
  if (typeof body.t === "number" && body.t < 3000) return NextResponse.json({ ok: false, error: "조금만 천천히 입력해 주세요." }, { status: 429 });

  const v = validateQuestion(body.dream);
  if (!v.ok) return NextResponse.json({ ok: false, error: v.error }, { status: 400 });

  const ip = (req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "127.0.0.1").split(",")[0].trim();
  const ipHash = hashIp(ip);
  const day = kstDay();
  try {
    if (!(await checkIpQuota(ipHash, day))) {
      return NextResponse.json({ ok: false, error: `하루에 ${DAILY_PER_IP}번까지 물어볼 수 있어요. 내일 다시 찾아와 주세요.` }, { status: 429 });
    }
  } catch (e) {
    console.error("[ask] 카운터 실패:", e);
    return NextResponse.json({ ok: false, error: "잠시 후 다시 시도해 주세요." }, { status: 503 });
  }

  const { topics, metas } = await matchTopics(v.q);
  let result;
  try {
    result = await interpret(v.q, metas);
  } catch (e) {
    console.error("[ask] interpret 실패:", e);
    return NextResponse.json({ ok: false, error: "지금은 풀이가 밀려 있어요. 잠시 후 다시 시도해 주세요." }, { status: 503 });
  }

  const id = newId();
  const status = (await claimPublishSlot(day)) ? "public" : "pending";
  const item: AskItem = {
    id, q: v.q, a: result.a, topics, related: metas.map((m) => m.slug),
    status, createdAt: new Date().toISOString(), day, model: result.model,
  };
  await putAsk({ ...item, ip: ipHash });
  if (status === "public") revalidatePath("/ask/list");   // 목록 첫 페이지에 바로 보이게

  return NextResponse.json({
    ok: true, id, url: `/ask/${id}`, status, answer: result.a,
    related: metas.map((m) => ({ slug: m.slug, title: m.title, emoji: m.emoji, category: m.category, intro: m.intro })),
  });
}
