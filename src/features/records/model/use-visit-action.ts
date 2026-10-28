"use client";

import { useCallback, useState } from "react";
import type { ShopRecord } from "@/entities/record";
import { getSupabase } from "@/shared/api/supabase";
import { track } from "@/shared/lib/analytics";
import { useRecords } from "./use-records";

type LogPrompt = { ordinal: number; before: ShopRecord | null };

export function useVisitAction(shopId: string) {
  const records = useRecords();
  const { get, addVisit, restore, toggleSaved, isAuthed } = records;
  const [authPrompt, setAuthPrompt] = useState(false);
  const [logPrompt, setLogPrompt] = useState<LogPrompt | null>(null);

  const requireAuth = useCallback(() => {
    if (getSupabase() === null || isAuthed) return true;
    setAuthPrompt(true);
    return false;
  }, [isAuthed]);

  const visit = useCallback(() => {
    if (!requireAuth()) return;
    const before = get(shopId);
    const record = addVisit(shopId, new Date());
    track("record_toggled", { kind: "visited", on: true, shop_id: shopId });
    if (getSupabase() !== null) setLogPrompt({ ordinal: record.count, before });
  }, [shopId, requireAuth, get, addVisit]);

  const undoVisit = useCallback(() => {
    if (!logPrompt) return;
    restore(shopId, logPrompt.before);
    track("record_toggled", { kind: "visited", on: false, shop_id: shopId });
    setLogPrompt(null);
  }, [shopId, logPrompt, restore]);

  const save = useCallback(() => {
    if (!requireAuth()) return;
    const record = toggleSaved(shopId);
    track("record_toggled", {
      kind: "saved",
      on: Boolean(record?.saved),
      shop_id: shopId,
    });
  }, [shopId, requireAuth, toggleSaved]);

  const closeAuthPrompt = useCallback(() => setAuthPrompt(false), []);
  const closeLogPrompt = useCallback(() => setLogPrompt(null), []);

  return {
    ...records,
    visit,
    undoVisit,
    save,
    authPrompt,
    closeAuthPrompt,
    logPrompt: logPrompt !== null,
    visitOrdinal: logPrompt?.ordinal ?? null,
    closeLogPrompt,
  };
}
