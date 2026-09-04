import { LOGO_SVG } from "@/shared/lib/logo";
import { cn } from "@/shared/lib/utils";

/* 심볼 마크 — 헤더 워드마크 앞에 붙는 라운드 타일. SVG 본문은 shared/lib/logo 단일 원천 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-block shrink-0", className)}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: LOGO_SVG }}
    />
  );
}
