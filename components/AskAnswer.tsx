import type { AskAnswer as Answer } from "@/lib/ask";

/** 질문 풀이 본문 — 질문 화면(즉시 결과)과 공개 페이지(/ask/[id])가 같은 모양으로 쓴다 */
export default function AskAnswer({ q, a }: { q: string; a: Answer }) {
  const tone = a.verdict === "길몽" ? "good" : a.verdict === "흉몽" ? "bad" : "mid";
  return (
    <div className="ask-answer">
      <blockquote className="ask-q card">
        <span className="ask-q-label">꿈 내용</span>
        <p>{q}</p>
      </blockquote>

      <div className="ask-verdict-row">
        <span className={`ask-verdict ask-verdict-${tone}`}>{a.verdict}</span>
        <p className="ask-summary">{a.summary}</p>
      </div>

      <section className="ask-section">
        <h2 className="serif">꿈에 나온 상징</h2>
        <dl className="ask-symbols">
          {a.symbols.map((s) => (
            <div key={s.name} className="ask-symbol">
              <dt>{s.name}</dt>
              <dd>{s.meaning}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="ask-section">
        <h2 className="serif">상황을 함께 보면</h2>
        <p>{a.situation}</p>
      </section>

      <section className="ask-section ask-advice card">
        <h2 className="serif">참고할 점</h2>
        <p>{a.advice}</p>
      </section>
    </div>
  );
}
