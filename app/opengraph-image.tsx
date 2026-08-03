import { ImageResponse } from "next/og";
import { loadOgFont, OG_SIZE, OG_BG } from "./_og/font";

export const alt = "몽글 — 꿈해몽 사전";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage() {
  const font = await loadOgFont();
  return new ImageResponse(
    (
      <div
        style={{
          ...OG_BG,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Pretendard",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path
              d="M20.6 14.9A9.2 9.2 0 0 1 9.1 3.4 9.2 9.2 0 1 0 20.6 14.9Z"
              fill="#e9c86b"
            />
            <circle cx="18.2" cy="5.4" r="0.9" fill="#f3dfa8" />
            <circle cx="21.2" cy="9.2" r="0.6" fill="#f3dfa8" />
          </svg>
          <div style={{ fontSize: 88, fontWeight: 700 }}>몽글</div>
        </div>
        <div style={{ fontSize: 34, color: "#b19ae0", marginTop: 20 }}>
          어젯밤 꿈, 무슨 의미일까요?
        </div>
        <div style={{ fontSize: 24, color: "#8d7bb8", marginTop: 14 }}>
          실제 질문 데이터로 정리한 꿈사전
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: "Pretendard", data: font, weight: 700 }] }
  );
}
