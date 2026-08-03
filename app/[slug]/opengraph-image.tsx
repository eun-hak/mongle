import { ImageResponse } from "next/og";
import { getPost } from "@/lib/posts";
import { loadOgFont, OG_SIZE, OG_BG } from "../_og/font";

export const alt = "몽글 꿈해몽";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function PostOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {}
  const post = await getPost(decoded);
  const font = await loadOgFont();

  const title = post?.title ?? "꿈해몽";
  const emoji = post?.emoji ?? "🌙";
  const category = post?.category ?? "";
  const sectionCount = post?.sections.length ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          ...OG_BG,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          fontFamily: "Pretendard",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <path
              d="M20.6 14.9A9.2 9.2 0 0 1 9.1 3.4 9.2 9.2 0 1 0 20.6 14.9Z"
              fill="#e9c86b"
            />
          </svg>
          <div style={{ fontSize: 30, fontWeight: 700 }}>몽글</div>
          <div style={{ fontSize: 22, color: "#8d7bb8", marginTop: 4 }}>꿈사전</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 64 }}>{emoji}</div>
          <div style={{ fontSize: 84, fontWeight: 700, marginTop: 10, letterSpacing: -1 }}>
            {`${title} 해몽`}
          </div>
          <div style={{ fontSize: 28, color: "#b19ae0", marginTop: 18 }}>
            {`${category}${sectionCount > 0 ? ` · 상황별 풀이 ${sectionCount}가지` : ""}`}
          </div>
        </div>

        <div style={{ fontSize: 22, color: "#8d7bb8" }}>
          실제 질문 데이터로 정리한 꿈사전 · mongle.plentyer.com
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: "Pretendard", data: font, weight: 700 }] }
  );
}
