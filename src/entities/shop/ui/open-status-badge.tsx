"use client";

import { useEffect, useState } from "react";
import { openStatus, openStatusLabel } from "@/entities/shop/model/open-status";
import type { ShopStatus } from "@/entities/shop/model/types";
import { cn } from "@/shared/lib/utils";

type OpenStatusBadgeProps = {
  status: ShopStatus;
  hours: string | null;
  breakTime: string | null;
  closedDays: string | null;
  className?: string;
};

/* 시각 의존 계산은 마운트 후에만 — SSR/첫 렌더는 결정적인 영업시간 텍스트로 하이드레이션 불일치 방지 */
export function OpenStatusBadge({
  status,
  hours,
  breakTime,
  closedDays,
  className,
}: OpenStatusBadgeProps) {
  const [label, setLabel] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (status !== "open") return;
    const compute = () => {
      const result = openStatus(hours, breakTime, closedDays, new Date());
      setLabel(openStatusLabel(result));
      setOpen(result.kind === "open");
    };
    compute();
    const timer = setInterval(compute, 60_000);
    return () => clearInterval(timer);
  }, [status, hours, breakTime, closedDays]);

  if (status === "paused") {
    return (
      <span className={cn("text-secondary font-semibold text-gray-400", className)}>
        휴업 중
      </span>
    );
  }
  if (status !== "open") return null;

  const fallback = hours ? `영업시간 ${hours}` : null;
  const text = label ?? fallback;
  if (!text) return null;

  return (
    <span
      className={cn(
        "text-secondary font-semibold",
        label && open ? "text-open" : "text-gray-500",
        className,
      )}
    >
      {text}
    </span>
  );
}
