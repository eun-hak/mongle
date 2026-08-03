import type { MetadataRoute } from "next";

// TODO: 실제 도메인 확정 후 교체
const BASE_URL = "https://mongle.plentyer.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
