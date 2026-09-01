import dayjs from "dayjs";
import type { ShopRecord } from "./types";

export function toggledVisited(
  prev: ShopRecord | null,
  shopId: string,
  at?: Date,
): ShopRecord | null {
  if (prev?.visited) {
    if (!prev.saved) return null;
    return { ...prev, visited: false, count: 0 };
  }
  const iso = at ? dayjs(at).toISOString() : null;
  return {
    shopId,
    visited: true,
    saved: prev?.saved ?? false,
    count: 1,
    firstAt: prev?.firstAt ?? iso,
    lastAt: iso ?? prev?.lastAt ?? null,
  };
}

/* 재방문 누적 — 완식 기록 재제출 경로에서만 호출 (버튼 토글은 count 1 고정) */
export function revisited(
  prev: ShopRecord | null,
  shopId: string,
  at?: Date,
): ShopRecord {
  const iso = at ? dayjs(at).toISOString() : null;
  return {
    shopId,
    visited: true,
    saved: prev?.saved ?? false,
    count: (prev?.visited ? prev.count : 0) + 1,
    firstAt: prev?.firstAt ?? iso,
    lastAt: iso ?? prev?.lastAt ?? null,
  };
}

export function toggledSaved(
  prev: ShopRecord | null,
  shopId: string,
): ShopRecord | null {
  if (prev?.saved) {
    if (!prev.visited) return null;
    return { ...prev, saved: false };
  }
  return {
    shopId,
    visited: prev?.visited ?? false,
    saved: true,
    count: prev?.count ?? 0,
    firstAt: prev?.firstAt ?? null,
    lastAt: prev?.lastAt ?? null,
  };
}

export function mergeRecord(a: ShopRecord, b: ShopRecord): ShopRecord {
  return {
    shopId: a.shopId,
    visited: a.visited || b.visited,
    saved: a.saved || b.saved,
    count: Math.max(a.count, b.count),
    firstAt:
      a.firstAt && b.firstAt
        ? a.firstAt < b.firstAt
          ? a.firstAt
          : b.firstAt
        : (a.firstAt ?? b.firstAt),
    lastAt:
      a.lastAt && b.lastAt
        ? a.lastAt > b.lastAt
          ? a.lastAt
          : b.lastAt
        : (a.lastAt ?? b.lastAt),
  };
}

export function mergeRecords(
  base: ShopRecord[],
  incoming: ShopRecord[],
): ShopRecord[] {
  const map = new Map(base.map((r) => [r.shopId, r]));
  for (const r of incoming) {
    const prev = map.get(r.shopId);
    map.set(r.shopId, prev ? mergeRecord(prev, r) : r);
  }
  return [...map.values()];
}

type LegacyRecord = {
  shopId: string;
  status?: string;
  visited?: boolean;
  saved?: boolean;
  count?: number;
  firstAt?: string | null;
  lastAt?: string | null;
};

export function normalizeRecord(raw: unknown): ShopRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as LegacyRecord;
  if (typeof r.shopId !== "string") return null;
  const visited = r.visited ?? r.status === "visited";
  const saved = r.saved ?? r.status === "want";
  if (!visited && !saved) return null;
  return {
    shopId: r.shopId,
    visited,
    saved,
    count: visited ? Math.max(1, r.count ?? 1) : 0,
    firstAt: r.firstAt ?? null,
    lastAt: r.lastAt ?? null,
  };
}
