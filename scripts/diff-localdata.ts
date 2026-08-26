import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseLocalData } from "./lib/localdata";
import { diffLocalData } from "./lib/localdata-diff";

const [prevPath, nextPath] = process.argv.slice(2);
if (!prevPath || !nextPath) {
  console.error("사용법: npm run diff-localdata -- <이전.csv> <최신.csv>");
  process.exit(1);
}

const prev = parseLocalData(readFileSync(resolve(prevPath), "utf8"));
const next = parseLocalData(readFileSync(resolve(nextPath), "utf8"));
const { opened, closed } = diffLocalData(prev, next);

console.log(`신규 오픈 후보 ${opened.length}건 / 폐업 전이 ${closed.length}건`);
for (const r of opened) console.log(`  [신규] ${r.name} — ${r.roadAddress}`);
for (const r of closed) console.log(`  [폐업] ${r.name} — ${r.roadAddress}`);
if (closed.length > 0) console.log("폐업은 시트 상태를 '폐업'으로 변경 후 sync-sheet 실행 (2차 확인 불요 — 행정 데이터)");
