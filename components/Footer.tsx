import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <p className="footer-disclaimer">
          본 사이트의 해몽 풀이는 전통 해몽 자료를 정리한 참고용 정보이며, 과학적
          사실이 아닙니다.
        </p>
        <div className="footer-links">
          <Link href="/about">소개</Link>
          <Link href="/terms">이용약관</Link>
          <Link href="/privacy">개인정보처리방침</Link>
        </div>
        <p className="footer-copy">© 2026 몽글</p>
      </div>
    </footer>
  );
}
