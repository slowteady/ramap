import { createHash } from "node:crypto";

export type LastmodLedger = Record<string, { date: string; hash: string }>;

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((k) => [k, stable((value as Record<string, unknown>)[k])]),
    );
  return value;
}

/* 사이트맵 lastmod는 실제 변경과 일치할 때만 구글이 신뢰한다 — 내용 해시가 바뀐 매장만 날짜를 올린다 */
const INTERNAL_FIELDS = new Set(["source", "note"]);

function contentHash(shop: { id: string }): string {
  const visible = Object.fromEntries(
    Object.entries(shop).filter(([key]) => !INTERNAL_FIELDS.has(key)),
  );
  return createHash("sha1")
    .update(JSON.stringify(stable(visible)))
    .digest("hex")
    .slice(0, 16);
}

export function updateLastmod<T extends { id: string }>(
  prev: LastmodLedger,
  shops: T[],
  today: string,
  prevShops: T[] = [],
): LastmodLedger {
  const prevHashes = new Map(
    prevShops.map((shop) => [shop.id, contentHash(shop)]),
  );
  const next: LastmodLedger = {};
  for (const shop of shops) {
    const hash = contentHash(shop);
    const before = prev[shop.id];
    if (before && before.hash === hash) next[shop.id] = before;
    else if (before && prevHashes.get(shop.id) === hash)
      next[shop.id] = { date: before.date, hash };
    else next[shop.id] = { date: today, hash };
  }
  return next;
}
