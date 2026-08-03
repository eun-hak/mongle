import type { Metadata } from "next";
import "./privacy.css";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description:
    "몽글의 개인정보처리방침입니다. 수집하는 개인정보 항목, 쿠키 및 광고 관련 안내를 확인하실 수 있습니다.",
};

export default function PrivacyPage() {
  return (
    <div className="privacy-page">
      <h1 className="privacy-title serif">개인정보처리방침</h1>
      <p className="privacy-date">시행일: 2026년 8월 1일</p>

      <div className="card privacy-card">
        <section>
          <h2>1. 개요</h2>
          <p>
            몽글(이하 &ldquo;본 사이트&rdquo;)은 이용자의 개인정보를
            소중히 여기며, 관련 법령을 준수합니다. 본 방침은 본 사이트가 어떤
            정보를 수집하고 어떻게 이용하는지를 안내합니다.
          </p>
        </section>

        <section>
          <h2>2. 수집하는 개인정보</h2>
          <p>
            본 사이트는 회원가입, 댓글, 문의 양식 등 이용자가 직접 개인정보를
            입력하는 기능을 제공하지 않으며, 이름·이메일·연락처 등{" "}
            <strong>개인정보를 직접 수집하지 않습니다</strong>.
          </p>
        </section>

        <section>
          <h2>3. 쿠키 및 웹 로그 분석</h2>
          <p>
            본 사이트는 서비스 개선을 위해 방문 통계 분석 도구(예: Google
            Analytics 등)를 사용할 수 있습니다. 이 과정에서 쿠키를 통해
            방문 일시, 브라우저 종류, 대략적인 지역 등{" "}
            <strong>개인을 식별할 수 없는 통계 정보</strong>가 자동으로 수집될
            수 있습니다.
          </p>
          <p>
            이용자는 브라우저 설정에서 쿠키 저장을 거부하거나 삭제할 수
            있으며, 쿠키를 거부해도 본 사이트의 콘텐츠 이용에는 제한이
            없습니다.
          </p>
        </section>

        <section>
          <h2>4. 광고 서비스와 광고 쿠키</h2>
          <p>
            본 사이트는 Google 애드센스(AdSense) 등 제3자 광고 서비스를 게재할
            수 있습니다. 제3자 광고 사업자는 광고 쿠키를 사용하여 이용자의 본
            사이트 및 다른 웹사이트 방문 기록을 바탕으로 맞춤 광고를 제공할 수
            있습니다.
          </p>
          <ul>
            <li>
              Google은 광고 쿠키를 사용해 이용자의 관심사에 기반한 광고를
              게재할 수 있습니다.
            </li>
            <li>
              이용자는 Google 광고 설정(adssettings.google.com)에서 맞춤 광고를
              해제할 수 있습니다.
            </li>
            <li>
              본 사이트는 광고 사업자가 수집한 정보에 접근하거나 이를 별도로
              저장하지 않습니다.
            </li>
          </ul>
        </section>

        <section>
          <h2>5. 개인정보의 제3자 제공</h2>
          <p>
            본 사이트는 개인정보를 직접 수집하지 않으므로 이를 제3자에게
            제공하지 않습니다. 다만 위 4항의 광고·분석 도구는 각 사업자의
            개인정보처리방침에 따라 운영됩니다.
          </p>
        </section>

        <section>
          <h2>6. 방침의 변경</h2>
          <p>
            본 방침의 내용이 추가·삭제·수정될 경우 본 페이지를 통해
            공지합니다. 본 방침은 2026년 8월 1일부터 시행됩니다.
          </p>
        </section>
      </div>
    </div>
  );
}
