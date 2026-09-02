import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  matchEnrichment,
  mergeEnrichments,
  toSheetLine,
  toSlug,
  type Enrichment,
} from "./lib/enrich";
import { SHEET_HEADER } from "./lib/sheet-parser";

const [tsvInput, ...jsonInputs] = process.argv.slice(2);
if (!tsvInput || jsonInputs.length === 0) {
  console.error(
    "사용법: npm run enrich-candidates -- <candidates.tsv> <enrichment.json...>",
  );
  process.exit(1);
}

const enrichments: Enrichment[] = jsonInputs.flatMap(
  (p) => JSON.parse(readFileSync(resolve(p), "utf8")) as Enrichment[],
);

const lines = readFileSync(resolve(tsvInput), "utf8")
  .split(/\r?\n/)
  .filter((l) => l.trim() !== "");
const header = lines[0].split("\t");
if (header.join("\t") !== SHEET_HEADER.join("\t")) {
  console.error("candidates.tsv 헤더가 시트 스키마와 다릅니다");
  process.exit(1);
}

type Verdict = "publish" | "hold" | "exclude";

/* 게재 게이트 (2026-09-02 PO 확정): 웹 실존 신호가 있는 매장만 시드에 —
   네이버·카카오에서 검색하면 나오는 수준의 실존성을 담보 */
function verdictOf(
  matches: number,
  e: ReturnType<typeof mergeEnrichments>,
): Verdict {
  if (e.closed) return "exclude";
  if (e.soupDetail?.includes("라멘집 아님")) return "exclude";
  /* 재검증에서 웹 흔적을 다시 못 찾은 매장은 다른 신호가 있어도 보류로 강등 */
  if (e.soupDetail?.includes("실존 미확인")) return "hold";
  const signal =
    (e.soups?.length ?? 0) > 0 ||
    (e.forms?.length ?? 0) > 0 ||
    (e.lineages?.length ?? 0) > 0 ||
    Boolean(e.instagram) ||
    Boolean(e.naverPlace) ||
    (matches > 0 && (e.sourceNote ?? "").includes("디시")) ||
    (matches > 0 && (e.sourceNote ?? "").includes("미디어"));
  return signal ? "publish" : "hold";
}

const taken = new Set<string>();
const out = [SHEET_HEADER.join("\t")];
const held = [SHEET_HEADER.join("\t")];
let tagged = 0;
let closedHints = 0;
let excluded = 0;

for (const line of lines.slice(1)) {
  const values = line.split("\t");
  const cells: Record<string, string> = {};
  SHEET_HEADER.forEach((h, i) => {
    cells[h] = values[i] ?? "";
  });

  const matches = matchEnrichment(cells.상호, cells.지점명, enrichments);
  const e = mergeEnrichments(matches);

  cells.id = toSlug(cells.상호, cells.지점명, taken);
  cells.시 = "서울";
  cells.구 = cells.주소.match(/([가-힣]+구)(?=\s)/)?.[1] ?? "";
  cells.동네라벨 = e.area ?? "";
  cells.스프 = (e.soups ?? []).join(", ") || "기타";
  cells.스프_대표 = e.primarySoup ?? e.soups?.[0] ?? "기타";
  cells.형태 = (e.forms ?? []).join(", ") || "라멘";
  cells.형태_대표 = e.primaryForm ?? e.forms?.[0] ?? "라멘";
  cells.스프_세부 = (e.soupDetail ?? []).join(", ");
  cells.계보 = (e.lineages ?? []).join(", ");
  cells.인스타 = e.instagram ?? "";
  cells.네이버플레이스 = e.naverPlace ?? "";
  cells.오픈일 = e.openedAt ?? "";
  cells.영업시간 = e.hours ?? "";
  if (matches.length > 0) tagged += 1;
  if (e.closed) {
    closedHints += 1;
    cells.메모 = [cells.메모, "폐업 의심(디깅 소스) — 확인 필요"]
      .filter(Boolean)
      .join(" / ");
  }
  if (e.sourceNote)
    cells.정보출처 = `${cells.정보출처}; ${e.sourceNote}`.slice(0, 200);

  let verdict = verdictOf(matches.length, e);
  if (verdict === "publish" && (!cells.lat || !cells.lng)) verdict = "hold";
  if (verdict === "exclude") {
    excluded += 1;
  } else if (verdict === "hold") {
    held.push(toSheetLine(cells));
  } else {
    out.push(toSheetLine(cells));
  }
}

const dest = resolve("data/out/seed.tsv");
writeFileSync(dest, `${out.join("\n")}\n`);
const heldDest = resolve("data/out/held.tsv");
writeFileSync(heldDest, `${held.join("\n")}\n`);
console.log(
  `후보 ${lines.length - 1}건 → 게재 ${out.length - 1} / 보류(실존 미확인) ${held.length - 1} / 제외(폐업·비라멘) ${excluded}`,
);
console.log(
  `게재분 ${dest} · 보류분 ${heldDest} (보강 매칭 ${tagged}건, 폐업 의심 ${closedHints}건)`,
);
