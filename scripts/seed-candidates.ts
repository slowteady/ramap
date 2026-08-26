import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { isRamenCandidate, parseLocalData, toSheetTsv } from "./lib/localdata";

const input = process.argv[2];
if (!input) {
  console.error("사용법: npm run seed-candidates -- <localdata.csv>");
  process.exit(1);
}

const rows = parseLocalData(readFileSync(resolve(input), "utf8"));
const candidates = rows.filter(isRamenCandidate);

mkdirSync(resolve("data/out"), { recursive: true });
const out = resolve("data/out/candidates.tsv");
writeFileSync(out, toSheetTsv(candidates));
console.log(`전체 ${rows.length}건 → 라멘 후보 ${candidates.length}건 → ${out}`);
console.log("파트너 시트에 붙여넣고 태깅 후 sync-sheet로 반영하세요");
