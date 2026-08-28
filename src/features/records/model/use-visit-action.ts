"use client";

import { useCallback, useState } from "react";
import { getSupabase } from "@/shared/api/supabase";
import { useRecords } from "./use-records";

export function useVisitAction(shopId: string) {
  const records = useRecords();
  const { get, markVisited, markWant, remove, isAuthed } = records;
  const [authPrompt, setAuthPrompt] = useState(false);

  const requireAuth = useCallback(() => {
    if (getSupabase() === null || isAuthed) return true;
    setAuthPrompt(true);
    return false;
  }, [isAuthed]);

  const visit = useCallback(() => {
    if (!requireAuth()) return;
    const visited = get(shopId)?.status === "visited";
    if (visited) remove(shopId);
    else markVisited(shopId, new Date());
  }, [shopId, requireAuth, get, markVisited, remove]);

  const save = useCallback(() => {
    if (!requireAuth()) return;
    const want = get(shopId)?.status === "want";
    if (want) remove(shopId);
    else markWant(shopId);
  }, [shopId, requireAuth, get, markWant, remove]);

  const closeAuthPrompt = useCallback(() => setAuthPrompt(false), []);

  return { ...records, visit, save, authPrompt, closeAuthPrompt };
}
