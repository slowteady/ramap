"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  getSupabase,
  signInWithKakao as kakaoSignIn,
} from "@/shared/api/supabase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const enabled = getSupabase() !== null;

  useEffect(() => {
    const client = getSupabase();
    if (!client) {
      setReady(true);
      return;
    }
    void client.auth
      .getSession()
      .then(({ data }) => setUser(data.session?.user ?? null))
      .catch(() => {})
      .finally(() => setReady(true));
    const { data: sub } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signInWithKakao = useCallback(() => kakaoSignIn(), []);

  const signOut = useCallback(() => {
    void getSupabase()?.auth.signOut();
  }, []);

  /* 삭제 후에도 JWT는 만료까지 유효 — 로컬 세션을 즉시 정리 */
  const deleteAccount = useCallback(async () => {
    const client = getSupabase();
    if (!client) return false;
    const { error } = await client.rpc("delete_own_account");
    if (error) return false;
    await client.auth.signOut({ scope: "local" });
    return true;
  }, []);

  return { enabled, user, ready, signInWithKakao, signOut, deleteAccount };
}

export function displayName(user: User | null): string {
  if (!user) return "";
  const meta = user.user_metadata as Record<string, unknown>;
  return (
    (typeof meta.name === "string" && meta.name) ||
    (typeof meta.preferred_username === "string" && meta.preferred_username) ||
    "라멘 러버"
  );
}
