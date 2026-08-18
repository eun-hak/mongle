import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostCard from "@/components/PostCard";
import { CATEGORIES, getCategoryBlock } from "@/lib/posts";
import "./category.css";

// 새 글 반영: 1시간 주기 재생성
export const revalidate = 3600;

interface CategoryPageProps {
  params: Promise<{ cat: string }>;
}

export function generateStaticParams() {
  return []; // 한글 경로 — 방문 시 ISR 생성
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { cat } = await params;
  const name = decodeURIComponent(cat);
  const info = CATEGORIES.find((c) => c.name === name);
  if (!info) {
    return { title: "카테고리를 찾을 수 없습니다" };
  }
  return {
    title: `${info.name} 해몽 모음 — ${info.emoji} ${info.name} 풀이 사전`,
    description: info.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { cat } = await params;
  const name = decodeURIComponent(cat);
  const info = CATEGORIES.find((c) => c.name === name);
  if (!info) notFound();

  const { metas: posts, total } = await getCategoryBlock(info.name);
  const others = CATEGORIES.filter((c) => c.name !== info.name);

  return (
    <>
      <section className="cat-hero">
        <div className="container">
          <span className="cat-hero-emoji" aria-hidden="true">
            {info.emoji}
          </span>
          <h1 className="cat-hero-title serif">{info.name}</h1>
          <p className="cat-hero-desc">{info.description}</p>
        </div>
      </section>

      <div className="container">
        {posts.length > 0 ? (
          <>
            <p className="cat-count">
              총 <strong>{total}</strong>개의 해몽 항목이 정리되어
              있습니다.
            </p>
            <ul className="cat-grid">
              {posts.map((post) => (
                <li key={post.slug}>
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="cat-empty card">
            <span className="cat-empty-emoji" aria-hidden="true">
              🌙
            </span>
            <p className="cat-empty-title serif">곧 추가됩니다</p>
            <p className="cat-empty-desc">
              {info.name} 항목은 현재 정리 중입니다. 먼저 다른 카테고리를
              둘러보세요.
            </p>
            <div className="cat-empty-links">
              {others.map((c) => (
                <Link key={c.name} href={`/category/${c.name}`}>
                  <span aria-hidden="true">{c.emoji}</span>
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <nav className="cat-nav" aria-label="카테고리 목록">
          <h2 className="cat-nav-title serif">다른 카테고리 보기</h2>
          <ul className="cat-nav-list">
            {CATEGORIES.map((c) => (
              <li key={c.name}>
                <Link
                  href={`/category/${c.name}`}
                  aria-current={c.name === info.name ? "page" : undefined}
                >
                  <span aria-hidden="true">{c.emoji}</span>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
