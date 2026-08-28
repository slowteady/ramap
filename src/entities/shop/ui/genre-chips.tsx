import {
  formBySlug,
  LINEAGES,
  soupBySlug,
} from "@/entities/shop/model/taxonomy";
import type { FormSlug, LineageSlug, SoupSlug } from "@/entities/shop/model/taxonomy";
import { cn } from "@/shared/lib/utils";

type GenreChipsProps = {
  soups: SoupSlug[];
  forms: FormSlug[];
  lineages: LineageSlug[];
  className?: string;
};

/* 축별 색 구분: 국물=레드 틴트 / 종류=회색 / 스타일=네이비 틴트 */
export function GenreChips({ soups, forms, lineages, className }: GenreChipsProps) {
  const chips = [
    ...soups.map((s) => ({
      key: `s:${s}`,
      label: soupBySlug(s)?.label ?? s,
      cls: "bg-ramen-050 text-ramen",
    })),
    ...forms
      .filter((f) => f !== "ramen")
      .map((f) => ({
        key: `f:${f}`,
        label: formBySlug(f)?.label ?? f,
        cls: "bg-gray-050 text-gray-500",
      })),
    ...lineages.map((l) => ({
      key: `l:${l}`,
      label: LINEAGES.find((x) => x.slug === l)?.label ?? l,
      cls: "bg-navy-050 text-navy",
    })),
  ];
  if (chips.length === 0) return null;

  return (
    <span className={cn("flex flex-wrap gap-1", className)}>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className={cn(
            "rounded-card px-2 py-0.5 text-caption font-semibold",
            chip.cls,
          )}
        >
          {chip.label}
        </span>
      ))}
    </span>
  );
}
