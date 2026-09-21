import { createHash, randomBytes } from "crypto";
import { cache } from "react";
import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { doc, TABLE, getBlocksByPrefix, getPostMetasBySlugs, type PostMeta } from "@/lib/posts";
import TOPICS from "@/lib/dream-topics.json";

/* ---------- 꿈 질문 (사용자 입력 → AI 풀이 → 공개 아카이브) ----------
 * 저장은 사이트 파티션(SITE#mongle)과 분리된 ASK#mongle 파티션에 둔다 —
 * 목록 스캔이 글 파티션에 섞이면 25 RCU 공유 테이블에서 스로틀이 난다(2026-09 사고).
 *   PK=ASK#mongle  SK=Q#<id>           질문·풀이·상태
 *   PK=ASK#mongle  SK=RATE#<ip>#<day>  IP별 일일 횟수 (상한 DAILY_PER_IP)
 *   PK=ASK#mongle  SK=COUNT#<day>      하루 공개 발행 수 (상한 DAILY_PUBLISH_CAP, 넘으면 pending)
 * 공개 목록·사이트맵 블록(BLOCK#ASK#*)은 공장 rebuild_blocks.py가 매일 재계산한다. */

export const ASK_PK = "ASK#mongle";
export const DAILY_PER_IP = 2;        // 로그인이 없으므로 IP 기준
export const DAILY_PUBLISH_CAP = 700; // D-rank 안전선 안 (지식나래 붕괴는 5,000/일)
export const MIN_LEN = 20;
export const MAX_LEN = 500;

export type Verdict = "길몽" | "흉몽" | "중립";
export interface AskAnswer {
  title: string;                       // 페이지 제목용 요약 (12~28자)
  verdict: Verdict;
  summary: string;
  symbols: { name: string; meaning: string }[];
  situation: string;
  advice: string;
}
export type AskStatus = "public" | "pending" | "blocked";
export interface AskItem {
  id: string;
  q: string;
  a: AskAnswer;
  topics: string[];
  related: string[];
  status: AskStatus;
  createdAt: string;
  day: string;
  model: string;
}
export interface AskLite { id: string; t: string; v: Verdict; s: string; d: string }

/* ---------- 입력 검증 ---------- */
const SENSITIVE = ["자살", "살인마", "강간", "성폭행", "마약", "근친", "섹스", "성관계", "자위", "야동", "야한", "음란", "성기"];
const PERSONAL = [
  /\d{2,3}-?\d{3,4}-?\d{4}/,          // 전화번호
  /\d{6}-?[1-4]\d{6}/,                // 주민번호
  /[\w.+-]+@[\w-]+\.[\w.]+/,          // 이메일
  /https?:\/\/|www\./i,               // 링크
];

export function validateQuestion(raw: unknown): { ok: true; q: string } | { ok: false; error: string } {
  if (typeof raw !== "string") return { ok: false, error: "꿈 내용을 입력해 주세요." };
  const q = raw.replace(/\s+/g, " ").trim();
  if (q.length < MIN_LEN) return { ok: false, error: `꿈 내용을 ${MIN_LEN}자 이상 적어 주세요. 누가 나왔고 무슨 일이 있었는지 알려주시면 풀이가 정확해집니다.` };
  if (q.length > MAX_LEN) return { ok: false, error: `${MAX_LEN}자 이내로 줄여 주세요.` };
  if (!/[가-힣]{2,}/.test(q)) return { ok: false, error: "한국어로 적어 주세요." };
  if (PERSONAL.some((re) => re.test(q))) return { ok: false, error: "전화번호·이메일·링크는 넣을 수 없습니다. 꿈 내용만 적어 주세요." };
  if (SENSITIVE.some((w) => q.includes(w))) return { ok: false, error: "죄송합니다, 이 주제는 풀이해 드리기 어렵습니다. 힘든 상황이라면 가까운 사람이나 전문 상담(109)에 이야기해 보세요." };
  return { ok: true, q };
}

/* ---------- IP·일일 카운터 ---------- */
export function kstDay(d = new Date()): string {
  return new Date(d.getTime() + 9 * 3600_000).toISOString().slice(0, 10);
}
export function hashIp(ip: string): string {
  const salt = process.env.REVALIDATE_SECRET ?? "mongle";
  return createHash("sha256").update(`${ip}:${salt}`).digest("hex").slice(0, 16);
}

/** 원자적 카운터 — 상한 미만일 때만 +1. 넘으면 false. */
async function bumpCounter(sk: string, max: number): Promise<boolean> {
  try {
    await doc.send(new UpdateCommand({
      TableName: TABLE,
      Key: { PK: ASK_PK, SK: sk },
      UpdateExpression: "ADD n :one SET #ttl = if_not_exists(#ttl, :ttl)",   // ttl 은 DynamoDB 예약어
      ConditionExpression: "attribute_not_exists(n) OR n < :max",
      ExpressionAttributeNames: { "#ttl": "ttl" },
      ExpressionAttributeValues: { ":one": 1, ":max": max, ":ttl": Math.floor(Date.now() / 1000) + 3 * 86400 },
    }));
    return true;
  } catch (e: any) {
    if (e?.name === "ConditionalCheckFailedException") return false;
    throw e;
  }
}
export const checkIpQuota = (ipHash: string, day: string) => bumpCounter(`RATE#${ipHash}#${day}`, DAILY_PER_IP);
export const claimPublishSlot = (day: string) => bumpCounter(`COUNT#${day}`, DAILY_PUBLISH_CAP);

