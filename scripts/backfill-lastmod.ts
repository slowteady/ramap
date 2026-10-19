import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { updateLastmod, type LastmodLedger } from "./lib/lastmod";

/* data/shops.json의 git 이력을 오래된 순으로 재생해 매장별 마지막 실제 변경일을 복원한다(초기 1회용).
   이후 갱신은 sync-sheet가 맡는다. 사용: npx tsx scripts/backfill-lastmod.ts */
const git = (...args: string[]) =>
  execFileSync("git", args, { encoding: "utf8", maxBuffer: 1 << 30 });

const commits = git(
  "log",
  "--reverse",
  "--format=%H %ad",
  "--date=short",
  "--",
  "data/shops.json",
)
  .trim()
  .split("\n")
  .map((l) => l.split(" ") as [string, string]);

let ledger: LastmodLedger = {};
for (const [sha, date] of commits) {
  const shops = JSON.parse(git("show", `${sha}:data/shops.json`)) as {
    id: string;
  }[];
  ledger = updateLastmod(ledger, shops, date);
}
const current = JSON.parse(git("show", "HEAD:data/shops.json")) as {
  id: string;
}[];
ledger = updateLastmod(ledger, current, commits.at(-1)?.[1] ?? "");

writeFileSync(
  resolve("data/shop-lastmod.json"),
  `${JSON.stringify(ledger, null, 2)}\n`,
);
const dates = Object.values(ledger).map((v) => v.date);
const counts = dates.reduce<Record<string, number>>(
  (m, d) => ((m[d] = (m[d] ?? 0) + 1), m),
  {},
);
console.log(`커밋 ${commits.length}개 재생 → 매장 ${dates.length}곳`, counts);
