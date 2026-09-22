import type { Metadata } from "next";
import AskList from "@/components/AskList";
import { listAsks } from "@/lib/ask";
import "../ask.css";

export const revalidate = 3600; // 새 질문이 생기면 API가 즉시 갱신, 그 외엔 1시간

export const metadata: Metadata = {
  title: "물어본 꿈 모음 — 방문자 꿈 질문과 AI 풀이",
  description: "방문자들이 직접 적은 꿈과 몽글의 풀이를 최신순으로 모았습니다.",
  alternates: { canonical: "/ask/list" },
};

export default async function AskListPage() {
  const { items, next } = await listAsks();
  return <AskList items={items} next={next} isFirst />;
}