/* ---------- 주제 매칭 (사전 글을 풀이 근거로) ---------- */
// 주제어 목록에는 '마음'·'이상'처럼 꿈의 상징이 아닌 일반어도 섞여 있다(허브 편성표 유래). 매칭에서 뺀다.
const GENERIC = new Set(["마음", "이상", "기분", "생각", "느낌", "사람", "자신", "정말", "그냥", "이유", "우리", "모습", "소리", "자기",
  "친구", "가족", "얼굴", "시간", "하루", "오늘", "어제", "내일", "아침", "저녁", "이야기", "상황", "장면", "무서움", "공포", "행복",
  "슬픔", "기억", "현실", "세상", "인생", "문제", "관계", "감정", "의미", "경험", "순간", "이후", "다음", "처음", "마지막"]);
const TOPIC_LIST = (TOPICS as string[]).filter((t) => t.replace(/\s/g, "").length >= 2 && !GENERIC.has(t)); // 긴 것부터 정렬돼 있음

export async function matchTopics(q: string, limit = 3): Promise<{ topics: string[]; metas: PostMeta[] }> {
  const flat = q.replace(/\s/g, "");
  const topics: string[] = [];
  for (const t of TOPIC_LIST) {
    const key = t.replace(/\s/g, "");
    if (flat.includes(key) && !topics.some((x) => x.replace(/\s/g, "").includes(key))) topics.push(t);
    if (topics.length >= limit) break;
  }
  const metas = topics.length ? await getPostMetasBySlugs(topics.map((t) => `${t.replace(/\s/g, "")}꿈`)) : [];
  return { topics, metas };
}

/* ---------- Gemini ---------- */
// 두 모델 모두 무료 일 500회. 공장(batch_daily)은 3.1을 주로 쓰므로 질문 풀이는 3.5를 먼저 쓴다.
const MODELS = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];
const BANNED = ["과학적으로 증명", "반드시 이루어집니다", "100%", "치료를 중단", "로또 번호", "당첨 번호"];

const SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "질문을 요약한 짧은 제목. 12~28자, 반드시 '꿈'으로 끝남. 예: '전 남자친구가 결혼식에 나타난 꿈'" },
    verdict: { type: "string", enum: ["길몽", "흉몽", "중립"] },
    summary: { type: "string", description: "핵심 풀이 2~3문장 (80~160자). 첫 문장에 길흉 판단과 이유." },
    symbols: {
      type: "array",
      description: "꿈에 나온 상징 2~5개. 질문에 실제로 등장한 것만.",
      items: { type: "object", properties: { name: { type: "string" }, meaning: { type: "string", description: "전통 해몽에서의 의미 2문장 (60~140자)" } }, required: ["name", "meaning"] },
    },
    situation: { type: "string", description: "질문자의 구체 상황(누가, 어떤 행동, 결말, 감정)에 맞춘 종합 풀이 5~7문장 (250~450자). 상징의 조합이 무엇을 뜻하는지." },
    advice: { type: "string", description: "현실에서 참고할 조언 2~3문장 (80~160자). 단정하지 않는 어조." },
  },
  required: ["title", "verdict", "summary", "symbols", "situation", "advice"],
};

function buildPrompt(q: string, metas: PostMeta[]): string {
  const refs = metas.map((m) => `- ${m.title}: ${m.intro}${m.variants?.length ? ` (자주 묻는 상황: ${m.variants.slice(0, 6).join(", ")})` : ""}`).join("\n");
  return `너는 꿈해몽 사전 '몽글'의 편집자다. 방문자가 적은 꿈을 전통 해몽 자료의 관점으로 풀이한다.

# 규칙
- 존댓말. 질문자에게 직접 말하듯 쓰되 과장 없이 차분하게.
- 질문에 실제로 나온 요소만 다룬다. 없는 내용을 지어내지 않는다.
- symbols 에는 사물·동물·사람·장소·행동만 넣는다. 감정·느낌·부사("이상", "무서움")는 상징이 아니다.
- 길흉은 단정하지 않는다 ("~로 풀이됩니다", "~로 보는 경우가 많습니다").
- 건강·정신 상태 진단, 의료·법률 조언, 특정인 실명 언급, 로또·복권 번호, 성적 묘사는 금지.
- 아래 참고 자료(몽글 사전)가 있으면 그 풀이와 어긋나지 않게 쓰고, 질문자의 상황에 맞춰 구체화한다.
- 분량: summary 80~160자, symbols 각 60~140자, situation 250~450자, advice 80~160자.

# 참고 자료 (몽글 사전)
${refs || "(해당 없음 — 일반적인 전통 해몽 관점으로 풀이)"}

# 방문자의 꿈
${q}`;
}

