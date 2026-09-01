"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useAuth } from "@/features/auth";

export function AuthEntry() {
  const { enabled } = useAuth();
  if (!enabled) return null;

  return (
    <Link
      href="/me"
      aria-label="마이"
      className="-m-1.5 flex size-11 items-center justify-center rounded-pill"
    >
      <span className="flex size-8 items-center justify-center rounded-pill bg-gray-050 text-ink">
        <UserRound className="size-4.5" />
      </span>
    </Link>
  );
}
