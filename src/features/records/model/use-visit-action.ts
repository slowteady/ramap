"use client";

import { useCallback, useState } from "react";
import { getSupabase } from "@/shared/api/supabase";
import { track } from "@/shared/lib/analytics";
import { useRecords } from "./use-records";

export function useVisitAction(shopId: string) {
  const records = useRecords();
  const { toggleVisited, toggleSaved, isAuthed } = records;
  const [authPrompt, setAuthPrompt] = useState(false);
  const [logPrompt, setLogPrompt] = useState(false);

  const requireAuth = useCallback(() => {
    if (getSupabase() === null || isAuthed) return true;
    setAuthPrompt(true);
    return false;
  }, [isAuthed]);

  const visit = useCallback(() => {
    if (!requireAuth()) return;
    const record = toggleVisited(shopId, new Date());
    track("record_toggled", {
      kind: "visited",
      on: Boolean(record?.visited),
      shop_id: shopId,
    });
    if (record?.visited && getSupabase() !== null) setLogPrompt(true);
  }, [shopId, requireAuth, toggleVisited]);

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
  const closeLogPrompt = useCallback(() => setLogPrompt(false), []);

  return {
    ...records,
    visit,
    save,
    authPrompt,
    closeAuthPrompt,
    logPrompt,
    closeLogPrompt,
  };
}
