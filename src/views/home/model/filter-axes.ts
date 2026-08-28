import {
  FORMS,
  LINEAGES,
  SOUPS,
  type TaxonomyItem,
} from "@/entities/shop";
import type { MapFilters } from "./filter";

export type FilterAxis = "form" | "soup" | "lineage";

export const FILTER_AXES: {
  axis: FilterAxis;
  title: string;
  sheetTitle: string;
  filterKey: keyof MapFilters;
  items: readonly TaxonomyItem[];
}[] = [
  { axis: "form", title: "형태", sheetTitle: "형태", filterKey: "forms", items: FORMS },
  { axis: "soup", title: "스프", sheetTitle: "스프 계열", filterKey: "soups", items: SOUPS },
  {
    axis: "lineage",
    title: "계보",
    sheetTitle: "계보",
    filterKey: "lineages",
    items: LINEAGES,
  },
];

export function axisChipLabel(
  axis: (typeof FILTER_AXES)[number],
  filters: MapFilters,
): string {
  const selected = filters[axis.filterKey];
  if (selected.length === 0) return axis.title;
  const first = axis.items.find((i) => i.slug === selected[0])?.label ?? selected[0];
  const rest = selected.length > 1 ? ` 외 ${selected.length - 1}` : "";
  return `${axis.title} · ${first}${rest}`;
}
