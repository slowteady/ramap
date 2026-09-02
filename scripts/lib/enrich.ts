import { romanize } from "es-hangul";
import { normalizeShopName } from "./merge-candidates";
import { SHEET_HEADER } from "./sheet-parser";

/* 조사·디깅 산출물(JSON) 스키마 — name 정규화 매칭으로 후보 TSV에 병합 */
export type Enrichment = {
  name: string;
  area?: string;
  soups?: string[];
  primarySoup?: string;
  forms?: string[];
  primaryForm?: string;
  soupDetail?: string[];
  lineages?: string[];
  instagram?: string;
  naverPlace?: string;
  openedAt?: string;
  hours?: string;
  closed?: boolean;
  sourceNote?: string;
};

const SLUG_MAX = 40;

export function toSlug(
  name: string,
  branch: string,
  taken: Set<string>,
): string {
  const base =
    romanize(name + (branch ? `-${branch}` : ""))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, SLUG_MAX) || "shop";
  let slug = base;
  let n = 2;
  while (taken.has(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  taken.add(slug);
  return slug;
}

export function matchEnrichment(
  name: string,
  branch: string,
  enrichments: Enrichment[],
): Enrichment[] {
  /* 접두 일치만 — 중간 포함은 "로지라멘"⊂"오로지라멘" 류 오매칭을 낳는다 (2026-09-02 실측) */
  const norm = normalizeShopName(name + branch);
  return enrichments.filter((e) => {
    const en = normalizeShopName(e.name);
    if (!en || !norm) return false;
    if (en === norm) return true;
    const [shorter, longer] =
      en.length <= norm.length ? [en, norm] : [norm, en];
    return shorter.length >= 3 && longer.startsWith(shorter);
  });
}

/* 반복 실증된 세부 스타일의 표준 승격 — 토마토(2026-09-02, 서울 21곳 실측 후 PO 확정) */
const SOUP_PROMOTIONS: Record<string, string> = {
  토마토: "토마토",
  토마토라멘: "토마토",
};

/* 조사 산출물의 세부 표기 이형 통일 — 상세 화면 노출을 위한 정규화 */
const SOUP_DETAIL_ALIASES: Record<string, string> = {
  아부라라멘: "아부라소바",
  "아부라소바·파이탄": "아부라소바",
  나가사키라멘: "나가사키",
  나가사키짬뽕: "나가사키",
  카레라멘: "카레",
  유즈라멘: "유즈",
  유즈시오: "유즈",
  유즈토리시오: "유즈",
  쿠로라멘: "구로마유",
  쿠로이: "구로마유",
  블랙라멘: "구로마유",
  마라라멘: "마라",
  마라멘: "마라",
  시루나시탄탄멘: "시루나시",
  "시지미(조개)": "시지미",
  시지미라멘: "시지미",
  카라멘: "카라이",
  "카모(오리) 육수": "카모",
  카모파이탄: "카모",
};

const LINEAGE_PROMOTIONS: Record<string, string> = {
  지로라멘: "지로계",
};

/* 스타일이 아닌 운영 메모는 세부에서 제외 (겸업 등) — 시트 메모 컬럼 몫 */
function isOperationalNote(d: string): boolean {
  return d.includes("겸업") || d === "퓨전" || d === "한식 퓨전";
}

export function promoteSoups(e: Enrichment): Enrichment {
  const raw = e.soupDetail ?? [];
  const promoted = [
    ...new Set(raw.map((d) => SOUP_PROMOTIONS[d]).filter(Boolean)),
  ] as string[];
  const lineagePromoted = [
    ...new Set(raw.map((d) => LINEAGE_PROMOTIONS[d]).filter(Boolean)),
  ] as string[];
  const detail = [
    ...new Set(
      raw
        .filter(
          (d) =>
            !SOUP_PROMOTIONS[d] &&
            !LINEAGE_PROMOTIONS[d] &&
            !isOperationalNote(d),
        )
        .map((d) => SOUP_DETAIL_ALIASES[d] ?? d),
    ),
  ];
  return {
    ...e,
    soups:
      promoted.length > 0
        ? [...new Set([...(e.soups ?? []), ...promoted])]
        : e.soups,
    lineages:
      lineagePromoted.length > 0
        ? [...new Set([...(e.lineages ?? []), ...lineagePromoted])]
        : e.lineages,
    soupDetail: detail,
  };
}

export function mergeEnrichments(matches: Enrichment[]): Enrichment {
  const merged: Enrichment = { name: matches[0]?.name ?? "" };
  for (const e of matches) {
    merged.soups = [...new Set([...(merged.soups ?? []), ...(e.soups ?? [])])];
    merged.forms = [...new Set([...(merged.forms ?? []), ...(e.forms ?? [])])];
    merged.lineages = [
      ...new Set([...(merged.lineages ?? []), ...(e.lineages ?? [])]),
    ];
    merged.soupDetail = [
      ...new Set([...(merged.soupDetail ?? []), ...(e.soupDetail ?? [])]),
    ];
    merged.primarySoup ??= e.primarySoup;
    merged.primaryForm ??= e.primaryForm;
    merged.area ??= e.area;
    merged.instagram ??= e.instagram;
    merged.naverPlace ??= e.naverPlace;
    merged.openedAt ??= e.openedAt;
    merged.hours ??= e.hours;
    merged.closed ||= e.closed;
    merged.sourceNote = [merged.sourceNote, e.sourceNote]
      .filter(Boolean)
      .join("; ");
  }
  return merged;
}

export type SheetRow = Record<string, string>;

export function toSheetLine(cells: SheetRow): string {
  return SHEET_HEADER.map((h) => cells[h] ?? "").join("\t");
}
