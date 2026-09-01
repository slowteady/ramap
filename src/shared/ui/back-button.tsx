"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/shared/lib/utils";

/* 진입 이력이 있으면 뒤로, 검색 착지처럼 첫 페이지면 홈으로 */
export function BackButton({
  fallbackHref = "/",
  className,
}: {
  fallbackHref?: string;
  className?: string;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="뒤로가기"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallbackHref);
      }}
      className={cn(
        "flex size-10 items-center justify-center rounded-pill text-ink",
        className,
      )}
    >
      <ChevronLeft className="size-5" />
    </button>
  );
}
