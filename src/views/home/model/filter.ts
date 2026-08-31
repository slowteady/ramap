import {
  FORMS,
  LINEAGES,
  SOUPS,
  type FormSlug,
  type LineageSlug,
  type ShopPin,
  type SoupSlug,
} from "@/entities/shop";

export type MapFilters = {
  soups: SoupSlug[];
  forms: FormSlug[];
  lineages: LineageSlug[];
  newOnly: boolean;
};

export const EMPTY_FILTERS: MapFilters = {
  soups: [],
  forms: [],
  lineages: [],
  newOnly: false,
};

const VALID = {
  soup: new Set(SOUPS.map((s) => s.slug)),
  form: new Set(FORMS.map((f) => f.slug)),
  lineage: new Set(LINEAGES.map((l) => l.slug)),
};

function parseAxis<T extends string>(
  raw: string | null,
  valid: Set<string>,
): T[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => valid.has(s)) as T[];
}

export function parseFilters(params: URLSearchParams): MapFilters {
  return {
    soups: parseAxis<SoupSlug>(params.get("soup"), VALID.soup),
    forms: parseAxis<FormSlug>(params.get("form"), VALID.form),
    lineages: parseAxis<LineageSlug>(params.get("lineage"), VALID.lineage),
    newOnly: params.get("new") === "1",
  };
}

export function serializeFilters(f: MapFilters): string {
  const params = new URLSearchParams();
  if (f.soups.length) params.set("soup", [...f.soups].sort().join(","));
  if (f.forms.length) params.set("form", [...f.forms].sort().join(","));
  if (f.lineages.length)
    params.set("lineage", [...f.lineages].sort().join(","));
  if (f.newOnly) params.set("new", "1");
  return params.toString();
}

function matches(pin: ShopPin, f: MapFilters): boolean {
  if (f.soups.length && !f.soups.some((s) => pin.soups.includes(s)))
    return false;
  if (f.forms.length && !f.forms.some((s) => pin.forms.includes(s)))
    return false;
  if (f.lineages.length && !f.lineages.some((s) => pin.lineages.includes(s)))
    return false;
  if (f.newOnly && !pin.isNew) return false;
  return true;
}

export function applyFilters(pins: ShopPin[], f: MapFilters): ShopPin[] {
  return pins.filter((p) => matches(p, f));
}

export function isActive(f: MapFilters): boolean {
  return f.soups.length + f.forms.length + f.lineages.length > 0 || f.newOnly;
}

export function countBySoup(
  pins: ShopPin[],
  f: MapFilters,
): Record<SoupSlug, number> {
  const withoutSoup = { ...f, soups: [] };
  const base = applyFilters(pins, withoutSoup);
  const counts = Object.fromEntries(SOUPS.map((s) => [s.slug, 0])) as Record<
    SoupSlug,
    number
  >;
  for (const pin of base) for (const soup of pin.soups) counts[soup] += 1;
  return counts;
}

export function countByForm(
  pins: ShopPin[],
  f: MapFilters,
): Record<FormSlug, number> {
  const base = applyFilters(pins, { ...f, forms: [] });
  const counts = Object.fromEntries(FORMS.map((s) => [s.slug, 0])) as Record<
    FormSlug,
    number
  >;
  for (const pin of base) for (const form of pin.forms) counts[form] += 1;
  return counts;
}

export function countByLineage(
  pins: ShopPin[],
  f: MapFilters,
): Record<LineageSlug, number> {
  const base = applyFilters(pins, { ...f, lineages: [] });
  const counts = Object.fromEntries(LINEAGES.map((s) => [s.slug, 0])) as Record<
    LineageSlug,
    number
  >;
  for (const pin of base) for (const l of pin.lineages) counts[l] += 1;
  return counts;
}
