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
export function updateLastmod(
  prev: LastmodLedger,
  shops: { id: string }[],
  today: string,
): LastmodLedger {
  const next: LastmodLedger = {};
  for (const shop of shops) {
    const hash = createHash("sha1")
      .update(JSON.stringify(stable(shop)))
      .digest("hex")
      .slice(0, 16);
    const before = prev[shop.id];
    next[shop.id] =
      before && before.hash === hash ? before : { date: today, hash };
  }
  return next;
}
