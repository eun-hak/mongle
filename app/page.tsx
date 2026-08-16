import type { Metadata } from "next";
import Link from "next/link";
import SearchBox from "@/components/SearchBox";
import { CATEGORIES, getAllPostMetas } from "@/lib/posts";
import "./home.css";

export const metadata: Metadata = {
  title: {
    absolute: "몽글 — 어젯밤 꿈, 무슨 의미일까요?",
  },
  description:
    "뱀꿈, 이빨꿈, 돈꿈 등 자주 찾는 꿈의 의미를 실제 질문 데이터 기반으로 정리한 사전형 꿈해몽 레퍼런스입니다. 키워드 검색과 카테고리·꿈사전으로 원하는 해몽을 바로 찾아보세요.",
};

export const revalidate = 3600;

export default async function HomePage() {
  const posts = await getAllPostMetas();

  const searchItems = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    variants: p.variants,
    category: p.category,
  }));

  const popularChips = posts.slice(0, 8);
  const topPosts = posts.slice(0, 8);

  return (
    <>
      {/* 1. 히어로 */}
      <section className="night-bg home-hero">
        <div className="container">
          <h1 className="serif home-hero-title">
            어젯밤 꿈, 무슨 의미일까요?
          </h1>
          <p className="home-hero-sub">실제 질문 데이터로 정리한 꿈사전</p>
          <SearchBox items={searchItems} />
          <div className="home-hero-chips" aria-label="인기 검색어">
            <span className="home-chip-label">인기 검색</span>
            {popularChips.map((p) => (
              <Link key={p.slug} href={`/${p.slug}`} className="home-chip">
                #{p.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        {/* 2. 카테고리 그리드 */}
        <section className="home-section" aria-labelledby="home-cat-heading">
          <h2 id="home-cat-heading" className="serif home-section-title">
            카테고리로 찾기
          </h2>
          <p className="home-section-sub">
            꿈에 나온 대상에 따라 7가지 분류로 정리했습니다.
          </p>
          <div className="home-cat-grid">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={`/category/${cat.slug}`}
                className="card home-cat-card"
              >
                <span className="home-cat-emoji" aria-hidden="true">
                  {cat.emoji}
                </span>
                <h3 className="serif home-cat-name">{cat.name}</h3>
                <p className="home-cat-desc">{cat.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. 인기 꿈해몽 TOP */}
        <section className="home-section" aria-labelledby="home-top-heading">
          <h2 id="home-top-heading" className="serif home-section-title">
            인기 꿈해몽 TOP
          </h2>
          <p className="home-section-sub">
            가장 많이 찾는 꿈 풀이를 순서대로 모았습니다.
          </p>
          <ol className="home-top-list">
            {topPosts.map((post, i) => (
              <li key={post.slug}>
                <Link href={`/${post.slug}`} className="card home-top-row">
                  <span className="serif home-top-rank" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="home-top-emoji" aria-hidden="true">
                    {post.emoji}
                  </span>
                  <span className="home-top-body">
                    <span className="home-top-title serif">{post.title}</span>
                    <span className="home-top-intro">{post.intro}</span>
                  </span>
                  <span className="badge">{post.category}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* 4. 하단 안내 박스 */}
        <section className="card home-notice" aria-labelledby="home-notice-heading">
          <h2 id="home-notice-heading" className="serif home-notice-title">
            몽글은 이런 곳입니다
          </h2>
          <p className="home-notice-text">
            몽글은 사람들이 실제로 묻고 찾는 질문 데이터를 바탕으로 전통
            해몽 풀이를 표제어별로 정리한 사전형 레퍼런스 사이트입니다. 찾는
            꿈이 있다면 검색창이나 꿈사전에서 바로 확인해 보세요.
          </p>
          <Link href="/index/ㄱ" className="btn btn-primary">
            꿈사전 열어보기
          </Link>
        </section>
      </div>
    </>
  );
}
