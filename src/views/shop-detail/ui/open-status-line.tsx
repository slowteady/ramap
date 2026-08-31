"use client";

import { useEffect, useState } from "react";
import { openStatus, openStatusLabel, type OpenStatus } from "@/entities/shop";
import { cn } from "@/shared/lib/utils";

type OpenStatusLineProps = {
  hours: string | null;
  breakTime: string | null;
  closedDays: string | null;
  className?: string;
};

/* SSG 페이지라 현재 시각 판정은 클라이언트에서만 — 서버 렌더에선 비움 */
export function OpenStatusLine({
  hours,
  breakTime,
  closedDays,
  className,
}: OpenStatusLineProps) {
  const [status, setStatus] = useState<OpenStatus | null>(null);

  useEffect(() => {
    const tick = () =>
      setStatus(openStatus(hours, breakTime, closedDays, new Date()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [hours, breakTime, closedDays]);

  const label = status ? openStatusLabel(status) : null;
  if (!label) return null;

  return (
    <p
      className={cn(
        "text-secondary font-semibold",
        status?.kind === "open" ? "text-open" : "text-gray-500",
        className,
      )}
    >
      {label}
    </p>
  );
}
