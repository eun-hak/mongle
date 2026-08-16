import type { MetadataRoute } from "next";
import { getAllPostMetas, CATEGORIES, CHOSUNG } from "@/lib/posts";

const BASE_URL = "https://mongle.plentyer.com";

// 공장이 DynamoDB에 새 글을 넣으면 1시간 내 사이트맵에 자동 반영
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const home: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const posts: MetadataRoute.Sitemap = (await getAllPostMetas()).map((post) => ({
    url: `${BASE_URL}/${encodeURIComponent(post.slug)}`,
    lastModified: new Date(post.updated),
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const categories: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${BASE_URL}/category/${encodeURIComponent(cat.slug)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const indexes: MetadataRoute.Sitemap = CHOSUNG.map((cho) => ({
    url: `${BASE_URL}/index/${encodeURIComponent(cho)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const statics: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  return [...home, ...posts, ...categories, ...indexes, ...statics];
}
