import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseSheetTsv } from "./lib/sheet-parser";

const input = process.argv[2];
if (!input) {
  console.error("사용법: npm run sync-sheet -- <시트.tsv>");
  process.exit(1);
}

const tsv = readFileSync(resolve(input), "utf8");
const { shops, issues } = parseSheetTsv(tsv);

if (issues.length > 0) {
  console.error(`검증 실패 ${issues.length}건 — data/shops.json 미변경`);
  for (const i of issues)
    console.error(`  ${i.row}행 [${i.field}] ${i.message}`);
  console.error(`통과 ${shops.length}건은 이슈 해결 후 함께 반영됩니다`);
  process.exit(1);
}

const out = resolve("data/shops.json");
const tmp = `${out}.tmp`;
writeFileSync(tmp, `${JSON.stringify(shops, null, 2)}\n`);
renameSync(tmp, out);
console.log(`data/shops.json 갱신 — 매장 ${shops.length}곳`);
