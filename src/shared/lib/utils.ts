import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/* globals.css @theme의 --text-* 스케일 — 미등록 시 text-body가 색으로 오인돼 text-ink와 충돌·삭제됨 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["caption", "secondary", "body", "title", "heading", "display"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
