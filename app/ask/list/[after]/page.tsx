import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AskList from "@/components/AskList";
import { listAsks } from "@/lib/ask";
import "../../ask.css";

interface Props { params: Promise<{ after: string }> }

/** 커서형 다음 페이지 — /ask/list/<직전 페이지 마지막 id>. 경로형이라 페이지마다 ISR 캐시된다 */
export const revalidate = 3600;
export const dynamicParams = true;
export function generateStaticParams() { return []; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { after } = await params;
  return {
    title: "물어본 꿈 모음 — 이어서 보기",
    description: "방문자들이 직접 적은 꿈과 몽글의 풀이를 최신순으로 모았습니다.",
    alternates: { canonical: `/ask/list/${after}` },
  };
}

export default async function AskListAfterPage({ params }: Props) {
  const { after } = await params;
  if (!/^\d{8}-[0-9a-f]{8}$/.test(after)) notFound();
  const { items, next } = await listAsks(after);
  return <AskList items={items} next={next} isFirst={false} />;
}
