import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CHOSUNG, getAllPosts, getChosung } from "@/lib/posts";
import "./index.css";

// 새 글 반영: 1시간 주기 재생성
export const revalidate = 3600;

interface IndexPageProps {
  params: Promise<{ group: string }>;
}

export function generateStaticParams() {
  return CHOSUNG.map((group) => ({ group }));
}

export async function generateMetadata({
  params,
}: IndexPageProps): Promise<Metadata> {
  const { group } = await params;
  const chosung = decodeURIComponent(group);
  if (!(CHOSUNG as readonly string[]).includes(chosung)) {
    return { title: "색인을 찾을 수 없습니다" };
  }
  return {
    title: `꿈사전 ‘${chosung}’ — 초성으로 찾는 꿈 풀이`,
    description: `‘${chosung}’으로 시작하는 꿈 해몽 항목과 세부 질문을 가나다순으로 모았습니다.`,
  };
}

export default async function IndexGroupPage({ params }: IndexPageProps) {
  const { group } = await params;
  const chosung = decodeURIComponent(group);
  if (!(CHOSUNG as readonly string[]).includes(chosung)) notFound();

  const entries = (await getAllPosts())
    .filter((post) => getChosung(post.title) === chosung)
    .sort((a, b) => a.title.localeCompare(b.title, "ko"))
    .map((post) => ({
      post,
      subs: post.variants.filter((v) => getChosung(v) === chosung),
    }));

  return (
    <div className="container">
      <header className="idx-head">
        <h1 className="idx-head-title serif">꿈사전</h1>
        <p className="idx-head-desc">
          찾고 싶은 꿈의 첫 글자 초성을 눌러 항목을 살펴보세요.
        </p>
      </header>

      <nav className="idx-tabs" aria-label="초성 색인 탭">
        <ul className="idx-tabs-list">
          {CHOSUNG.map((c) => (
            <li key={c}>
              <Link
                href={`/index/${c}`}
                aria-current={c === chosung ? "page" : undefined}
              >
                {c}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <h2 className="idx-section-title serif">
        <span className="idx-group-mark">‘{chosung}’</span>으로 시작하는 꿈
      </h2>

      {entries.length > 0 ? (
        <ul className="idx-list">
          {entries.map(({ post, subs }) => (
            <li key={post.slug} className="idx-entry">
              <div className="idx-entry-head">
                <span className="idx-entry-emoji" aria-hidden="true">
                  {post.emoji}
                </span>
                <h3 className="idx-entry-title serif">
                  <Link href={`/${post.slug}`}>{post.title}</Link>
                </h3>
                <span className="badge">{post.category}</span>
              </div>
              <p className="idx-entry-intro">{post.intro}</p>
              {subs.length > 0 && (
                <div className="idx-subs">
                  <p className="idx-subs-label">세부 질문</p>
                  <ul className="idx-subs-list">
                    {subs.map((variant) => (
                      <li key={variant}>
                        <Link href={`/${post.slug}`}>{variant}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="idx-empty card">
          <span className="idx-empty-emoji" aria-hidden="true">
            🌙
          </span>
          <p className="idx-empty-title serif">해당 항목 준비 중</p>
          <p className="idx-empty-desc">
            ‘{chosung}’으로 시작하는 꿈 항목은 아직 정리 중입니다. 위의 다른
            초성을 눌러 보세요.
          </p>
        </div>
      )}
    </div>
  );
}
