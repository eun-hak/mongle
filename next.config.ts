import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // OG 이미지 라우트가 fs로 읽는 폰트를 Vercel 배포 번들에 포함
  outputFileTracingIncludes: {
    "/opengraph-image": ["./assets/fonts/*"],
    "/[slug]/opengraph-image": ["./assets/fonts/*"],
  },
};

export default nextConfig;
