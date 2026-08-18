import { cache } from "react";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

/* ---------- 타입 (데이터 계약) ---------- */

export type CategoryName =
  | "동물꿈"
  | "사람꿈"
  | "신체꿈"
  | "사물꿈"
  | "자연꿈"
  | "상황꿈"
  | "태몽";

export interface PostSection {
  /** 영문 kebab-case 앵커 id */
  id: string;
  heading: string;
  body: string;
}

export interface PostFaq {
  q: string;
  a: string;
}

export interface Post {
  /** 한글 slug, 예: "뱀꿈" */
  slug: string;
  /** 짧은 명칭, 예: "뱀꿈" */
  title: string;
  /** H1용 긴 제목 */
  headline: string;
  category: CategoryName;
  emoji: string;
  /** 2-3문장 도입부 */
  intro: string;
  /** 예: "2026-08-01" */
  updated: string;
  sections: PostSection[];
  faq: PostFaq[];
  /** 관련 글 slug 목록 */
  related: string[];
  /** 검색용 변형 질문/표현 */
  variants: string[];
}

/** 목록용 슬림 글 — 본문(sections/faq)을 제외한 필드만.
 *  LIST#<slug> 아이템으로 별도 저장되어 목록 페이지가 파티션의
 *  본문 전체를 읽지 않게 한다 (RCU 스로틀 방지). */
export type PostMeta = Omit<Post, "sections" | "faq" | "related">;

export interface CategoryInfo {
  name: CategoryName;
  emoji: string;
  slug: string;
  description: string;
}

/* ---------- 카테고리 상수 (7종) ---------- */

export const CATEGORIES: CategoryInfo[] = [
  {
    name: "동물꿈",
    emoji: "🐍",
    slug: "동물꿈",
    description: "뱀, 돼지, 호랑이 등 동물이 나오는 꿈의 전통 풀이를 모았습니다.",
  },
  {
    name: "사람꿈",
    emoji: "👥",
    slug: "사람꿈",
    description: "가족, 연인, 죽은 사람 등 사람이 등장하는 꿈의 의미를 정리했습니다.",
  },
  {
    name: "신체꿈",
    emoji: "🦷",
    slug: "신체꿈",
    description: "이빨, 머리카락, 피 등 몸과 관련된 꿈의 풀이를 다룹니다.",
  },
  {
    name: "사물꿈",
    emoji: "👟",
    slug: "사물꿈",
    description: "신발, 돈, 열쇠 등 물건이 나오는 꿈의 상징을 해설합니다.",
  },
  {
    name: "자연꿈",
    emoji: "🌊",
    slug: "자연꿈",
    description: "물, 불, 산, 하늘 등 자연 현상이 나오는 꿈의 의미를 모았습니다.",
  },
  {
    name: "상황꿈",
    emoji: "🚗",
    slug: "상황꿈",
    description: "쫓기거나 떨어지는 등 특정 상황을 겪는 꿈의 풀이를 정리했습니다.",
  },
  {
    name: "태몽",
    emoji: "👶",
    slug: "태몽",
    description: "임신과 출산을 암시한다고 전해지는 태몽의 상징을 다룹니다.",
  },
];

/* ---------- 데이터 접근 (DynamoDB) ----------
 * 테이블: content — PK="SITE#<사이트>", SK="POST#<slug>"
 * ISR 캐시 뒤에서만 호출되므로 실제 읽기는 페이지 생성 시 1회 수준.
 */

const SITE = process.env.SITE_ID ?? "mongle";
const TABLE = process.env.DDB_TABLE ?? "content";
const PK = `SITE#${SITE}`;

// Vercel은 AWS_* 이름을 예약어로 막으므로 APP_AWS_* 이름을 우선 사용
const region =
  process.env.APP_AWS_REGION ?? process.env.AWS_REGION ?? "ap-northeast-2";
const accessKeyId =
  process.env.APP_AWS_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey =
  process.env.APP_AWS_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY;

const doc = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region,
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
  })
);

/** DynamoDB 아이템에서 내부 키를 제거하고 Post로 변환 */
function toPost(item: Record<string, unknown>): Post {
  const { PK: _pk, SK: _sk, status: _status, ...rest } = item;
  return rest as unknown as Post;
}

/** 발행 상태인 글만 노출 (review/draft는 공장 검수 전이므로 숨김) */
function isPublished(item: Record<string, unknown>): boolean {
  return (item.status ?? "published") === "published";
}

/** 전체 글의 목록용 슬림 아이템(LIST#) 조회 — 같은 렌더 안에서는 React cache로 중복 호출 제거.
 *  LIST# 는 발행(published) 시에만 기록되므로 status 필터가 필요 없다.
 *  본문 포함 전체 조회(구 getAllPosts)는 25 RCU 테이블에서 스로틀을 일으켜 제거했다. */
export const getAllPostMetas = cache(async (): Promise<PostMeta[]> => {
  const items: Record<string, unknown>[] = [];
  let ExclusiveStartKey: Record<string, unknown> | undefined;
  do {
    const res = await doc.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: { ":pk": PK, ":sk": "LIST#" },
      ExclusiveStartKey,
    }));
    items.push(...(res.Items ?? []));
    ExclusiveStartKey = res.LastEvaluatedKey as typeof ExclusiveStartKey;
  } while (ExclusiveStartKey);
  return items.map((item) => {
    const { PK: _pk, SK: _sk, naverSubmitted: _ns, ...rest } = item;
    return rest as unknown as PostMeta;
  });
});

