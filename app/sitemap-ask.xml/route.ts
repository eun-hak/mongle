import { getAskSitemapEntries } from "@/lib/ask";

const BASE_URL = "https://mongle.plentyer.com";

// 질문 페이지 전용 사이트맵 — 사전 사이트맵(sitemap.xml, 5만 URL 한도 접근 중)과 분리한다.
// 공장이 매일 BLOCK#ASK#SITEMAP#* 을 재계산하고, robots.txt에 함께 선언된다.
export const revalidate = 3600;

export async function GET() {
  const entries = await getAskSitemapEntries();
  const body = entries
    .map((e) => `<url><loc>${BASE_URL}/ask/${e.id}</loc><lastmod>${e.d}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`)
    .join("\n");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } }
  );
}
