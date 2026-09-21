import type { AskLite } from "@/lib/ask";

const tone = (v: string) => (v === "길몽" ? "good" : v === "흉몽" ? "bad" : "mid");

/** 질문 목록 한 페이지 — /ask/list 와 /ask/list/[after] 가 공유 */
export default function AskList({ items, next, isFirst }: { items: AskLite[]; next?: string; isFirst: boolean }) {
  return (
    <div className="container ask-page">
      <header className="ask-hero">
        <h1 className="serif">물어본 꿈 모음</h1>
        <p>방문자들이 직접 적은 꿈과 그 풀이입니다. 제목을 누르면 꿈 내용과 풀이 전체를 볼 수 있습니다.</p>
      </header>

      <section className="ask-cta card">
        <p className="serif">내 꿈도 물어보고 싶다면</p>
        <a href="/ask" className="btn btn-primary">내 꿈 물어보기</a>
      </section>

      {items.length > 0 ? (
        <ul className="ask-recent-list ask-list">
          {items.map((r) => (
            <li key={r.id}>
              <a href={`/ask/${r.id}`} className="ask-recent-item">
                <span className={`ask-verdict ask-verdict-${tone(r.v)}`}>{r.v}</span>
                <span className="ask-recent-title">{r.t}</span>
                <span className="ask-recent-date">{r.d}</span>
                <span className="ask-recent-sum">{r.s}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="ask-empty">아직 물어본 꿈이 없습니다. 첫 번째 질문을 남겨보세요.</p>
      )}

      <nav className="ask-pager" aria-label="목록 이동">
        {!isFirst && <a href="/ask/list" className="btn btn-ghost">처음으로</a>}
        {next && <a href={`/ask/list/${next}`} className="btn btn-ghost">다음 →</a>}
      </nav>
    </div>
  );
}
