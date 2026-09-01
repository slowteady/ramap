import type { SupabaseClient } from "@supabase/supabase-js";
import dayjs from "dayjs";
import {
  mergeRecord,
  normalizeRecord,
  revisited,
  toggledSaved,
  toggledVisited,
} from "./record-ops";
import { fromRow, toRow, type RecordRow } from "./row-mapping";
import type { RecordExport, RecordStore, ShopRecord } from "./types";

/* 응답이 영영 안 오면 adopt가 재시도 불가로 고착되므로 타임아웃을 실패로 취급 */
const ADOPT_TIMEOUT_MS = 10_000;

export type RecordSink = {
  upsert(record: ShopRecord): void;
  remove(shopId: string): void;
};

export function createSyncedRecordStore(
  seed: ShopRecord[],
  sink: RecordSink,
): RecordStore {
  const map = new Map(seed.map((r) => [r.shopId, r]));

  function apply(shopId: string, next: ShopRecord | null) {
    if (next) {
      map.set(shopId, next);
      sink.upsert(next);
    } else {
      map.delete(shopId);
      sink.remove(shopId);
    }
    return next;
  }

  return {
    get(shopId) {
      return map.get(shopId) ?? null;
    },
    all() {
      return [...map.values()];
    },
    toggleVisited(shopId, at) {
      return apply(shopId, toggledVisited(map.get(shopId) ?? null, shopId, at));
    },
    toggleSaved(shopId) {
      return apply(shopId, toggledSaved(map.get(shopId) ?? null, shopId));
    },
    recordRevisit(shopId, at) {
      const next = revisited(map.get(shopId) ?? null, shopId, at);
      apply(shopId, next);
      return next;
    },
    exportJson() {
      const payload: RecordExport = {
        version: 2,
        exportedAt: dayjs().toISOString(),
        records: [...map.values()],
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
        for (const raw of parsed.records) {
          const r = normalizeRecord(raw);
          if (!r) continue;
          const prev = map.get(r.shopId);
          const next = prev ? mergeRecord(prev, r) : r;
          map.set(r.shopId, next);
          sink.upsert(next);
          imported += 1;
        }
        return { imported };
      } catch {
        return { imported: 0 };
      }
    },
  };
}

/* null = 조회 실패 — 빈 기록과 구분해야 로컬로 서버를 덮어쓰지 않는다 */
export async function fetchRecords(
  client: SupabaseClient,
  userId: string,
): Promise<ShopRecord[] | null> {
  try {
    const { data, error } = await client
      .from("records")
      .select("user_id, shop_id, visited, saved, count, first_at, last_at")
      .eq("user_id", userId)
      .abortSignal(AbortSignal.timeout(ADOPT_TIMEOUT_MS));
    if (error || !data) return null;
    return (data as RecordRow[])
      .map(fromRow)
      .filter((r): r is ShopRecord => r !== null);
  } catch {
    return null;
  }
}

export function supabaseSink(
  client: SupabaseClient,
  userId: string,
): RecordSink {
  return {
    upsert(record) {
      void client
        .from("records")
        .upsert(toRow(record, userId), { onConflict: "user_id,shop_id" })
        .then(undefined, () => {});
    },
    remove(shopId) {
      void client
        .from("records")
        .delete()
        .eq("user_id", userId)
        .eq("shop_id", shopId)
        .then(undefined, () => {});
    },
  };
}

export async function pushRecords(
  client: SupabaseClient,
  userId: string,
  records: ShopRecord[],
): Promise<boolean> {
  if (records.length === 0) return true;
  try {
    const { error } = await client
      .from("records")
      .upsert(
        records.map((r) => toRow(r, userId)),
        { onConflict: "user_id,shop_id" },
      )
      .abortSignal(AbortSignal.timeout(ADOPT_TIMEOUT_MS));
    return !error;
  } catch {
    return false;
  }
}
