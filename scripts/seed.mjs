// DynamoDB 테이블 생성 + posts.json 적재
// 실행: node --env-file=.env.local scripts/seed.mjs
import {
  DynamoDBClient, CreateTableCommand, DescribeTableCommand, waitUntilTableExists,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, BatchWriteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { readFileSync } from "node:fs";

const TABLE = process.env.DDB_TABLE || "content";
const SITE = "mongle";
const client = new DynamoDBClient({});
const doc = DynamoDBDocumentClient.from(client);

// 1. 테이블 확보
try {
  await client.send(new DescribeTableCommand({ TableName: TABLE }));
  console.log(`테이블 '${TABLE}' 이미 존재`);
} catch (e) {
  if (e.name !== "ResourceNotFoundException") throw e;
  console.log(`테이블 '${TABLE}' 생성 중...`);
  await client.send(new CreateTableCommand({
    TableName: TABLE,
    AttributeDefinitions: [
      { AttributeName: "PK", AttributeType: "S" },
      { AttributeName: "SK", AttributeType: "S" },
    ],
    KeySchema: [
      { AttributeName: "PK", KeyType: "HASH" },
      { AttributeName: "SK", KeyType: "RANGE" },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 25, WriteCapacityUnits: 25 },
  }));
  await waitUntilTableExists({ client, maxWaitTime: 120 }, { TableName: TABLE });
  console.log("테이블 생성 완료 (25 RCU / 25 WCU 프로비저닝 = 프리티어)");
}

// 2. posts.json 적재
const posts = JSON.parse(readFileSync(new URL("../data/posts.json", import.meta.url), "utf8"));
const items = posts.map((p) => ({
  PK: `SITE#${SITE}`,
  SK: `POST#${p.slug}`,
  ...p,
  status: "published",
}));
for (let i = 0; i < items.length; i += 25) {
  await doc.send(new BatchWriteCommand({
    RequestItems: { [TABLE]: items.slice(i, i + 25).map((Item) => ({ PutRequest: { Item } })) },
  }));
}
console.log(`${items.length}편 적재 완료`);

// 3. 검증 조회
const { Items, Count } = await doc.send(new QueryCommand({
  TableName: TABLE,
  KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
  ExpressionAttributeValues: { ":pk": `SITE#${SITE}`, ":sk": "POST#" },
}));
console.log(`검증: PK=SITE#${SITE} 쿼리 → ${Count}건`);
for (const it of Items) console.log(" ", it.SK, "|", it.title, "|", it.category, "| 섹션", it.sections.length);