async function callGemini(model: string, prompt: string): Promise<AskAnswer> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY 없음");
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema: SCHEMA, temperature: 0.8 },
    }),
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) throw new Error(`${model} HTTP ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(`${model} 빈 응답`);
  const a = JSON.parse(text) as AskAnswer;
  validateAnswer(a);
  return a;
}

function validateAnswer(a: AskAnswer) {
  const errs: string[] = [];
  if (!a.title || a.title.length < 6 || a.title.length > 40) errs.push("title");
  if (!["길몽", "흉몽", "중립"].includes(a.verdict)) errs.push("verdict");
  if (!a.summary || a.summary.length < 40) errs.push("summary");
  if (!Array.isArray(a.symbols) || a.symbols.length < 1 || a.symbols.length > 6) errs.push("symbols");
  if (!a.situation || a.situation.length < 120) errs.push("situation");
  if (!a.advice || a.advice.length < 30) errs.push("advice");
  const all = [a.summary, a.situation, a.advice, ...(a.symbols ?? []).map((s) => s.meaning)].join(" ");
  if (BANNED.some((b) => all.includes(b))) errs.push("banned");
  if (errs.length) throw new Error(`검증 실패: ${errs.join(",")}`);
  if (!a.title.endsWith("꿈")) a.title = a.title.replace(/[.。]$/, "") + " 꿈";
}

export async function interpret(q: string, metas: PostMeta[]): Promise<{ a: AskAnswer; model: string }> {
  const prompt = buildPrompt(q, metas);
  let lastErr: unknown;
  for (const model of MODELS) {
    try {
      return { a: await callGemini(model, prompt), model };
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

/* ---------- 저장·조회 ---------- */
export function newId(): string {
  return `${kstDay().replace(/-/g, "")}-${randomBytes(4).toString("hex")}`;
}

export async function putAsk(item: AskItem & { ip: string }) {
  await doc.send(new PutCommand({ TableName: TABLE, Item: { PK: ASK_PK, SK: `Q#${item.id}`, ...item } }));
}

export async function getAsk(id: string): Promise<AskItem | undefined> {
  if (!/^\d{8}-[0-9a-f]{8}$/.test(id)) return undefined;
  const { Item } = await doc.send(new GetCommand({ TableName: TABLE, Key: { PK: ASK_PK, SK: `Q#${id}` } }));
  if (!Item) return undefined;
  const { PK: _p, SK: _s, ip: _ip, ...rest } = Item;
  return rest as AskItem;
}

/** 최근 공개 질문 — 질문 파티션을 최신순(SK=Q#<날짜>-…)으로 직접 읽는다.
 *  공장 블록(BLOCK#ASK#RECENT)은 하루 한 번이라 새 질문이 정오까지 안 보였다.
 *  40건 × ~3KB ≈ 5 RCU, 페이지가 ISR 캐시라 실제 읽기는 시간당 1회 수준. */
export const getRecentAsks = cache(async (limit = 12): Promise<AskLite[]> => {
  const res = await doc.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :q)",
    ExpressionAttributeValues: { ":pk": ASK_PK, ":q": "Q#" },
    ScanIndexForward: false,
    Limit: 40,
  }));
  return (res.Items ?? [])
    .filter((i) => i.status === "public" && i.a)
    .slice(0, limit)
    .map((i) => ({ id: i.id, t: i.a.title, v: i.a.verdict, s: String(i.a.summary).slice(0, 90), d: i.day }));
});

/** 전체 목록 (커서 페이지네이션) — afterId 다음부터 최신순 limit 건.
 *  경로형 커서(/ask/list/<id>)라 페이지마다 ISR 캐시가 된다. */
export async function listAsks(afterId?: string, limit = 30): Promise<{ items: AskLite[]; next?: string }> {
  const res = await doc.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: "PK = :pk AND begins_with(SK, :q)",
    FilterExpression: "#s = :pub",
    ExpressionAttributeNames: { "#s": "status" },
    ExpressionAttributeValues: { ":pk": ASK_PK, ":q": "Q#", ":pub": "public" },
    ScanIndexForward: false,
    Limit: limit,
    ...(afterId && /^\d{8}-[0-9a-f]{8}$/.test(afterId) ? { ExclusiveStartKey: { PK: ASK_PK, SK: `Q#${afterId}` } } : {}),
  }));
  const items = (res.Items ?? []).filter((i) => i.a).map((i) => ({
    id: i.id, t: i.a.title, v: i.a.verdict as Verdict, s: String(i.a.summary).slice(0, 90), d: i.day,
  }));
  const lastKey = res.LastEvaluatedKey?.SK as string | undefined;
  return { items, next: lastKey ? lastKey.slice(2) : undefined };
}

export async function getAskSitemapEntries(): Promise<{ id: string; d: string }[]> {
  const blocks = await getBlocksByPrefix("BLOCK#ASK#SITEMAP#");
  return blocks.flatMap((b) => b.entries ?? []);
}
