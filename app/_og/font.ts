import { readFile } from "node:fs/promises";
import path from "node:path";

/** OG 이미지용 한글 폰트 (Pretendard Bold, assets/fonts에 번들)
 *  next.config의 outputFileTracingIncludes로 배포에 포함됨 */
export async function loadOgFont(): Promise<ArrayBuffer> {
  const p = path.join(process.cwd(), "assets", "fonts", "Pretendard-Bold.otf");
  const buf = await readFile(p);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

export const OG_SIZE = { width: 1200, height: 630 };

/** 밤하늘 그라데이션 배경 스타일 (디자인 토큰과 동일 컬러) */
export const OG_BG = {
  background:
    "radial-gradient(2.5px 2.5px at 12% 28%, rgba(255,255,255,0.8) 50%, transparent 51%)," +
    "radial-gradient(3px 3px at 44% 12%, rgba(243,223,168,0.9) 50%, transparent 51%)," +
    "radial-gradient(2.5px 2.5px at 76% 38%, rgba(255,255,255,0.6) 50%, transparent 51%)," +
    "radial-gradient(2px 2px at 90% 18%, rgba(255,255,255,0.7) 50%, transparent 51%)," +
    "linear-gradient(135deg, #171233, #221a4d)",
};
