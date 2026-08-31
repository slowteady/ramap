import { FORMS, LINEAGES, SOUPS, type TaxonomyItem } from "@/entities/shop";
import type { MapFilters } from "./filter";

const HIDDEN_SLUGS = new Set(["etc-form", "etc-soup"]);

export function visibleItems(items: readonly TaxonomyItem[]): TaxonomyItem[] {
  return items.filter((i) => !HIDDEN_SLUGS.has(i.slug) && i.kind !== "trait");
}

export type FilterAxis = "form" | "soup" | "lineage";

export const FILTER_AXES: {
  axis: FilterAxis;
  title: string;
  sheetTitle: string;
  filterKey: "soups" | "forms" | "lineages";
  items: readonly TaxonomyItem[];
}[] = [
  {
    axis: "form",
    title: "종류",
    sheetTitle: "종류",
    filterKey: "forms",
    items: FORMS,
  },
  {
    axis: "soup",
    title: "국물",
    sheetTitle: "국물",
    filterKey: "soups",
    items: SOUPS,
  },
  {
    axis: "lineage",
    title: "스타일",
    sheetTitle: "스타일",
    filterKey: "lineages",
    items: LINEAGES,
  },
];

export function axisChipCount(
  axis: (typeof FILTER_AXES)[number],
  filters: MapFilters,
): number {
  return filters[axis.filterKey].length;
}
