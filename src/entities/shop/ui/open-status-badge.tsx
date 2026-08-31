import type { ShopStatus } from "@/entities/shop/model/types";
import { cn } from "@/shared/lib/utils";

type OpenStatusBadgeProps = {
  status: ShopStatus;
  hours: string | null;
  breakTime: string | null;
  closedDays: string | null;
  className?: string;
};

/* 실시간 "영업중" 판정은 시트 데이터 최신성이 보장되기 전까지 표시하지 않는다 — 시간 정보만 전달 */
export function OpenStatusBadge({
  status,
  hours,
  breakTime,
  closedDays,
  className,
}: OpenStatusBadgeProps) {
  if (status === "paused") {
    return (
      <span
        className={cn("text-secondary font-semibold text-gray-400", className)}
      >
        휴업 중
      </span>
    );
  }
  if (status !== "open") return null;

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
