"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/shared/api/supabase";
import { useAuth } from "./use-auth";

export function useProfile() {
  const { user } = useAuth();
  const [nickname, setNickname] = useState<string | null>(null);

  useEffect(() => {
    const client = getSupabase();
    if (!client || !user) {
      setNickname(null);
      return;
    }
    let cancelled = false;
    void client
      .from("profiles")
      .select("nickname")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setNickname(data?.nickname ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { nickname, displayName: nickname ?? "라멘 러버" };
}
