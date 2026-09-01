import {
  formBySlug,
  guideBySlug,
  LINEAGES,
  soupBySlug,
  type FormSlug,
  type LineageSlug,
  type SoupSlug,
} from "@/entities/shop";

export type GenreMetaItem = { key: string; label: string; href: string | null };

const guideHref = (slug: string) =>
  guideBySlug(slug) ? `/guide/${slug}` : null;

/* 상세 헤더 텍스트 메타 — 국물 → 라멘 외 형태 → taste 계보 (홈 칩과 같은 순서) */
export function genreMeta(g: {
  soups: SoupSlug[];
  forms: FormSlug[];
  lineages: LineageSlug[];
}): GenreMetaItem[] {
  return [
    ...g.soups
      .filter((s) => s !== "etc-soup")
      .map((s) => ({
        key: `s:${s}`,
        label: soupBySlug(s)?.label ?? s,
        href: guideHref(s),
      })),
    ...g.forms
      .filter((f) => f !== "ramen" && f !== "etc-form")
      .map((f) => ({
        key: `f:${f}`,
        label: formBySlug(f)?.label ?? f,
        href: null,
      })),
    ...g.lineages.flatMap((l) => {
      const item = LINEAGES.find((x) => x.slug === l);
      if (!item || item.kind !== "taste") return [];
      return [{ key: `l:${l}`, label: item.label, href: guideHref(l) }];
    }),
  ];
}
