import { LOGO_MONO_SVG, LOGO_SVG } from "@/shared/lib/logo";
import { cn } from "@/shared/lib/utils";

/* 심볼 마크. tile은 배경 타일 포함(아이콘 자리), mono는 흰 배경 위 전용 */
export function LogoMark({
  variant = "tile",
  className,
}: {
  variant?: "tile" | "mono";
  className?: string;
}) {
  return (
    <span
      className={cn("inline-block shrink-0", className)}
      aria-hidden
      dangerouslySetInnerHTML={{
        __html: variant === "mono" ? LOGO_MONO_SVG : LOGO_SVG,
      }}
    />
  );
}
