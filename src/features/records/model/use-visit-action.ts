"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { getSupabase, signInWithKakao } from "@/shared/api/supabase";
import { useRecords } from "./use-records";

export function useVisitAction(shopId: string) {
  const records = useRecords();
  const { get, markVisited, markWant, remove, isAuthed } = records;

  /* 어뷰징 방지 — 서버 저장이 가능한 환경에선 로그인해야 기록 (좋아요 문법) */
  const requireAuth = useCallback(() => {
    if (getSupabase() === null || isAuthed) return true;
    toast("로그인하면 완식 기록이 저장돼요", {
      action: { label: "카카오 로그인", onClick: signInWithKakao },
    });
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

  return { ...records, visit, save };
}
