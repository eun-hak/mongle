import type { Metadata } from "next";
import "./terms.css";

export const metadata: Metadata = {
  title: "이용약관",
  description:
    "몽글 이용약관입니다. 서비스의 성격, 콘텐츠 이용 조건, 면책 사항을 안내합니다.",
};

export default function TermsPage() {
  return (
    <div className="terms-page">
      <h1 className="terms-title serif">이용약관</h1>
      <p className="terms-date">시행일: 2026년 8월 1일</p>

      <div className="card terms-card">
        <section>
          <h2>제1조 (목적)</h2>
          <p>
            본 약관은 몽글(이하 &ldquo;본 사이트&rdquo;)이 제공하는 꿈해몽 정보
            서비스의 이용 조건과 운영에 관한 기본적인 사항을 규정함을 목적으로
            합니다.
          </p>
        </section>

        <section>
          <h2>제2조 (서비스의 성격)</h2>
          <p>
            본 사이트는 전통 해몽 자료와 실제 검색 질문 데이터를 바탕으로 꿈
            풀이 정보를 정리하여 무료로 제공하는 정보 서비스입니다. 회원가입
            없이 누구나 이용할 수 있습니다.
          </p>
        </section>

        <section>
          <h2>제3조 (콘텐츠의 이용)</h2>
          <ul>
            <li>
              본 사이트의 모든 콘텐츠는 개인적인 참고 목적으로 자유롭게 열람할
              수 있습니다.
            </li>
            <li>
              콘텐츠를 출처 표기 없이 무단 복제, 전재, 재배포하거나 상업적으로
              이용하는 것은 금지됩니다.
            </li>
            <li>
              인용 시에는 출처(몽글)와 해당 페이지 링크를 함께 표기해 주시기
              바랍니다.
            </li>
          </ul>
        </section>

        <section>
          <h2>제4조 (면책 사항)</h2>
          <ul>
            <li>
              본 사이트의 해몽 풀이는 전통 해몽 자료를 정리한{" "}
              <strong>참고용 정보이며, 과학적 사실이 아닙니다</strong>.
            </li>
            <li>
              해몽 내용은 개인의 판단을 대신할 수 없으며, 재정·건강·법률 등
              중요한 결정은 반드시 현실의 정보와 전문가의 조언을 근거로 내리시기
              바랍니다.
            </li>
            <li>
              본 사이트는 콘텐츠의 이용으로 발생한 어떠한 결과에 대해서도 법적
              책임을 지지 않습니다.
            </li>
          </ul>
        </section>

        <section>
          <h2>제5조 (광고 게재)</h2>
          <p>
            본 사이트는 무료 서비스 운영을 위해 제3자 광고(Google AdSense 등)를
            게재할 수 있습니다. 광고를 통한 거래는 이용자와 해당 광고주 간의
            문제이며, 본 사이트는 이에 관여하지 않습니다.
          </p>
        </section>

        <section>
          <h2>제6조 (서비스의 변경과 중단)</h2>
          <p>
            본 사이트는 사전 고지 없이 콘텐츠를 추가·수정·삭제하거나 서비스의
            일부 또는 전부를 변경·중단할 수 있습니다.
          </p>
        </section>

        <section>
          <h2>제7조 (약관의 변경)</h2>
          <p>
            본 약관이 변경되는 경우 본 페이지를 통해 공지하며, 공지 이후에도
            서비스를 계속 이용하는 경우 변경된 약관에 동의한 것으로 봅니다.
          </p>
        </section>
      </div>
    </div>
  );
}
