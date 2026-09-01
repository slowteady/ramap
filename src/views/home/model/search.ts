import {
  formBySlug,
  LINEAGES,
  soupBySlug,
  type ShopPin,
} from "@/entities/shop";
import { FILTER_AXES, visibleItems } from "./filter-axes";
import type { MapFilters } from "./filter";

const CHOSEONG = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

export function toChoseong(text: string): string {
  let out = "";
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      out += CHOSEONG[Math.floor((code - 0xac00) / 588)];
    } else {
      out += ch;
    }
  }
  return out;
}

function normalize(text: string): string {
  return text.replace(/\s+/g, "").toLowerCase();
}

export function matchRank(target: string, query: string): number | null {
  const t = normalize(target);
  const q = normalize(query);
  if (q.length === 0) return null;
  if (t.startsWith(q)) return 0;
  if (t.includes(q)) return 1;
  const tc = toChoseong(t);
  if (tc.startsWith(q)) return 2;
  if (tc.includes(q)) return 3;
  return null;
}

export type GenreSuggestion = {
  kind: "genre";
  filterKey: keyof MapFilters;
  slug: string;
  label: string;
  count: number;
};

export type ShopSuggestion = {
  kind: "shop";
  shop: ShopPin;
};

export type Suggestion = GenreSuggestion | ShopSuggestion;

export function buildSuggestions(
  pins: ShopPin[],
  query: string,
): Suggestion[] {
  if (normalize(query).length === 0) return [];

  const genres: (GenreSuggestion & { rank: number })[] = [];
  for (const axis of FILTER_AXES) {
    for (const item of visibleItems(axis.items)) {
      const rank = matchRank(item.label, query);
      if (rank === null) continue;
      const count = pins.filter((p) =>
        (p[axis.filterKey] as string[]).includes(item.slug),
      ).length;
      if (count === 0) continue;
      genres.push({
        kind: "genre",
        filterKey: axis.filterKey,
        slug: item.slug,
        label: item.label,
        count,
        rank,
      });
    }
  }
  genres.sort((a, b) => a.rank - b.rank || b.count - a.count);

  const shops: (ShopSuggestion & { rank: number })[] = [];
  for (const pin of pins) {
    const nameRank = matchRank(pin.name, query);
    const areaRank = pin.areaLabel ? matchRank(pin.areaLabel, query) : null;
    const rank = Math.min(nameRank ?? 9, areaRank ?? 9);
    if (rank === 9) continue;
    shops.push({ kind: "shop", shop: pin, rank });
  }
  shops.sort(
    (a, b) => a.rank - b.rank || a.shop.name.localeCompare(b.shop.name),
  );

  return [
    ...genres.slice(0, 3).map(({ rank: _, ...g }) => g),
    ...shops.slice(0, 10).map(({ rank: _, ...s }) => s),
  ];
}

export function genreLabelOf(slug: string): string {
  return (
    soupBySlug(slug)?.label ??
    formBySlug(slug)?.label ??
    LINEAGES.find((l) => l.slug === slug)?.label ??
    slug
  );
}
