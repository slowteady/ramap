import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { areaLabelOf, inheritNearestArea } from "./lib/area-label";
import {
  matchEnrichment,
  mergeEnrichments,
  mergeMatched,
  promoteSoups,
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
const outRows: Record<string, string>[] = [];
const heldRows: Record<string, string>[] = [];
/* 검수 큐: 주소 판정과 디깅 라벨이 다른 매장 — 검색 검증 배치의 입력 */
const areaConflicts = ["상호\t지점명\t주소판정\t디깅라벨\t주소"];
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
  const e = promoteSoups(mergeMatched(cells.상호, cells.지점명, matches));

  cells.id = toSlug(cells.상호, cells.지점명, taken);
  cells.시 = "서울";
  cells.구 = cells.주소.match(/([가-힣]+구)(?=\s)/)?.[1] ?? "";
  /* 검색 확증 라벨 > 주소(공공데이터) 판정 > 미확증 디깅 라벨 — 확증 없는 충돌은 검수 큐로 */
  const addrArea = areaLabelOf(cells.주소, cells.구);
  cells.동네라벨 =
    (e.areaConfirmed ? e.area : null) ?? addrArea ?? e.area ?? "";
  if (!e.areaConfirmed && e.area && addrArea && e.area !== addrArea)
    areaConflicts.push(
      [cells.상호, cells.지점명, addrArea, e.area, cells.주소].join("\t"),
    );
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
  cells.브레이크 = e.breakTime ?? "";
  cells.휴무 = e.closedDays ?? "";
  cells.좌석 = e.seats ?? "";
  (e.menus ?? []).slice(0, 3).forEach((m, i) => {
    cells[`대표메뉴${i + 1}`] = m;
  });
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
  /* 위치가 불확실한 매장은 보류 (2026-09-02 PO: 확실하지 않으면 보류) */
  if (verdict === "publish" && (e.sourceNote ?? "").includes("주소 상이"))
    verdict = "hold";
  if (verdict === "exclude") {
    excluded += 1;
  } else if (verdict === "hold") {
    heldRows.push(cells);
  } else {
    outRows.push(cells);
  }
}

/* 사전 미적중(괄호 동 없는 주소)은 게재분 내 최근접 상권 상속 */
const withArea = inheritNearestArea(
  outRows.map((cells) => ({
    cells,
    lat: cells.lat ? Number(cells.lat) : null,
    lng: cells.lng ? Number(cells.lng) : null,
    areaLabel: cells.동네라벨 || null,
  })),
);
for (const row of withArea) row.cells.동네라벨 = row.areaLabel ?? "";
const unlabeled = withArea.filter((r) => !r.areaLabel).length;
if (unlabeled > 0) console.log(`동네라벨 미부여 ${unlabeled}건 (구 폴백 노출)`);

const out = [
  SHEET_HEADER.join("\t"),
  ...outRows.map((cells) => toSheetLine(cells)),
];
const held = [
  SHEET_HEADER.join("\t"),
  ...heldRows.map((cells) => toSheetLine(cells)),
];

const dest = resolve("data/out/seed.tsv");
writeFileSync(dest, `${out.join("\n")}\n`);
writeFileSync(
  resolve("data/out/area-review.tsv"),
  `${areaConflicts.join("\n")}\n`,
);
if (areaConflicts.length > 1)
  console.log(
    `동네라벨 충돌 ${areaConflicts.length - 1}건 → data/out/area-review.tsv (검색 검증 대상)`,
  );
const heldDest = resolve("data/out/held.tsv");
writeFileSync(heldDest, `${held.join("\n")}\n`);
console.log(
  `후보 ${lines.length - 1}건 → 게재 ${out.length - 1} / 보류(실존 미확인) ${held.length - 1} / 제외(폐업·비라멘) ${excluded}`,
);
console.log(
  `게재분 ${dest} · 보류분 ${heldDest} (보강 매칭 ${tagged}건, 폐업 의심 ${closedHints}건)`,
);
