"use client";

import { useRecords } from "@/features/records";

export function VisitedCheck({ shopId }: { shopId: string }) {
  const { visitedIds } = useRecords();
  if (!visitedIds.has(shopId)) return null;
  return (
    <span className="rounded-pill bg-gray-050 px-2 py-0.5 text-caption font-bold text-ink">
      완식 ✓
    </span>
  );
}
