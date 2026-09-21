import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AskAnswer from "@/components/AskAnswer";
import PostCard from "@/components/PostCard";
import { getAsk, getRecentAsks } from "@/lib/ask";
import { getPostMetasBySlugs } from "@/lib/posts";
import "../ask.css";

interface Props { params: Promise<{ id: string }> }

/** 질문 페이지는 생성 직후 첫 방문 때 ISR로 만들어지고, 하단 "다른 분들이 물어본 꿈"이 돌도록 1시간 주기로 갱신된다 */
export const revalidate = 3600;
export const dynamicParams = true;
export function generateStaticParams() { return []; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = await getAsk(id);
  if (!item || item.status === "blocked") return {};
  const title = `${item.a.title} — 꿈 질문과 풀이`;
  return {
    title,
    description: item.a.summary,
    alternates: { canonical: `/ask/${item.id}` },
    robots: item.status === "public" ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { type: "article", title, description: item.a.summary, url: `/ask/${item.id}`, publishedTime: item.createdAt },
  };
}

export default async function AskDetailPage({ params }: Props) {
  const { id } = await params;
  const item = await getAsk(id);
  if (!item || item.status === "blocked") notFound();

  const [related, recent] = await Promise.all([
    item.related.length ? getPostMetasBySlugs(item.related) : Promise.resolve([]),
    getRecentAsks(),
  ]);
  const others = recent.filter((r) => r.id !== item.id).slice(0, 6);

  const qaLd = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: item.a.title,
      text: item.q,
      dateCreated: item.createdAt,
      answerCount: 1,
      acceptedAnswer: {
        "@type": "Answer",
        text: [item.a.summary, item.a.situation, item.a.advice].join(" "),
        dateCreated: item.createdAt,
        author: { "@type": "Organization", name: "몽글" },
      },
    },
  };

  return (
    <article className="container ask-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(qaLd) }} />
      <nav className="post-crumb" aria-label="현재 위치">
        <ol>
          <li><a href="/">홈</a></li>
          <li className="crumb-sep" aria-hidden="true">›</li>
          <li><a href="/ask">꿈 질문</a></li>
          <li className="crumb-sep" aria-hidden="true">›</li>
          <li aria-current="page">{item.a.title}</li>
        </ol>
      </nav>

      <h1 className="ask-h1 serif">{item.a.title}</h1>
      <p className="ask-meta">{item.day} · 방문자 질문 · AI 풀이</p>

      <AskAnswer q={item.q} a={item.a} />

      {related.length > 0 && (
        <section className="ask-section" aria-labelledby="rel-heading">
          <h2 id="rel-heading" className="serif">사전에서 더 읽기</h2>
          <div className="related-grid">{related.map((p) => <PostCard key={p.slug} post={p} />)}</div>
        </section>
      )}

      <section className="ask-cta card">
        <p className="serif">나도 꿈을 꿨는데, 사전에 없다면?</p>
        <a href="/ask" className="btn btn-primary">내 꿈 물어보기</a>
      </section>

      {others.length > 0 && (
        <section className="ask-section ask-recent" aria-labelledby="others-heading">
          <h2 id="others-heading" className="serif">다른 분들이 물어본 꿈 <a href="/ask/list" className="ask-more">모두 보기 →</a></h2>
          <ul className="ask-recent-list">
            {others.map((r) => (
              <li key={r.id}>
                <a href={`/ask/${r.id}`} className="ask-recent-item">
                  <span className={`ask-verdict ask-verdict-${r.v === "길몽" ? "good" : r.v === "흉몽" ? "bad" : "mid"}`}>{r.v}</span>
                  <span className="ask-recent-title">{r.t}</span>
                  <span className="ask-recent-sum">{r.s}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <aside className="post-disclaimer">
        이 풀이는 방문자가 적은 꿈을 전통 해몽 자료의 관점에서 AI가 정리한 참고용 정보이며 과학적 사실이 아닙니다.
        중요한 판단은 현실의 정보를 근거로 하시기 바랍니다. 이 페이지의 삭제를 원하시면 주소(/ask/{item.id})와 함께 소개 페이지의 연락처로 알려주세요.
      </aside>
    </article>
  );
}
