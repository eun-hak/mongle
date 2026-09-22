"use client";

import { useEffect, useRef, useState } from "react";
import AskAnswer from "@/components/AskAnswer";
import type { AskAnswer as Answer } from "@/lib/ask";

interface Related { slug: string; title: string; emoji: string; category: string; intro: string }
interface Result { id: string; url: string; status: string; answer: Answer; related: Related[] }

const MIN = 20, MAX = 500;
const STEPS = ["꿈에 나온 상징을 찾는 중…", "몽글 사전에서 관련 풀이를 읽는 중…", "상황에 맞춰 풀이를 쓰는 중…"];

export default function AskForm() {
  const [dream, setDream] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const opened = useRef(Date.now());

  useEffect(() => {
    if (!busy) return;
    setStep(0);
    const id = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 2500);
    return () => clearInterval(id);
  }, [busy]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError(null); setResult(null); setBusy(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dream, website: fd.get("website") ?? "", t: Date.now() - opened.current }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setError(data.error ?? "잠시 후 다시 시도해 주세요."); return; }
      setResult(data);
      setTimeout(() => document.getElementById("ask-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch {
      setError("연결이 불안정합니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  const n = dream.trim().length;

  return (
    <>
      <form className="ask-form card" onSubmit={submit}>
        <label htmlFor="dream" className="ask-label serif">어젯밤 어떤 꿈을 꾸셨나요?</label>
        <p className="ask-hint">누가 나왔는지, 무슨 일이 있었는지, 어떤 기분이었는지 적어 주시면 풀이가 정확해집니다.</p>
        <textarea
          id="dream" name="dream" value={dream} onChange={(e) => setDream(e.target.value)}
          maxLength={MAX} rows={5} required disabled={busy}
          placeholder="예) 집에 큰 뱀이 들어와서 무서웠는데, 제가 손으로 잡아서 밖으로 내보냈어요. 잡고 나니 마음이 이상하게 편안했어요."
        />
        {/* 허니팟: 사람에겐 보이지 않고 봇만 채운다 */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="ask-hp" aria-hidden="true" />
        <div className="ask-form-foot">
          <span className={`ask-count ${n < MIN ? "ask-count-low" : ""}`}>{n} / {MAX}자{n > 0 && n < MIN ? ` (${MIN}자 이상)` : ""}</span>
          <button type="submit" className="btn btn-primary" disabled={busy || n < MIN}>
            {busy ? "풀이 중…" : "풀이 받기"}
          </button>
        </div>
        <p className="ask-notice">
          작성한 꿈과 풀이는 <strong>몽글에 공개</strong>되어 다른 방문자도 볼 수 있습니다. 이름·연락처 등 개인정보는 적지 마세요.
          하루 2번까지 물어볼 수 있습니다.
        </p>
      </form>

      {busy && (
        <div className="ask-loading card" role="status" aria-live="polite">
          <span className="ask-loading-moon" aria-hidden="true">🌙</span>
          <p>{STEPS[step]}</p>
          <p className="ask-loading-sub">보통 5~10초 걸립니다</p>
        </div>
      )}

      {error && <p className="ask-error" role="alert">{error}</p>}

      {result && (
        <div id="ask-result" className="ask-result">
          <AskAnswer q={dream.trim()} a={result.answer} />
          {result.related.length > 0 && (
            <section className="ask-section">
              <h2 className="serif">사전에서 더 읽기</h2>
              <div className="related-grid">
                {result.related.map((r) => (
                  <a key={r.slug} href={`/${r.slug}`} className="card post-card">
                    <div className="pc-head"><span className="pc-emoji" aria-hidden="true">{r.emoji}</span><span className="badge">{r.category}</span></div>
                    <h3 className="pc-title serif">{r.title}</h3>
                    <p className="pc-intro">{r.intro}</p>
                  </a>
                ))}
              </div>
            </section>
          )}
          <p className="ask-permalink">
            이 풀이의 주소: <a href={result.url}>mongle.plentyer.com{result.url}</a>
            {result.status === "pending" && " (오늘 공개 한도가 차서 내일 목록에 올라갑니다)"}
          </p>
        </div>
      )}
    </>
  );
}
