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

  function upsertVisited(
    map: Map<string, ShopRecord>,
    shopId: string,
    at?: Date,
  ): ShopRecord {
    const iso = at ? at.toISOString() : null;
    const prev = map.get(shopId);
    let next: ShopRecord;
    if (!prev || prev.status === "want") {
      next = { shopId, status: "visited", count: 1, firstAt: iso, lastAt: iso };
    } else {
      next = {
        ...prev,
        count: prev.count + 1,
        firstAt: prev.firstAt ?? iso,
        lastAt: iso ?? prev.lastAt,
      };
    }
    map.set(shopId, next);
    return next;
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
      const r = upsertVisited(map, shopId, at);
      persist(map);
      return r;
    },
    markWant(shopId) {
      const map = load();
      const prev = map.get(shopId);
      if (prev?.status === "visited") return prev;
      const next: ShopRecord = {
        shopId,
        status: "want",
        count: 0,
        firstAt: null,
        lastAt: null,
      };
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
          const prev = map.get(r.shopId);
          if (
            !prev ||
            r.count > prev.count ||
            (prev.status === "want" && r.status === "visited")
          ) {
            map.set(r.shopId, r);
          }
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
