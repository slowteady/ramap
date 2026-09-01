import { cn } from "@/shared/lib/utils";

/* 신규 오픈 표시 — 마커·목록·카드·상세 공통 한 단어 배지 (네이버 '새로오픈'·배민 '신규' 관례) */
export function NewChip({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-chip bg-ramen px-1.5 py-0.5 text-caption font-extrabold text-white",
        className,
      )}
    >
      NEW
    </span>
  );
}
