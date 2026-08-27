"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createLocalRecordStore,
  createSyncedRecordStore,
  fetchRecords,
  mergeRecords,
  pushRecords,
  supabaseSink,
  type RecordStore,
  type ShopRecord,
} from "@/entities/record";
import { getSupabase } from "@/shared/api/supabase";

let localStore: RecordStore | null = null;
let activeStore: RecordStore | null = null;
let snapshot: ShopRecord[] = [];
let authWired = false;
let adoptedUserId: string | null = null;
const listeners = new Set<() => void>();

function notify() {
  snapshot = activeStore?.all() ?? [];
  for (const listener of listeners) listener();
}

async function adoptServer(client: SupabaseClient, userId: string) {
  adoptedUserId = userId;
  const server = await fetchRecords(client, userId);
  if (adoptedUserId !== userId) return;
  const merged = mergeRecords(server, localStore?.all() ?? []);
  await pushRecords(client, userId, merged).catch(() => {});
  if (adoptedUserId !== userId) return;
  /* push 동안 들어온 로컬 쓰기 유실 방지 — 교체 직전 재병합 */
  const finalMerged = mergeRecords(merged, localStore?.all() ?? []);
  activeStore = createSyncedRecordStore(finalMerged, supabaseSink(client, userId));
  notify();
}

function wireAuth() {
  if (authWired) return;
  authWired = true;
  const client = getSupabase();
  if (!client) return;
  client.auth.onAuthStateChange((_event, session) => {
    const userId = session?.user?.id ?? null;
    if (userId && userId !== adoptedUserId) {
      /* 콜백 내 Supabase 호출은 내부 락과 교착 가능(supabase-js 문서) — 다음 틱으로 */
      setTimeout(() => void adoptServer(client, userId), 0);
    } else if (!userId && adoptedUserId) {
      adoptedUserId = null;
      activeStore = localStore;
      notify();
    }
  });
}

function getStore(): RecordStore {
  if (!activeStore) {
    localStore = createLocalRecordStore();
    activeStore = localStore;
    snapshot = activeStore.all();
    wireAuth();
  }
  return activeStore;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const EMPTY: ShopRecord[] = [];

export function useRecords() {
  const records = useSyncExternalStore(
    subscribe,
    () => {
      getStore();
      return snapshot;
    },
    () => EMPTY,
  );

  const markVisited = useCallback((shopId: string) => {
    const record = getStore().markVisited(shopId);
    notify();
    return record;
  }, []);

  const markWant = useCallback((shopId: string) => {
    getStore().markWant(shopId);
    notify();
  }, []);

  const remove = useCallback((shopId: string) => {
    getStore().remove(shopId);
    notify();
  }, []);

  const exportDownload = useCallback(() => {
    const json = getStore().exportJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ramap-records.json";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const get = useCallback(
    (shopId: string) => records.find((r) => r.shopId === shopId) ?? null,
    [records],
  );

  const visitedIds = new Set(
    records.filter((r) => r.status === "visited").map((r) => r.shopId),
  );

  return { records, visitedIds, get, markVisited, markWant, remove, exportDownload };
}
