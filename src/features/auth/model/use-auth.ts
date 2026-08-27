"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/shared/api/supabase";

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

  const signInWithKakao = useCallback(() => {
    void getSupabase()?.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: window.location.origin },
    });
  }, []);

  const signOut = useCallback(() => {
    void getSupabase()?.auth.signOut();
  }, []);

  return { enabled, user, ready, signInWithKakao, signOut };
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
