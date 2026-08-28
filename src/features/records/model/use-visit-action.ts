"use client";

import { useCallback, useState } from "react";
import { getSupabase } from "@/shared/api/supabase";
import { useRecords } from "./use-records";

export type RecordAction = "visit" | "save";

export function useVisitAction(shopId: string) {
  const records = useRecords();
  const { get, markVisited, markWant, remove, isAuthed } = records;
  const [authPrompt, setAuthPrompt] = useState<RecordAction | null>(null);

  const requireAuth = useCallback(
    (action: RecordAction) => {
      if (getSupabase() === null || isAuthed) return true;
      setAuthPrompt(action);
      return false;
    },
    [isAuthed],
  );

  const visit = useCallback(() => {
    if (!requireAuth("visit")) return;
    const visited = get(shopId)?.status === "visited";
    if (visited) remove(shopId);
    else markVisited(shopId, new Date());
  }, [shopId, requireAuth, get, markVisited, remove]);

  const save = useCallback(() => {
    if (!requireAuth("save")) return;
    const want = get(shopId)?.status === "want";
    if (want) remove(shopId);
    else markWant(shopId);
  }, [shopId, requireAuth, get, markWant, remove]);

  const closeAuthPrompt = useCallback(() => setAuthPrompt(null), []);

  return { ...records, visit, save, authPrompt, closeAuthPrompt };
}
