"use client";

import { Bookmark, Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useVisitAction } from "../model/use-visit-action";
import { LoginPromptSheet } from "./login-prompt-sheet";

/* 상세 하단 고정 CTA — 보조 아이콘 + 주 버튼 1개 (캐치테이블 문법) */
export function RecordCtaBar({ shopId }: { shopId: string }) {
  const { get, visit, save, authPrompt, closeAuthPrompt } =
    useVisitAction(shopId);
  const record = get(shopId);
  const visited = record?.visited ?? false;
  const saved = record?.saved ?? false;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-app border-t border-gray-100 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="저장"
          onClick={save}
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-card border",
            saved
              ? "border-ramen bg-ramen-050 text-ramen"
              : "border-gray-100 bg-white text-gray-500",
          )}
        >
          <Bookmark className="size-5" />
        </button>
        <button
          type="button"
          onClick={visit}
          className={cn(
            "flex h-12 flex-1 items-center justify-center gap-1.5 rounded-card text-body font-bold",
            visited
              ? "border border-ramen bg-ramen-050 text-ramen"
              : "bg-ramen text-white",
          )}
        >
          <Check className="size-4.5" />
          {visited ? "완식 ✓" : "완식"}
        </button>
      </div>
      <LoginPromptSheet open={authPrompt} onClose={closeAuthPrompt} />
    </div>
  );
}
