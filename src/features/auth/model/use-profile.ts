"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/shared/api/supabase";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/shared/config/legal";
import { useAuth } from "./use-auth";

type ProfileState = {
  nickname: string | null;
  agreedAt: string | null;
  role: string | null;
  loaded: boolean;
};

const EMPTY: ProfileState = {
  nickname: null,
  agreedAt: null,
  role: null,
  loaded: false,
};

export function useProfile() {
  const { user } = useAuth();
  const [state, setState] = useState<ProfileState>(EMPTY);

  useEffect(() => {
    const client = getSupabase();
    if (!client || !user) {
      setState(EMPTY);
      return;
    }
    let cancelled = false;
    void client
      .from("profiles")
      .select("nickname, agreed_at, role")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setState({
          nickname: data?.nickname ?? null,
          agreedAt: data?.agreed_at ?? null,
          role: data?.role ?? null,
          loaded: data !== null,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const agree = useCallback(async () => {
    const client = getSupabase();
    if (!client || !user) return false;
    const agreedAt = new Date().toISOString();
    const { error } = await client
      .from("profiles")
      .update({
        agreed_at: agreedAt,
        agreed_terms_version: TERMS_VERSION,
        agreed_privacy_version: PRIVACY_VERSION,
      })
      .eq("user_id", user.id);
    if (error) return false;
    setState((prev) => ({ ...prev, agreedAt }));
    return true;
  }, [user]);

  return {
    nickname: state.nickname,
    isAdmin: state.role === "admin",
    displayName: state.nickname ?? "라멘 러버",
    profileLoaded: state.loaded,
    agreedAt: state.agreedAt,
    needsConsent: state.loaded && state.agreedAt === null,
    agree,
  };
}
