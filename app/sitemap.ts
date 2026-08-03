import type { MetadataRoute } from "next";
import { getAllPosts, CATEGORIES, CHOSUNG } from "@/lib/posts";

// TODO: 실제 도메인 확정 후 교체
const BASE_URL = "https://mongle.plentyer.com";

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

  const posts: MetadataRoute.Sitemap = (await getAllPosts()).map((post) => ({
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
