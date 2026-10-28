import { Check, Plus } from "lucide-react";
import type { ShopRecord } from "@/entities/record";
import { cn } from "@/shared/lib/utils";
import { visitLabel } from "../model/visit-label";

export function VisitButtonContent({
  record,
  iconClassName,
}: {
  record: ShopRecord | null;
  iconClassName: string;
}) {
  const { action, count } = visitLabel(record);
  const Icon = count ? Plus : Check;
  return (
    <>
      <Icon className={cn("shrink-0", iconClassName)} />
      {action}
      {count && <span className="font-semibold text-white/80">· {count}</span>}
    </>
  );
}
