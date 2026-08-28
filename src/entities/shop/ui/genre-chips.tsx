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

export function GenreChips({ soups, forms, lineages, className }: GenreChipsProps) {
  const chips = [
    ...soups
      .filter((s) => s !== "etc-soup")
      .map((s) => ({
      key: `s:${s}`,
      label: soupBySlug(s)?.label ?? s,
      cls: "bg-ramen-050 text-ramen",
    })),
    ...forms
      .filter((f) => f !== "ramen" && f !== "etc-form")
      .map((f) => ({
        key: `f:${f}`,
        label: formBySlug(f)?.label ?? f,
        cls: "bg-gray-100 text-gray-500",
      })),
    ...lineages.flatMap((l) => {
      const item = LINEAGES.find((x) => x.slug === l);
      if (!item || item.kind !== "taste") return [];
      return [
        {
          key: `l:${l}`,
          label: item.label,
          cls: "bg-gray-100 text-gray-500",
        },
      ];
    }),
  ];
  if (chips.length === 0) return null;

  return (
    <span className={cn("flex flex-wrap gap-1", className)}>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className={cn(
            "rounded-chip px-1.5 py-0.5 text-caption font-semibold",
            chip.cls,
          )}
        >
          {chip.label}
        </span>
      ))}
    </span>
  );
}
