export type IntegrityShop = {
  id: string;
  name: string;
  branch: string | null;
  address: string | null;
  status: string;
  soups: string[];
  forms: string[];
  lineages: string[];
  instagram: string | null;
};

const WATCHED = ["soups", "forms", "lineages", "instagram"] as const;
type Watched = (typeof WATCHED)[number];

const canon = (v: string[] | string | null) =>
  Array.isArray(v) ? [...v].sort().join(",") : (v ?? "");

export function diffShops(before: IntegrityShop[], after: IntegrityShop[]) {
  const prev = new Map(before.map((s) => [s.id, s]));
  const next = new Map(after.map((s) => [s.id, s]));
  const changed: {
    id: string;
    fields: Watched[];
    before: IntegrityShop;
    after: IntegrityShop;
  }[] = [];
  for (const s of after) {
    const o = prev.get(s.id);
    if (!o) continue;
    const fields = WATCHED.filter((f) => canon(o[f]) !== canon(s[f]));
    if (fields.length) changed.push({ id: s.id, fields, before: o, after: s });
  }
  return {
    changed,
    removed: before.filter((s) => !next.has(s.id)),
    added: after.filter((s) => !prev.has(s.id)),
  };
}

const handleOf = (raw: string) =>
  raw
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "")
    .toLowerCase();

export function sharedInstagram(shops: IntegrityShop[]) {
  const byHandle = new Map<string, IntegrityShop[]>();
  for (const s of shops) {
    if (s.status === "closed" || !s.instagram) continue;
    const h = handleOf(s.instagram);
    byHandle.set(h, [...(byHandle.get(h) ?? []), s]);
  }
  return [...byHandle.entries()]
    .filter(([, list]) => new Set(list.map((s) => s.address)).size > 1)
    .map(([handle, list]) => ({ handle, ids: list.map((s) => s.id) }));
}
