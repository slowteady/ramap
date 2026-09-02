import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { decodeCsvBuffer } from "./lib/csv";
import type { Enrichment } from "./lib/enrich";
import { isRamenCandidate, parseLocalData } from "./lib/localdata";
import {
  candidatesToSheetTsv,
  discoverByName,
  mergeCandidates,
} from "./lib/merge-candidates";
import { isRamenBySanggwon, parseSanggwon } from "./lib/sanggwon";

const [localInput, sangInput, ...enrichInputs] = process.argv.slice(2);
if (!localInput) {
  console.error(
    "사용법: npm run seed-candidates -- <인허가.csv> [상가정보.csv] [디깅.json...]",
  );
  process.exit(1);
}

const localCsv = decodeCsvBuffer(readFileSync(resolve(localInput)));
const localAll = parseLocalData(localCsv);
const localRows = localAll.filter(isRamenCandidate);
console.log(
  `인허가 ${localAll.length}건 → 영업 중 라멘 후보 ${localRows.length}건`,
);

let sangRows: ReturnType<typeof parseSanggwon> = [];
if (sangInput) {
  const sangCsv = decodeCsvBuffer(readFileSync(resolve(sangInput)));
  const sangAll = parseSanggwon(sangCsv);
  sangRows = sangAll.filter(isRamenBySanggwon);
  console.log(`상가정보 ${sangAll.length}건 → 라멘 후보 ${sangRows.length}건`);
}

const merged = mergeCandidates(localRows, sangRows);

/* 디깅 소스의 가게명을 인허가 전체에서 직접 조회 — 키워드·업종 둘 다 놓친
   2자 상호 명점(담택·류진 등)을 발굴하는 마지막 그물 */
if (enrichInputs.length > 0) {
  const names = enrichInputs
    .flatMap(
      (p) => JSON.parse(readFileSync(resolve(p), "utf8")) as Enrichment[],
    )
    .map((e) => e.name);
  const found = discoverByName(merged, localAll, names);
  console.log(`디깅 이름 발굴: 후보 풀 밖에서 ${found}건 추가`);
}

const bySource = new Map<string, number>();
for (const c of merged) {
  const key = c.sources.join("+");
  bySource.set(key, (bySource.get(key) ?? 0) + 1);
}
const mismatches = merged.filter((c) => c.coordMismatch).length;

mkdirSync(resolve("data/out"), { recursive: true });
const out = resolve("data/out/candidates.tsv");
writeFileSync(out, candidatesToSheetTsv(merged));

console.log(`\n병합 후보 ${merged.length}건 → ${out}`);
for (const [key, count] of [...bySource.entries()].sort((a, b) => b[1] - a[1]))
  console.log(`  ${key}: ${count}`);
if (mismatches > 0) console.log(`  좌표 불일치 플래그: ${mismatches}건`);
console.log("파트너 시트에 붙여넣고 태깅 후 sync-sheet로 반영하세요");
