"use client";

import { useState } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { useAuth } from "@/features/auth";
import { LoginPromptSheet } from "@/features/records";

export function AuthEntry() {
  const { enabled, user, ready } = useAuth();
  const [open, setOpen] = useState(false);

  if (!enabled) return null;

  if (user) {
    return (
      <Link
        href="/me"
        aria-label="내 기록"
        className="-m-1.5 flex size-11 items-center justify-center rounded-pill"
      >
        <span className="flex size-8 items-center justify-center rounded-pill bg-gray-050 text-ink">
          <UserRound className="size-4.5" />
        </span>
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        aria-label="로그인"
        disabled={!ready}
        onClick={() => ready && setOpen(true)}
        className="-m-1.5 flex size-11 items-center justify-center rounded-pill disabled:opacity-40"
      >
        <span className="flex size-8 items-center justify-center rounded-pill bg-gray-050 text-ink">
          <UserRound className="size-4.5" />
        </span>
      </button>
      <LoginPromptSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
