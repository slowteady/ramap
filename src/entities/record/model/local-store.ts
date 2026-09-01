import dayjs from "dayjs";
import {
  mergeRecord,
  normalizeRecord,
  revisited,
  toggledSaved,
  toggledVisited,
} from "@/entities/record/model/record-ops";
import type {
  RecordExport,
  RecordStore,
  ShopRecord,
} from "@/entities/record/model/types";

const KEY = "ramap.records.v1";

export function clearLocalRecords(storage?: Storage): void {
  const backing =
    storage ??
    (typeof window !== "undefined" ? window.localStorage : undefined);
  try {
    backing?.removeItem(KEY);
  } catch {
    /* 스토리지 불가 환경에선 무시 */
  }
}

export function createLocalRecordStore(storage?: Storage): RecordStore {
  const backing =
    storage ??
    (typeof window !== "undefined" ? window.localStorage : undefined);
  let memory: Map<string, ShopRecord> | null = null;

  function load(): Map<string, ShopRecord> {
    if (memory) return memory;
    let records: ShopRecord[] = [];
    try {
      const raw = backing?.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { records?: unknown[] };
        if (Array.isArray(parsed.records))
          records = parsed.records
            .map(normalizeRecord)
            .filter((r): r is ShopRecord => r !== null);
      }
    } catch {
      records = [];
    }
    memory = new Map(records.map((r) => [r.shopId, r]));
    return memory;
  }

  function persist(map: Map<string, ShopRecord>) {
    try {
      backing?.setItem(KEY, JSON.stringify({ records: [...map.values()] }));
    } catch {
      /* 저장 실패 시 메모리로만 유지 — 기록 기능이 화면을 죽이면 안 됨 */
    }
  }

  function apply(
    map: Map<string, ShopRecord>,
    shopId: string,
    next: ShopRecord | null,
  ) {
    if (next) map.set(shopId, next);
    else map.delete(shopId);
    persist(map);
    return next;
  }

  return {
    get(shopId) {
      return load().get(shopId) ?? null;
    },
    all() {
      return [...load().values()];
    },
    toggleVisited(shopId, at) {
      const map = load();
      return apply(
        map,
        shopId,
        toggledVisited(map.get(shopId) ?? null, shopId, at),
      );
    },
    toggleSaved(shopId) {
      const map = load();
      return apply(map, shopId, toggledSaved(map.get(shopId) ?? null, shopId));
    },
    recordRevisit(shopId, at) {
      const map = load();
      const next = revisited(map.get(shopId) ?? null, shopId, at);
      apply(map, shopId, next);
      return next;
    },
    exportJson() {
      const payload: RecordExport = {
        version: 2,
        exportedAt: dayjs().toISOString(),
        records: [...load().values()],
      };
      return JSON.stringify(payload);
    },
    importJson(json) {
      let imported = 0;
      try {
        const parsed = JSON.parse(json) as {
          version?: number;
          records?: unknown[];
        };
        if (
          (parsed.version !== 1 && parsed.version !== 2) ||
          !Array.isArray(parsed.records)
        )
          return { imported: 0 };
        const map = load();
        for (const raw of parsed.records) {
          const r = normalizeRecord(raw);
          if (!r) continue;
          const prev = map.get(r.shopId);
          map.set(r.shopId, prev ? mergeRecord(prev, r) : r);
          imported += 1;
        }
        persist(map);
        return { imported };
      } catch {
        return { imported: 0 };
      }
    },
  };
}
