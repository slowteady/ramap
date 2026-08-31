import {
  AMENITIES,
  FORMS,
  LINEAGES,
  SOUPS,
  type TaxonomyItem,
} from "@/entities/shop";

const HIDDEN_SLUGS = new Set(["etc-form", "etc-soup"]);

/* 홈 필터와 동일 가시성 — etc·trait(자가제면·본토직영)은 운영자 태깅 영역 */
function reportable(items: readonly TaxonomyItem[]): TaxonomyItem[] {
  return items.filter((i) => !HIDDEN_SLUGS.has(i.slug) && i.kind !== "trait");
}

export type GenreAxisKey = "forms" | "soups" | "lineages";

export const GENRE_AXES: {
  key: GenreAxisKey;
  title: string;
  items: TaxonomyItem[];
}[] = [
  { key: "soups", title: "국물", items: reportable(SOUPS) },
  { key: "forms", title: "종류", items: reportable(FORMS) },
  { key: "lineages", title: "스타일", items: reportable(LINEAGES) },
];

export const AMENITY_OPTIONS: readonly TaxonomyItem[] = AMENITIES;

export function toggleSlug<T extends string>(list: T[], slug: T): T[] {
  return list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
}
