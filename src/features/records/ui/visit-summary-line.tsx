"use client";

import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { visitSummary } from "../model/visit-summary";
import { useRecords } from "../model/use-records";

export function VisitSummaryLine({
  shopId,
  className,
}: {
  shopId: string;
  className?: string;
}) {
  const { get } = useRecords();
  const summary = visitSummary(get(shopId), new Date());
  if (!summary) return null;
  return (
    <p
      className={cn(
        "flex items-center gap-1 text-secondary font-semibold text-ramen",
        className,
      )}
    >
      <Check className="size-3.5 shrink-0" />
      {summary}
    </p>
  );
}
