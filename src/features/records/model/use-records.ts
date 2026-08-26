"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  createLocalRecordStore,
  type RecordStore,
  type ShopRecord,
} from "@/entities/record";

let store: RecordStore | null = null;
let snapshot: ShopRecord[] = [];
const listeners = new Set<() => void>();

function getStore(): RecordStore {
  if (!store) {
    store = createLocalRecordStore();
    snapshot = store.all();
  }
  return store;
}

function notify() {
  snapshot = getStore().all();
  for (const listener of listeners) listener();
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
