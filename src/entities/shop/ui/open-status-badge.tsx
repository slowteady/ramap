import dayjs from "dayjs";
import type { ShopStatus } from "@/entities/shop/model/types";
import { cn } from "@/shared/lib/utils";

type OpenStatusBadgeProps = {
  status: ShopStatus;
  hours: string | null;
  breakTime: string | null;
  closedDays: string | null;
  closedAt?: string | null;
  className?: string;
};

/* 실시간 "영업중" 판정은 시트 데이터 최신성이 보장되기 전까지 표시하지 않는다 — 시간 정보만 전달 */
export function OpenStatusBadge({
  status,
  hours,
  breakTime,
  closedDays,
  closedAt,
  className,
}: OpenStatusBadgeProps) {
  if (status !== "open") {
    return (
      <span
        className={cn("text-secondary font-semibold text-gray-400", className)}
      >
        {status === "paused"
          ? "휴업 중"
          : closedAt && dayjs(closedAt).isValid()
            ? `폐업 · ${dayjs(closedAt).format("YYYY년 M월")}`
            : "폐업"}
      </span>
    );
  }

  const parts: string[] = [];
  if (hours) parts.push(hours);
  if (breakTime) parts.push(`브레이크 ${breakTime}`);
  if (closedDays) parts.push(`${closedDays} 휴무`);
  if (parts.length === 0) return null;

  return (
    <span className={cn("text-secondary text-gray-500", className)}>
      {parts.join(" · ")}
    </span>
  );
}
