import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostCard from "@/components/PostCard";
import { CATEGORIES, getAllPosts, getPost, type Post } from "@/lib/posts";
import "./post.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** 새 글이 DynamoDB에 추가되면 재배포 없이 방문 시 생성되고, 하루 주기로 갱신된다. */
export const revalidate = 86400;
export const dynamicParams = true;

/** URL 인코딩된 한글 slug를 복원해 글을 찾는다. */
async function resolvePost(raw: string): Promise<Post | undefined> {
  let slug = raw;
  try {
    slug = decodeURIComponent(raw);
  } catch {
    // 잘못된 인코딩이면 원본 그대로 조회
  }
  return getPost(slug);
}

export async function generateStaticParams() {
  // 한글 파일명은 Vercel 정적 수집에서 깨지므로 인코딩된 경로로 프리렌더
  return (await getAllPosts()).map((post) => ({ slug: encodeURIComponent(post.slug) }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await resolvePost(slug);
  if (!post) return {};
  const url = `/${encodeURIComponent(post.slug)}`;
  return {
    title: post.headline,
    description: post.intro,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.headline,
      description: post.intro,
      url,
      modifiedTime: post.updated,
      section: post.category,
    },
    twitter: {
      card: "summary_large_image",
      title: post.headline,
      description: post.intro,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await resolvePost(slug);
  if (!post) notFound();

  const categoryEmoji =
    CATEGORIES.find((c) => c.name === post.category)?.emoji ?? post.emoji;

  const relatedPosts = (await Promise.all(post.related.map((s) => getPost(s))))
    .filter((p): p is Post => Boolean(p))
    .slice(0, 3);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.headline,
    dateModified: post.updated,
    inLanguage: "ko",
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <article className="post-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <div className="post-wrap">
        {/* 브레드크럼 */}
        <nav className="post-crumb" aria-label="현재 위치">
          <ol>
            <li>
              <Link href="/">홈</Link>
            </li>
            <li className="crumb-sep" aria-hidden="true">
              ›
            </li>
            <li>{post.category}</li>
            <li className="crumb-sep" aria-hidden="true">
              ›
            </li>
            <li aria-current="page">{post.title}</li>
          </ol>
        </nav>

        {/* 제목 · 메타 · 도입부 */}
        <h1 className="post-h1 serif">{post.headline}</h1>

        <div className="post-metarow">
          <span className="badge">
            {categoryEmoji} {post.category}
          </span>
          <span className="post-meta-item">
            상황별 풀이 {post.sections.length}가지
          </span>
          <span className="post-meta-item">업데이트 {post.updated}</span>
        </div>

        <p className="post-intro">{post.intro}</p>

        {/* 목차 */}
        <nav className="card post-toc" aria-label="목차">
          <p className="toc-label">목차</p>
          <ol className="toc-list">
            {post.sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>
                  <span className="toc-num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* 본문 섹션 */}
        {post.sections.map((s) => (
          <section key={s.id} className="post-section">
            <h2 id={s.id} className="serif">
              {s.heading}
            </h2>
            <p>{s.body}</p>
          </section>
        ))}

        {/* FAQ */}
        <section className="post-faq" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="serif">
            자주 묻는 꿈
          </h2>
          {post.faq.map((f) => (
            <details key={f.q} className="faq-item">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>

        {/* 관련 꿈 */}
        {relatedPosts.length > 0 && (
          <section className="post-related" aria-labelledby="related-heading">
            <h2 id="related-heading" className="serif">
              함께 보는 꿈
            </h2>
            <div className="related-grid">
              {relatedPosts.map((rp) => (
                <PostCard key={rp.slug} post={rp} />
              ))}
            </div>
          </section>
        )}

        {/* 면책 */}
        <aside className="post-disclaimer">
          본 문서의 풀이는 전통 해몽 자료를 정리한 참고용 정보이며, 과학적
          사실이 아닙니다. 중요한 판단은 꿈이 아닌 현실의 정보를 근거로
          내리시기 바랍니다.
        </aside>
      </div>
    </article>
  );
}
