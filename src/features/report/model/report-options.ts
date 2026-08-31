import {
  AMENITIES,
  FORMS,
  LINEAGES,
  SOUPS,
  type TaxonomyItem,
} from "@/entities/shop";

const HIDDEN_SLUGS = new Set(["etc-form", "etc-soup"]);

function reportable(items: readonly TaxonomyItem[]): TaxonomyItem[] {
  return items.filter((i) => !HIDDEN_SLUGS.has(i.slug));
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

export const DAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;

export function toggleSlug<T extends string>(list: T[], slug: T): T[] {
  return list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug];
}
