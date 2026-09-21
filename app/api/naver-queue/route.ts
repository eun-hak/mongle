import { NextResponse } from "next/server";

/**
 * (중단됨) 네이버 수집요청용 URL 큐.
 *
 * 2026-09-17 제출 서버가 sitemap.xml + 자체 누적 장부 방식으로 전환해 더 이상 이 API를 부르지 않는다.
 * 옛 구현은 호출마다 LIST# 전체(11,000+건, ~1,650 RCU)를 읽어 25 RCU 공유 테이블의 분당 한도를
 * 넘겼고, 그날 제출분 50건이 통째로 누락되는 500을 냈다. 실수로 한 번만 호출돼도 같은 부하가
 * 재현되므로 DB를 전혀 읽지 않는 안내 응답만 남긴다. 제출 이력은 제출 서버 장부에 있다.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { ok: false, error: "retired", message: "이 큐 API는 2026-09-17에 중단됐습니다. 제출 서버는 /sitemap.xml을 사용합니다." },
    { status: 410 }
  );
}
