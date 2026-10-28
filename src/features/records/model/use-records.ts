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
  | { type: "visit"; shopId: string; at?: Date }
  | { type: "clearVisit"; shopId: string }
  | { type: "restore"; shopId: string; record: ShopRecord | null }
  | { type: "saved"; shopId: string; on: boolean };

let localStore: RecordStore | null = null;
let activeStore: RecordStore | null = null;
let snapshot: ShopRecord[] = [];
let authWired = false;
let adoptSeq = 0;
let currentAdopt = 0;
let adoptedUserId: string | null = null;
let sessionUserId: string | null = null;
let synced = false;
let pendingOps: PendingOp[] | null = null;
const listeners = new Set<() => void>();

function notify() {
  snapshot = [...(activeStore?.all() ?? [])];
  for (const listener of listeners) listener();
}

/* 저장 토글 재적용은 merge 결과에 따라 역전될 수 있어 목표 상태로 멱등 적용 */
function applyOp(store: RecordStore, op: PendingOp) {
  if (op.type === "visit") store.addVisit(op.shopId, op.at);
  else if (op.type === "clearVisit") store.clearVisit(op.shopId);
  else if (op.type === "restore") store.restore(op.shopId, op.record);
  else if ((store.get(op.shopId)?.saved ?? false) !== op.on)
    store.toggleSaved(op.shopId);
}

function abortAdopt() {
  currentAdopt = 0;
  pendingOps = null;
}

async function adoptServer(
  client: SupabaseClient,
  userId: string,
  token: number,
) {
  if (currentAdopt !== token) return;

  const server = await fetchRecords(client, userId);
  if (currentAdopt !== token) return;
  if (server === null) {
    abortAdopt();
    return;
  }

  /* merge 입력 = 스토리지 재읽기(다른 탭 이관·클리어 반영) + 메모리(스토리지 쓰기 불가 폴백 보존) */
  const local = mergeRecords(
    createLocalRecordStore().all(),
    localStore?.all() ?? [],
  );
  const merged = mergeRecords(server, local);
  /* 큐는 merge 스냅샷 이후부터 — fetch 창의 조작은 이미 merged에 포함돼 재적용하면 이중 계산 */
  pendingOps = [];
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
    if (userId !== sessionUserId) {
      sessionUserId = userId;
      notify();
    }
    if (userId && userId !== adoptedUserId && currentAdopt === 0) {
      /* 예약 시점에 토큰 선점 — 예약~실행 사이의 SIGNED_OUT이 취소할 수 있게 */
      const token = ++adoptSeq;
      currentAdopt = token;
      /* 콜백 내 Supabase 호출은 내부 락과 교착 가능(supabase-js 문서) — 다음 틱으로 */
      setTimeout(() => void adoptServer(client, userId, token), 0);
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

  const addVisit = useCallback((shopId: string, at?: Date) => {
    const record = getStore().addVisit(shopId, at);
    pendingOps?.push({ type: "visit", shopId, at });
    notify();
    return record;
  }, []);

  const clearVisit = useCallback((shopId: string) => {
    const record = getStore().clearVisit(shopId);
    pendingOps?.push({ type: "clearVisit", shopId });
    notify();
    return record;
  }, []);

  const restore = useCallback((shopId: string, record: ShopRecord | null) => {
    getStore().restore(shopId, record);
    pendingOps?.push({ type: "restore", shopId, record });
    notify();
  }, []);

  const toggleSaved = useCallback((shopId: string) => {
    const record = getStore().toggleSaved(shopId);
    pendingOps?.push({ type: "saved", shopId, on: record?.saved ?? false });
    notify();
    return record;
  }, []);

  const get = useCallback(
    (shopId: string) => records.find((r) => r.shopId === shopId) ?? null,
    [records],
  );

  const visitedIds = new Set(
    records.filter((r) => r.visited).map((r) => r.shopId),
  );

  return {
    records,
    visitedIds,
    get,
    addVisit,
    clearVisit,
    restore,
    toggleSaved,
    isSynced: synced,
    isAuthed: sessionUserId !== null,
  };
}
