import type { Metadata } from "next";
import "./about.css";

export const metadata: Metadata = {
  title: "소개",
  description:
    "몽글은 실제 검색 질문 데이터를 기반으로 전통 해몽 자료를 정리한 사전형 꿈해몽 레퍼런스 사이트입니다.",
};

export default function AboutPage() {
  return (
    <div className="about-page">
      <h1 className="about-title serif">몽글 소개</h1>
      <p className="about-lead">
        몽글은 블로그가 아니라, 꿈 풀이를 표제어 단위로 정리한
        사전형 레퍼런스 사이트입니다.
      </p>

      <div className="card about-card">
        <h2 className="serif">어떤 사이트인가요</h2>
        <p>
          몽글은 실제 검색 질문 데이터를 기반으로 전통 해몽 자료를
          정리한 사전입니다. 사람들이 실제로 궁금해하는 꿈 — 뱀꿈, 이빨 빠지는
          꿈, 돈 줍는 꿈 같은 질문에서 출발해, 각 꿈을 하나의 표제어로 삼아
          상황별 풀이를 한 페이지에 모았습니다.
        </p>
        <p>
          시간순으로 글이 쌓이는 블로그와 달리, 모든 문서는 표제어·상황별
          풀이·자주 묻는 질문·관련 표제어로 이어지는 동일한 구조를 따릅니다.
          필요한 꿈을 검색하거나 꿈사전에서 찾아 바로 확인할 수 있습니다.
        </p>
      </div>

      <div className="card about-card">
        <h2 className="serif">데이터는 어디에서 오나요</h2>
        <p>
          표제어 선정에는 사람들이 실제로 입력한 대규모 검색 질문 데이터를
          활용합니다. 어떤 꿈을 얼마나 많이, 어떤 표현으로 묻는지를 분석해
          수요가 확인된 꿈부터 문서로 만들고, 같은 꿈을 가리키는 다양한 질문
          표현을 함께 수록해 검색으로 쉽게 닿을 수 있도록 했습니다.
        </p>
        <p>
          풀이 내용은 오랫동안 전해 내려온 전통 해몽 자료와 민간에서 통용되는
          해석을 표제어별로 모아 정리한 것입니다. 특정 개인의 창작 해석이
          아니라, 널리 알려진 풀이를 비교·정리하는 데 초점을 두고 있습니다.
        </p>
      </div>

      <div className="card about-card">
        <h2 className="serif">콘텐츠 원칙</h2>
        <ul className="about-principles">
          <li>
            모든 풀이는 전통 해몽 자료를 정리한 <strong>참고용 정보</strong>이며,
            과학적으로 검증된 사실이 아닙니다.
          </li>
          <li>
            같은 꿈이라도 길몽과 흉몽 해석이 함께 전해지는 경우, 한쪽만
            단정하지 않고 두 해석을 모두 소개합니다.
          </li>
          <li>
            꿈 풀이를 근거로 한 의료·법률·투자 판단을 권하지 않으며, 중요한
            결정은 반드시 해당 분야 전문가와 상의하시기 바랍니다.
          </li>
          <li>
            잘못된 내용이나 보완이 필요한 풀이가 발견되면 문서를 수시로
            갱신하며, 각 문서에 최근 수정일을 표기합니다.
          </li>
        </ul>
      </div>

      <p className="about-note">
        본 사이트의 모든 해몽 풀이는 재미와 참고를 위한 것입니다. 꿈의 의미는
        사람마다, 상황마다 다르게 받아들여질 수 있다는 점을 기억해 주세요.
      </p>
    </div>
  );
}
