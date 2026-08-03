import Link from "next/link";

export default function Header() {
  return (
    <header className="site-header night-bg">
      <div className="container">
        <Link href="/" className="logo serif" aria-label="몽글 홈으로">
          <svg
            width="22"
            height="22"
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
          몽글
          <span className="logo-tag">꿈사전</span>
        </Link>
        <nav className="site-nav" aria-label="주요 메뉴">
          <Link href="/">홈</Link>
          <Link href="/index/ㄱ">꿈사전</Link>
          <Link href="/about">소개</Link>
        </nav>
      </div>
    </header>
  );
}
