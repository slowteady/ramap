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
