"use client";

import { useCallback, useState } from "react";
import { getSupabase } from "@/shared/api/supabase";
import { useRecords } from "./use-records";

export function useVisitAction(shopId: string) {
  const records = useRecords();
  const { toggleVisited, toggleSaved, isAuthed } = records;
  const [authPrompt, setAuthPrompt] = useState(false);

  const requireAuth = useCallback(() => {
    if (getSupabase() === null || isAuthed) return true;
    setAuthPrompt(true);
    return false;
  }, [isAuthed]);

  const visit = useCallback(() => {
    if (!requireAuth()) return;
    toggleVisited(shopId, new Date());
  }, [shopId, requireAuth, toggleVisited]);

  const save = useCallback(() => {
    if (!requireAuth()) return;
    toggleSaved(shopId);
  }, [shopId, requireAuth, toggleSaved]);

  const closeAuthPrompt = useCallback(() => setAuthPrompt(false), []);

  return { ...records, visit, save, authPrompt, closeAuthPrompt };
}
