import { Check } from "lucide-react";
import type { Confidence } from "../model/types";
import { cn } from "@/shared/lib/utils";

/* 조사로 장르가 확인된 매장만 표시 — 미확인은 배지를 붙이지 않는다(부정 신호 노출 금지) */
export function VerifiedChip({
  confidence,
  className,
}: {
  confidence: Confidence;
  className?: string;
}) {
  if (confidence !== "certain") return null;
  return (
    <span
      className={cn(
        "flex shrink-0 items-center gap-0.5 rounded-chip bg-gray-050 px-1.5 py-0.5 text-caption font-semibold text-gray-500",
        className,
      )}
    >
      <Check className="size-3" strokeWidth={3} />
      확인됨
    </span>
  );
}
