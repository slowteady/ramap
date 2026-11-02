import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import dayjs from "dayjs";
import {
  classifyExistence,
  selectExistenceTargets,
  type EvidenceSearch,
  type ExistenceVerdict,
} from "./lib/existence";

const LEDGER = resolve("data/existence-checks.json");
const VERDICT_LABEL: Record<ExistenceVerdict, string> = {
  card: "존재(장소 카드)",
  recent: "존재(최근 후기)",
  stale: "보류 권고(옛 후기만)",
  none: "보류 권고(근거 없음)",
};

type Shop = {
  id: string;
  name: string;
  branch: string | null;
  address: string;
  status: string;
  hours: string | null;
  menus: unknown[] | null;
  instagram: string | null;
};
type LedgerEntry = {
  checkedAt: string;
  verdict: string;
  lastEvidence: string | null;
};
type Ledger = Record<string, LedgerEntry>;

function readTsv(path: string): Record<string, string>[] {
  if (!existsSync(path)) return [];
  const [head, ...lines] = readFileSync(path, "utf8")
    .split(/\r?\n/)
    .filter((l) => l.trim());
  const cols = head.split("\t");
  return lines.map((l) => {
    const v = l.split("\t");
    return Object.fromEntries(cols.map((c, i) => [c, v[i] ?? ""]));
  });
}

const readLedger = (): Ledger =>
  existsSync(LEDGER)
    ? (JSON.parse(readFileSync(LEDGER, "utf8")) as Ledger)
    : {};
const readShops = (): Shop[] =>
  JSON.parse(readFileSync(resolve("data/shops.json"), "utf8")) as Shop[];
const displayName = (s: Shop) => `${s.name} ${s.branch ?? ""}`.trim();

function targets(reviewDir: string, rotation: number) {
  const dir = resolve(reviewDir);
  const shops = readShops();
  const gone = [
    ...readTsv(join(dir, "refresh-unmatched.tsv")),
    ...readTsv(join(dir, "refresh-closed.tsv")).filter(
      (r) => r["게재"] === "Y",
    ),
  ].map((r) => ({
    name: r["상호"],
    branch: r["지점명"] ?? "",
    address: r["주소"],
  }));
  const ledger = readLedger();
  const recentCutoff = dayjs().subtract(180, "day").format("YYYY-MM-DD");
  const weak = selectExistenceTargets(shops, gone).filter(
    (s) => (ledger[s.id]?.checkedAt ?? "") < recentCutoff,
  );
  const picked = new Set(weak.map((s) => s.id));
  const rotated = shops
    .filter((s) => s.status === "open" && !picked.has(s.id))
    .sort((a, b) =>
      (ledger[a.id]?.checkedAt ?? "").localeCompare(
        ledger[b.id]?.checkedAt ?? "",
      ),
    )
    .slice(0, rotation);
  const all = [
    ...weak.map((s) => ({ shop: s, reason: "근거 약함·인허가 미발견" })),
    ...rotated.map((s) => ({ shop: s, reason: "순환 재확인" })),
  ];
  const out = join(dir, "existence");
  mkdirSync(out, { recursive: true });
  writeFileSync(
    join(out, "refresh-closed.tsv"),
    `${[
      "상호\t지점명\t주소\t게재\t폐업일자\t관리번호\t같은건물영업중",
      ...all.map(({ shop: s }) =>
        [s.name, s.branch ?? "", s.address, "Y", "", "", ""].join("\t"),
      ),
    ].join("\n")}\n`,
  );
  writeFileSync(
    join(out, "targets.json"),
    `${JSON.stringify(
      all.map(({ shop: s, reason }) => ({
        id: s.id,
        name: displayName(s),
        address: s.address,
        reason,
      })),
      null,
      2,
    )}\n`,
  );
  console.log(
    `존재 재검증 대상 ${all.length}곳 (근거 약함·인허가 미발견 ${weak.length} · 순환 ${rotated.length}) → ${out}/refresh-closed.tsv`,
  );
}

function classify(reviewDir: string, evidencePath: string, today: string) {
  const dir = resolve(reviewDir);
  const list = JSON.parse(
    readFileSync(join(dir, "existence", "targets.json"), "utf8"),
  ) as {
    id: string;
    name: string;
    address: string;
    reason: string;
  }[];
  const evidence = JSON.parse(readFileSync(resolve(evidencePath), "utf8")) as {
    targets: { name: string; address: string; searches: EvidenceSearch[] }[];
  };
  const cutoff = dayjs(today).subtract(12, "month").format("YYYY-MM-DD");
  const rows = list.map((t) => {
    const ev = evidence.targets.find(
      (e) => e.name === t.name && e.address === t.address,
    );
    const result = ev
      ? classifyExistence(t.address, ev.searches, cutoff)
      : { verdict: "none" as const, lastDate: null };
    return { ...t, ...result };
  });
  const counts = Object.fromEntries(
    (Object.keys(VERDICT_LABEL) as ExistenceVerdict[]).map((v) => [
      VERDICT_LABEL[v],
      rows.filter((r) => r.verdict === v).length,
    ]),
  );
  writeFileSync(
    join(dir, "existence-verify.tsv"),
    `${[
      "id\t상호\t주소\t대상 사유\t기계 판정\t마지막 근거일\t최종 판정\t근거(직접 확인)",
      ...rows.map((r) =>
        [
          r.id,
          r.name,
          r.address,
          r.reason,
          VERDICT_LABEL[r.verdict],
          r.lastDate ?? "",
          "",
          "",
        ].join("\t"),
      ),
    ].join("\n")}\n`,
  );
  console.log(
    `기준일 ${cutoff} 이후 근거 · ${JSON.stringify(counts)} → ${dir}/existence-verify.tsv`,
  );
  console.log(
    "보류 권고 행은 수집 원문을 직접 읽고 '최종 판정'·'근거(직접 확인)'을 채운다",
  );
}

function record(reviewDir: string, today: string) {
  const rows = readTsv(join(resolve(reviewDir), "existence-verify.tsv"));
  const ledger = readLedger();
  let n = 0;
  for (const r of rows) {
    const verdict = r["최종 판정"] || r["기계 판정"];
    ledger[r["id"]] = {
      checkedAt: today,
      verdict,
      lastEvidence: r["마지막 근거일"] || null,
    };
    n += 1;
  }
  const sorted = Object.fromEntries(
    Object.entries(ledger).sort(([a], [b]) => a.localeCompare(b)),
  );
  writeFileSync(LEDGER, `${JSON.stringify(sorted, null, 2)}\n`);
  console.log(`data/existence-checks.json 갱신 — ${n}곳 기록`);
}

const [command, reviewDir, ...rest] = process.argv.slice(2);
const today = dayjs().format("YYYY-MM-DD");
if (command === "targets" && reviewDir)
  targets(reviewDir, Number(rest[0] ?? 20));
else if (command === "classify" && reviewDir && rest[0])
  classify(reviewDir, rest[0], rest[1] ?? today);
else if (command === "record" && reviewDir) record(reviewDir, rest[0] ?? today);
else {
  console.error(
    [
      "사용법:",
      "  npm run check-existence -- targets <리뷰폴더> [순환 수=20]",
      "  npm run check-existence -- classify <리뷰폴더> <증거.json> [기준일]",
      "  npm run check-existence -- record <리뷰폴더> [확인일]",
    ].join("\n"),
  );
  process.exit(1);
}
