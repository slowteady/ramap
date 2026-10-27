import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  diffShops,
  sharedInstagram,
  type IntegrityShop,
} from "./lib/integrity";

/* 데이터 신뢰도 감사 — 재생성 전후 장르·계보·인스타 변경과 지점 간 인스타 공유를 리포트한다.
   사용: npm run audit-integrity [-- <기준 shops.json=git HEAD>] */
const [basePath] = process.argv.slice(2);
const before = JSON.parse(
  basePath
    ? readFileSync(resolve(basePath), "utf8")
    : execFileSync("git", ["show", "HEAD:data/shops.json"], {
        encoding: "utf8",
        maxBuffer: 64 << 20,
      }),
) as IntegrityShop[];
const after = JSON.parse(
  readFileSync(resolve("data/shops.json"), "utf8"),
) as IntegrityShop[];

const label = (s: IntegrityShop) =>
  `${s.name}${s.branch ? ` ${s.branch}` : ""}`;
const show = (v: unknown) =>
  Array.isArray(v) ? v.join("/") || "-" : (v ?? "-");
const { changed, removed, added } = diffShops(before, after);
const shared = sharedInstagram(after);
const byId = new Map(after.map((s) => [s.id, s]));
const lineageChanged = changed.filter((c) => c.fields.includes("lineages"));

const lines = [
  "# 데이터 신뢰도 감사",
  "",
  `- 변경 ${changed.length}곳 (계보 ${lineageChanged.length}) · 소실 ${removed.length} · 신규 ${added.length} · 인스타 공유 그룹 ${shared.length}`,
  "- 판정 기준: `.claude/skills/data-integrity/SKILL.md`",
  "",
  "## 소실 (게재 → 비게재) — 사유 확인 필수",
  "",
  ...removed.map((s) => `- ${s.id} ${label(s)} · ${s.address ?? ""}`),
  "",
  "## 계보 변경 — 필터·계보 페이지에 직접 반영, 근거 확인 필수",
  "",
  ...lineageChanged.map(
    (c) =>
      `- ${c.id} ${label(c.after)}: ${show(c.before.lineages)} → ${show(c.after.lineages)}`,
  ),
  "",
  "## 장르·인스타 변경",
  "",
  "| id | 매장 | 항목 | 이전 | 이후 |",
  "|---|---|---|---|---|",
  ...changed.flatMap((c) =>
    c.fields
      .filter((f) => f !== "lineages")
      .map(
        (f) =>
          `| ${c.id} | ${label(c.after)} | ${f} | ${show(c.before[f])} | ${show(c.after[f])} |`,
      ),
  ),
  "",
  "## 주소가 다른 매장끼리 같은 인스타 — 체인 공식 계정이 아니면 오염 의심",
  "",
  ...shared.map(
    (g) =>
      `- ${g.handle}: ${g.ids.map((id) => label(byId.get(id)!)).join(", ")}`,
  ),
];
const dest = resolve("data/out/integrity-report.md");
writeFileSync(dest, `${lines.join("\n")}\n`);
console.log(lines[2].slice(2));
console.log(`리포트 ${dest}`);
