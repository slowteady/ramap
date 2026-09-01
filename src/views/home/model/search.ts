import { convertQwertyToHangul, getChoseong } from "es-hangul";
import { type ShopPin } from "@/entities/shop";
import { editDistanceAtMostOne } from "./hangul";
import { FILTER_AXES, visibleItems } from "./filter-axes";
import type { MapFilters } from "./filter";

function normalize(text: string): string {
  return text.replace(/\s+/g, "").toLowerCase();
}

function rankOne(t: string, q: string): number | null {
  if (t.startsWith(q)) return 0;
  if (t.includes(q)) return 1;
  const tc = getChoseong(t);
  if (tc.startsWith(q)) return 2;
  if (tc.includes(q)) return 3;
  return null;
}

export function matchRank(target: string, query: string): number | null {
  const t = normalize(target);
  const q = normalize(query);
  if (q.length === 0) return null;
  const direct = rankOne(t, q);
  if (direct !== null) return direct;
  const converted = normalize(convertQwertyToHangul(q));
  if (converted !== q) {
    const viaKor = rankOne(t, converted);
    if (viaKor !== null) return viaKor + 4;
  }
  return null;
}

export function fuzzyMatch(target: string, query: string): boolean {
  const t = normalize(target);
  const q = normalize(query);
  if (q.length < 2) return false;
  if (editDistanceAtMostOne(t, q)) return true;
  for (let i = 0; i + q.length <= t.length + 1; i++) {
    if (editDistanceAtMostOne(t.slice(i, i + q.length), q)) return true;
  }
  return false;
}

export type GenreSuggestion = {
  kind: "genre";
  filterKey: keyof MapFilters;
  slug: string;
  label: string;
  count: number;
};

export type AreaSuggestion = {
  kind: "area";
  area: string;
  count: number;
};

export type ShopSuggestion = {
  kind: "shop";
  shop: ShopPin;
};

export type Suggestion = GenreSuggestion | AreaSuggestion | ShopSuggestion;

function shopSearchTargets(pin: ShopPin): string[] {
  return [
    pin.name,
    pin.branch ? `${pin.name}${pin.branch}` : null,
    pin.branch,
    pin.areaLabel,
    ...pin.soupDetail,
    pin.topMenu?.name ?? null,
  ].filter((t): t is string => Boolean(t));
}

function shopRank(pin: ShopPin, query: string): number | null {
  let best: number | null = null;
  for (const target of shopSearchTargets(pin)) {
    const rank = matchRank(target, query);
    if (rank !== null && (best === null || rank < best)) best = rank;
  }
  return best;
}

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

  const areaCounts = new Map<string, number>();
  for (const pin of pins) {
    if (!pin.areaLabel) continue;
    areaCounts.set(pin.areaLabel, (areaCounts.get(pin.areaLabel) ?? 0) + 1);
  }
  const areas: (AreaSuggestion & { rank: number })[] = [];
  for (const [area, count] of areaCounts) {
    const rank = matchRank(area, query);
    if (rank === null) continue;
    areas.push({ kind: "area", area, count, rank });
  }
  areas.sort((a, b) => a.rank - b.rank || b.count - a.count);

  let shops: (ShopSuggestion & { rank: number })[] = [];
  for (const pin of pins) {
    const rank = shopRank(pin, query);
    if (rank === null) continue;
    shops.push({ kind: "shop", shop: pin, rank });
  }

  if (genres.length === 0 && areas.length === 0 && shops.length === 0) {
    shops = pins
      .filter((p) => shopSearchTargets(p).some((t) => fuzzyMatch(t, query)))
      .map((shop) => ({ kind: "shop" as const, shop, rank: 8 }));
  }
  shops.sort(
    (a, b) => a.rank - b.rank || a.shop.name.localeCompare(b.shop.name),
  );

  return [
    ...genres.slice(0, 3).map(({ rank: _, ...g }) => g),
    ...areas.slice(0, 2).map(({ rank: _, ...a }) => a),
    ...shops.slice(0, 10).map(({ rank: _, ...s }) => s),
  ];
}
