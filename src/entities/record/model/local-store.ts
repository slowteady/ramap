import {
  shouldReplace,
  visitedNext,
  wantNext,
} from "@/entities/record/model/record-ops";
import type {
  RecordExport,
  RecordStore,
  ShopRecord,
} from "@/entities/record/model/types";

const KEY = "ramap.records.v1";

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
        const parsed = JSON.parse(raw) as { records?: ShopRecord[] };
        if (Array.isArray(parsed.records)) records = parsed.records;
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

  return {
    get(shopId) {
      return load().get(shopId) ?? null;
    },
    all() {
      return [...load().values()];
    },
    markVisited(shopId, at) {
      const map = load();
      const next = visitedNext(map.get(shopId), shopId, at);
      map.set(shopId, next);
      persist(map);
      return next;
    },
    markWant(shopId) {
      const map = load();
      const prev = map.get(shopId);
      const next = wantNext(prev, shopId);
      if (!next) return prev!;
      map.set(shopId, next);
      persist(map);
      return next;
    },
    remove(shopId) {
      const map = load();
      map.delete(shopId);
      persist(map);
    },
    exportJson() {
      const payload: RecordExport = {
        version: 1,
        exportedAt: new Date().toISOString(),
        records: [...load().values()],
      };
      return JSON.stringify(payload);
    },
    importJson(json) {
      let imported = 0;
      try {
        const parsed = JSON.parse(json) as Partial<RecordExport>;
        if (parsed.version !== 1 || !Array.isArray(parsed.records))
          return { imported: 0 };
        const map = load();
        for (const r of parsed.records) {
          if (!r || typeof r.shopId !== "string") continue;
          if (shouldReplace(map.get(r.shopId), r)) map.set(r.shopId, r);
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
