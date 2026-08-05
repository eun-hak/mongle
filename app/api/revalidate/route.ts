import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/** 공장이 발행/수정 시 호출 — 해당 경로의 ISR 캐시를 즉시 갱신.
 *  POST { secret: string, slugs: string[] } */
export async function POST(req: NextRequest) {
  const { secret, slugs } = await req.json();
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const paths = ["/", "/sitemap.xml"];
  for (const slug of slugs ?? []) {
    paths.push(`/${encodeURIComponent(slug)}`);
    paths.push(`/${slug}`);
  }
  for (const p of paths) revalidatePath(p);
  // 카테고리·색인 목록도 갱신
  revalidatePath("/category/[cat]", "page");
  revalidatePath("/index/[group]", "page");
  return NextResponse.json({ ok: true, revalidated: paths.length + 2 });
}