/* ---------- 사전집계 블록 (공장 rebuild_blocks.py가 기록) ----------
 * 목록 페이지가 LIST# 전체 스캔(2,400건+ ≈ 3MB) 대신 블록 1~2개만 읽어
 * 25 RCU 프리티어에서 스로틀 없이 동작하게 한다. */

interface LiteMeta { s: string; t: string; h: string; e: string; i: string; c: string; u: string; v: number }

function liteToMeta(l: LiteMeta): PostMeta {
  return {
    slug: l.s, title: l.t, headline: l.h, emoji: l.e, intro: l.i,
    category: l.c as CategoryName, updated: l.u,
    variants: new Array<string>(l.v ?? 0).fill(""), // 목록은 개수만 필요
  };
}

const getBlock = cache(async (sk: string): Promise<any | null> => {
  const { Item } = await doc.send(new GetCommand({ TableName: TABLE, Key: { PK, SK: sk } }));
  return Item?.b ? JSON.parse(Item.b as string) : null;
});

const getBlocksByPrefix = cache(async (prefix: string): Promise<any[]> => {
  const out: any[] = [];
  let ExclusiveStartKey: Record<string, unknown> | undefined;
  do {
    const res = await doc.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: { ":pk": PK, ":sk": prefix },
      ExclusiveStartKey,
    }));
    for (const it of res.Items ?? []) if (it.b) out.push(JSON.parse(it.b as string));
    ExclusiveStartKey = res.LastEvaluatedKey as typeof ExclusiveStartKey;
  } while (ExclusiveStartKey);
  return out;
});

/** 최신 100편 (홈·RSS) */
export const getRecentMetas = cache(async (): Promise<PostMeta[]> => {
  const b = await getBlock("BLOCK#RECENT");
  return (b?.metas ?? []).map(liteToMeta);
});

/** 검색창용 전체 제목 목록 */
export const getSearchTitles = cache(async (): Promise<{ slug: string; title: string; category: string }[]> => {
  const blocks = await getBlocksByPrefix("BLOCK#TITLES#");
  return blocks.flatMap((b) => (b.items ?? []).map((x: any) => ({ slug: x.s, title: x.t, category: x.c })));
});

/** 카테고리 페이지: 최신순 상위 + 전체 개수 */
export async function getCategoryBlock(name: string): Promise<{ metas: PostMeta[]; total: number }> {
  const b = await getBlock(`BLOCK#CAT#${name}`);
  return { metas: (b?.metas ?? []).map(liteToMeta), total: b?.total ?? 0 };
}

/** 초성 색인: 해당 초성의 표제어 + 세부질문 일부 */
export async function getIndexGroup(g: string): Promise<{ slug: string; title: string; emoji: string; category: string; intro: string; subs: string[] }[]> {
  const b = await getBlock(`BLOCK#IDX#${g}`);
  return (b?.entries ?? []).map((x: any) => ({
    slug: x.s, title: x.t, emoji: x.e ?? "🌙", category: x.c ?? "", intro: x.i ?? "", subs: x.vs ?? [],
  }));
}

/** 사이트맵: 슬러그+날짜 전체 */
export async function getSitemapEntries(): Promise<{ slug: string; updated: string }[]> {
  const blocks = await getBlocksByPrefix("BLOCK#SITEMAP#");
  return blocks.flatMap((b) => (b.entries ?? []).map((x: any) => ({ slug: x.s, updated: x.u })));
}

export async function getPost(slug: string): Promise<Post | undefined> {
  const { Item } = await doc.send(new GetCommand({
    TableName: TABLE,
    Key: { PK, SK: `POST#${slug}` },
  }));
  return Item && isPublished(Item) ? toPost(Item) : undefined;
}

export async function getPostsByCategory(name: string): Promise<PostMeta[]> {
  return (await getAllPostMetas()).filter((p) => p.category === name);
}

/* ---------- 초성 유틸 ---------- */

/** 색인에 쓰는 초성 14자 (쌍자음은 평음으로 합침) */
export const CHOSUNG = [
  "ㄱ",
  "ㄴ",
  "ㄷ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅅ",
  "ㅇ",
  "ㅈ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
] as const;

const CHOSUNG_FULL = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

const DOUBLE_TO_PLAIN: Record<string, string> = {
  "ㄲ": "ㄱ",
  "ㄸ": "ㄷ",
  "ㅃ": "ㅂ",
  "ㅆ": "ㅅ",
  "ㅉ": "ㅈ",
};

/**
 * 단어 첫 글자의 초성을 반환한다 (쌍자음은 평음으로).
 * 한글 음절이 아니면 첫 글자를 그대로 반환한다.
 */
export function getChosung(word: string): string {
  const ch = word.charAt(0);
  const code = ch.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return ch;
  const cho = CHOSUNG_FULL[Math.floor((code - 0xac00) / 588)];
  return DOUBLE_TO_PLAIN[cho] ?? cho;
}
