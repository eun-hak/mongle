import Link from "next/link";
import "./not-found.css";

export default function NotFound() {
  return (
    <div className="night-bg">
      <div className="container nf-hero">
        <svg
          className="nf-moon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M20.6 14.9A9.2 9.2 0 0 1 9.1 3.4 9.2 9.2 0 1 0 20.6 14.9Z"
            fill="var(--moon)"
          />
          <circle cx="18.2" cy="5.4" r="0.9" fill="var(--moon-soft)" />
          <circle cx="21.2" cy="9.2" r="0.6" fill="var(--moon-soft)" />
        </svg>
        <h1 className="nf-title serif">길을 잃은 꿈이네요</h1>
        <p className="nf-desc">
          찾으시는 페이지가 없거나 다른 곳으로 옮겨졌습니다. 홈에서 다시
          검색하거나, 꿈사전에서 꿈을 찾아보세요.
        </p>
        <div className="nf-actions">
          <Link href="/" className="btn btn-primary">
            홈으로 가기
          </Link>
          <Link href="/index/ㄱ" className="btn nf-btn-ghost">
            꿈사전 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
