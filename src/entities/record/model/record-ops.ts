import dayjs from "dayjs";
import type { ShopRecord } from "./types";

export function visitedNext(
  prev: ShopRecord | undefined,
  shopId: string,
  at?: Date,
): ShopRecord {
  const iso = at ? dayjs(at).toISOString() : null;
  return {
    shopId,
    status: "visited",
    count: 1,
    firstAt: prev?.firstAt ?? iso,
    lastAt: iso ?? prev?.lastAt ?? null,
  };
}

export function wantNext(
  prev: ShopRecord | undefined,
  shopId: string,
): ShopRecord | null {
  if (prev?.status === "visited") return null;
  return { shopId, status: "want", count: 0, firstAt: null, lastAt: null };
}

export function shouldReplace(
  prev: ShopRecord | undefined,
  incoming: ShopRecord,
): boolean {
  if (!prev) return true;
  if (incoming.count > prev.count) return true;
  return prev.status === "want" && incoming.status === "visited";
}

export function mergeRecords(
  base: ShopRecord[],
  incoming: ShopRecord[],
): ShopRecord[] {
  const map = new Map(base.map((r) => [r.shopId, r]));
  for (const r of incoming) {
    if (shouldReplace(map.get(r.shopId), r)) map.set(r.shopId, r);
  }
  return [...map.values()];
}
