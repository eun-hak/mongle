import type { Metadata } from "next";
import AskForm from "./AskForm";
import { getRecentAsks } from "@/lib/ask";
import "./ask.css";

export const revalidate = 3600; // 최근 질문 목록은 공장이 매일 갱신하는 블록에서 읽는다

export const metadata: Metadata = {
  title: "내 꿈 물어보기 — AI 꿈해몽",
  description: "어젯밤 꾼 꿈을 적으면 몽글 사전을 바탕으로 상징과 상황에 맞춘 풀이를 바로 받아볼 수 있습니다.",
  alternates: { canonical: "/ask" },
};

export default async function AskPage() {
  const recent = (await getRecentAsks()).slice(0, 12);
  return (
    <div className="container ask-page">
      <header className="ask-hero">
        <h1 className="serif">내 꿈 물어보기</h1>
        <p>사전에 없는 꿈이어도 괜찮습니다. 꿈 내용을 적으면 몽글 사전 15,000편의 풀이를 바탕으로 상징과 상황을 함께 풀이해 드립니다.</p>
      </header>

      <AskForm />

      {recent.length > 0 && (
        <section className="ask-section ask-recent" aria-labelledby="recent-heading">
          <h2 id="recent-heading" className="serif">다른 분들이 물어본 꿈</h2>
          <ul className="ask-recent-list">
            {recent.map((r) => (
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
        풀이는 전통 해몽 자료를 정리한 참고용 정보이며 과학적 사실이 아닙니다. 건강·법률·금전 등 중요한 판단은 현실의 정보를 근거로 하시기 바랍니다.
        공개된 질문의 삭제를 원하시면 풀이 주소와 함께 소개 페이지의 연락처로 알려주세요.
      </aside>
    </div>
  );
}
