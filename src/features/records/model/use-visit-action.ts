"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { getSupabase } from "@/shared/api/supabase";
import { track } from "@/shared/lib/analytics";
import { useRecords } from "./use-records";
import { visitOrdinalLabel } from "./visit-ordinal";

export function useVisitAction(shopId: string) {
  const records = useRecords();
  const { get, addVisit, toggleSaved, isAuthed } = records;
  const [authPrompt, setAuthPrompt] = useState(false);
  const [logPrompt, setLogPrompt] = useState(false);

  const requireAuth = useCallback(() => {
    if (getSupabase() === null || isAuthed) return true;
    setAuthPrompt(true);
    return false;
  }, [isAuthed]);

  const commitVisit = useCallback(() => {
    const record = addVisit(shopId, new Date());
    track("record_toggled", { kind: "visited", on: true, shop_id: shopId });
    toast(`${visitOrdinalLabel(record.count)} 완식을 기록했어요`);
  }, [shopId, addVisit]);

  const visit = useCallback(() => {
    if (!requireAuth()) return;
    if (getSupabase() === null) commitVisit();
    else setLogPrompt(true);
  }, [requireAuth, commitVisit]);

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

  const current = get(shopId);
  const nextOrdinal = (current?.visited ? current.count : 0) + 1;

  return {
    ...records,
    visit,
    commitVisit,
    save,
    authPrompt,
    closeAuthPrompt,
    logPrompt,
    nextOrdinal,
    closeLogPrompt,
  };
}
