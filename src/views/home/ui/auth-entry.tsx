"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useAuth, useNewResults } from "@/features/auth";

export function AuthEntry() {
  const { enabled } = useAuth();
  const { anyNew } = useNewResults();
  if (!enabled) return null;

  return (
    <Link
      href="/me"
      aria-label={anyNew ? "마이, 새 결과 있음" : "마이"}
      className="-m-1.5 flex size-11 items-center justify-center rounded-pill"
    >
      <span className="relative flex size-8 items-center justify-center rounded-pill bg-gray-050 text-ink">
        <UserRound className="size-4.5" />
        {anyNew && (
          <span
            aria-hidden
            className="absolute top-0 right-0 size-2 rounded-pill bg-ramen"
          />
        )}
      </span>
    </Link>
  );
}
