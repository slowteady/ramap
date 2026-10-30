import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function ReportEntryRow({ shopId }: { shopId: string }) {
  return (
    <Link
      href={`/shop/${shopId}?report=edit&shop=${shopId}`}
      scroll={false}
      className="flex items-center justify-between gap-3 px-4 py-4"
    >
      <span className="text-body font-semibold text-ink">
        정보가 달라졌다면 알려주세요
      </span>
      <ChevronRight className="size-5 shrink-0 text-gray-300" />
    </Link>
  );
}
