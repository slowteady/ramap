import Link from "next/link";
import { ChevronRight } from "lucide-react";

/* 캐치테이블 관례 — 정보 섹션 하단의 일급 행 + 질문형 리드 */
export function ReportEntryRow({ shopId }: { shopId: string }) {
  return (
    <Link
      href={`/shop/${shopId}?report=edit&shop=${shopId}`}
      scroll={false}
      className="flex items-center justify-between gap-3 px-4 py-4"
    >
      <span className="flex flex-col gap-0.5">
        <span className="text-body font-semibold text-ink">
          잘못된 정보가 있나요?
        </span>
        <span className="text-secondary text-gray-400">
          수정이 필요하거나 폐업한 매장이라면 알려주세요
        </span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-gray-300" />
    </Link>
  );
}
