"use client";

import { Bookmark, Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useVisitAction } from "../model/use-visit-action";
import { LoginPromptSheet } from "./login-prompt-sheet";

export function RecordButtons({
  shopId,
  className,
}: {
  shopId: string;
  className?: string;
}) {
  const { get, visit, save, authPrompt, closeAuthPrompt } =
    useVisitAction(shopId);
  const record = get(shopId);
  const visited = record?.visited ?? false;
  const saved = record?.saved ?? false;

  return (
    <div className={cn("flex gap-2", className)}>
      <button
        type="button"
        onClick={visit}
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 h-11 rounded-pill px-3.5 text-secondary font-bold transition-colors duration-150",
          visited
            ? "border border-ramen bg-ramen-050 text-ramen"
            : "bg-ramen text-white",
        )}
      >
        <Check className="size-4" />
        완식
      </button>
      <button
        type="button"
        onClick={save}
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 h-11 rounded-pill px-3.5 text-secondary font-bold",
          saved
            ? "border border-ramen bg-ramen-050 text-ramen"
            : "bg-gray-050 text-ink",
        )}
      >
        <Bookmark className="size-4" />
        저장
      </button>
      <LoginPromptSheet open={authPrompt} onClose={closeAuthPrompt} />
    </div>
  );
}
