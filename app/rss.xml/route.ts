import { getAllPostMetas } from "@/lib/posts";

const BASE_URL = "https://mongle.plentyer.com";

// 네이버 서치어드바이저 RSS 제출용 — 신규 글 발견 채널
export const revalidate = 1800; // 30분

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET() {
  const posts = (await getAllPostMetas())
    .sort((a, b) => (a.updated < b.updated ? 1 : -1))
    .slice(0, 100);

  const items = posts
    .map((p) => {
      const url = `${BASE_URL}/${encodeURIComponent(p.slug)}`;
      return `<item>
<title>${esc(p.headline)}</title>
<link>${url}</link>
<guid isPermaLink="true">${url}</guid>
<description>${esc(p.intro)}</description>
<pubDate>${new Date(p.updated + "T03:00:00+09:00").toUTCString()}</pubDate>
<category>${esc(p.category)}</category>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>몽글 — 꿈해몽 사전</title>
<link>${BASE_URL}</link>
<description>실제 질문 데이터로 정리한 꿈해몽 사전</description>
<language>ko</language>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
