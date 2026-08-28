"use client";

import { useRecords } from "@/features/records";

export function StyleProgress({
  label,
  shopIds,
}: {
  label: string;
  shopIds: string[];
}) {
  const { visitedIds } = useRecords();
  const visited = shopIds.filter((id) => visitedIds.has(id)).length;
  if (visited === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 px-4 pt-4">
      <div className="flex items-baseline justify-between">
        <span className="text-secondary font-semibold text-ink">
          서울 {label}
        </span>
        <span className="text-secondary font-bold text-ink">
          {visited}/{shopIds.length}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-pill bg-gray-100">
        <div
          className="h-full rounded-pill bg-ramen"
          style={{ width: `${(visited / shopIds.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

export function VisitedCheck({ shopId }: { shopId: string }) {
  const { visitedIds } = useRecords();
  if (!visitedIds.has(shopId)) return null;
  return (
    <span className="rounded-pill bg-gray-050 px-2 py-0.5 text-caption font-bold text-ink">
      완식 ✓
    </span>
  );
}
