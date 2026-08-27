"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  clearLocalRecords,
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

type PendingOp =
  | { type: "visited"; shopId: string; at?: Date }
  | { type: "want"; shopId: string }
  | { type: "remove"; shopId: string };

let localStore: RecordStore | null = null;
let activeStore: RecordStore | null = null;
let snapshot: ShopRecord[] = [];
let authWired = false;
let adoptSeq = 0;
let currentAdopt = 0;
let adoptedUserId: string | null = null;
let synced = false;
let pendingOps: PendingOp[] | null = null;
const listeners = new Set<() => void>();

function notify() {
  snapshot = activeStore?.all() ?? [];
  for (const listener of listeners) listener();
}

function applyOp(store: RecordStore, op: PendingOp) {
  if (op.type === "visited") store.markVisited(op.shopId, op.at);
  else if (op.type === "want") store.markWant(op.shopId);
  else store.remove(op.shopId);
}

function abortAdopt() {
  currentAdopt = 0;
  pendingOps = null;
}

async function adoptServer(client: SupabaseClient, userId: string) {
  const token = ++adoptSeq;
  currentAdopt = token;
  pendingOps = [];

  const server = await fetchRecords(client, userId);
  if (currentAdopt !== token) return;
  if (server === null) {
    abortAdopt();
    return;
  }

  const merged = mergeRecords(server, localStore?.all() ?? []);
  const pushed = await pushRecords(client, userId, merged);
  if (currentAdopt !== token) return;
  if (!pushed) {
    abortAdopt();
    return;
  }

  const store = createSyncedRecordStore(merged, supabaseSink(client, userId));
  for (const op of pendingOps ?? []) applyOp(store, op);
  pendingOps = null;
  currentAdopt = 0;
  adoptedUserId = userId;
  synced = true;
  activeStore = store;
  clearLocalRecords();
  localStore = createLocalRecordStore();
  notify();
}

function wireAuth() {
  if (authWired) return;
  authWired = true;
  const client = getSupabase();
  if (!client) return;
  client.auth.onAuthStateChange((_event, session) => {
    const userId = session?.user?.id ?? null;
    if (userId && userId !== adoptedUserId && currentAdopt === 0) {
      /* 콜백 내 Supabase 호출은 내부 락과 교착 가능(supabase-js 문서) — 다음 틱으로 */
      setTimeout(() => void adoptServer(client, userId), 0);
    } else if (!userId && (adoptedUserId || currentAdopt !== 0)) {
      abortAdopt();
      adoptedUserId = null;
      synced = false;
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
  }
  return activeStore;
}

function subscribe(listener: () => void): () => void {
  getStore();
  wireAuth();
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

  const markVisited = useCallback((shopId: string, at?: Date) => {
    const record = getStore().markVisited(shopId, at);
    pendingOps?.push({ type: "visited", shopId, at });
    notify();
    return record;
  }, []);

  const markWant = useCallback((shopId: string) => {
    getStore().markWant(shopId);
    pendingOps?.push({ type: "want", shopId });
    notify();
  }, []);

  const remove = useCallback((shopId: string) => {
    getStore().remove(shopId);
    pendingOps?.push({ type: "remove", shopId });
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

  return {
    records,
    visitedIds,
    get,
    markVisited,
    markWant,
    remove,
    exportDownload,
    isSynced: synced,
  };
}
