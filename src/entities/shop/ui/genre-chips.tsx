import Link from "next/link";
import { guideBySlug } from "@/entities/shop/model/guide-content";
import {
  formBySlug,
  LINEAGES,
  soupBySlug,
} from "@/entities/shop/model/taxonomy";
import type {
  FormSlug,
  LineageSlug,
  SoupSlug,
} from "@/entities/shop/model/taxonomy";
import { cn } from "@/shared/lib/utils";

type GenreChipsProps = {
  soups: SoupSlug[];
  forms: FormSlug[];
  lineages: LineageSlug[];
  /* 가이드가 있는 칩을 /guide 링크로 — 상세처럼 칩이 링크 안에 중첩되지 않는 곳에서만 */
  linkGuides?: boolean;
  className?: string;
};

export function GenreChips({
  soups,
  forms,
  lineages,
  linkGuides = false,
  className,
}: GenreChipsProps) {
  const chips = [
    ...soups
      .filter((s) => s !== "etc-soup")
      .map((s) => ({
        key: `s:${s}`,
        label: soupBySlug(s)?.label ?? s,
        cls: "bg-ramen-050 text-ramen",
        href: linkGuides && guideBySlug(s) ? `/guide/${s}` : null,
      })),
    ...forms
      .filter((f) => f !== "ramen" && f !== "etc-form")
      .map((f) => ({
        key: `f:${f}`,
        label: formBySlug(f)?.label ?? f,
        cls: "bg-gray-100 text-gray-500",
        href: null,
      })),
    ...lineages.flatMap((l) => {
      const item = LINEAGES.find((x) => x.slug === l);
      if (!item || item.kind !== "taste") return [];
      return [
        {
          key: `l:${l}`,
          label: item.label,
          cls: "bg-gray-100 text-gray-500",
          href: linkGuides && guideBySlug(l) ? `/guide/${l}` : null,
        },
      ];
    }),
  ];
  if (chips.length === 0) return null;

  return (
    <span className={cn("flex flex-wrap gap-1", className)}>
      {chips.map((chip) => {
        const cls = cn(
          "rounded-chip px-1.5 py-0.5 text-caption font-semibold",
          chip.cls,
        );
        return chip.href ? (
          <Link key={chip.key} href={chip.href} className={cls}>
            {chip.label}
          </Link>
        ) : (
          <span key={chip.key} className={cls}>
            {chip.label}
          </span>
        );
      })}
    </span>
  );
}
