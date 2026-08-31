"use client";

import { Bookmark, Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useVisitAction } from "../model/use-visit-action";
import { LoginPromptSheet } from "./login-prompt-sheet";

export function RecordButtons({ shopId }: { shopId: string }) {
  const { get, visit, save, authPrompt, closeAuthPrompt } =
    useVisitAction(shopId);
  const record = get(shopId);
  const visited = record?.status === "visited";
  const want = record?.status === "want";

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={visit}
        className={cn(
          "flex items-center gap-1.5 rounded-pill px-3.5 py-2 text-secondary font-bold transition-colors duration-150",
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
        disabled={visited}
        className={cn(
          "flex items-center gap-1.5 rounded-pill px-3.5 py-2 text-secondary font-bold",
          want
            ? "border border-ramen bg-ramen-050 text-ramen"
            : "bg-gray-050 text-ink",
          visited && "opacity-40",
        )}
      >
        <Bookmark className="size-4" />
        저장
      </button>
      <LoginPromptSheet open={authPrompt} onClose={closeAuthPrompt} />
    </div>
  );
}
