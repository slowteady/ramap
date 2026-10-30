"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { composeReason } from "../model/report-view";

export function RejectPanel({
  reasons,
  onCancel,
  onConfirm,
}: {
  reasons: readonly string[];
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [chip, setChip] = useState<string | null>(null);
  const [text, setText] = useState("");
  const reason = composeReason(chip, text);

  return (
    <div className="flex flex-col gap-2.5 rounded-card bg-gray-050 p-3">
      <p className="text-secondary font-semibold text-ink">반려 사유</p>
      <div className="flex flex-wrap gap-1.5">
        {reasons.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={chip === r}
            onClick={() => setChip(chip === r ? null : r)}
            className={cn(
              "h-9 rounded-pill border px-3 text-secondary font-semibold",
              chip === r
                ? "border-ramen bg-ramen-050 text-ramen"
                : "border-gray-150 bg-white text-ink",
            )}
          >
            {r}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="직접 입력 (선택)"
        className="h-11 min-w-0 rounded-card border border-gray-150 bg-white px-3 text-secondary"
      />
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="h-11 rounded-pill px-4 text-secondary font-semibold text-gray-400"
        >
          닫기
        </button>
        <button
          type="button"
          disabled={!reason}
          onClick={() => onConfirm(reason)}
          className="h-11 rounded-pill bg-gray-500 px-5 text-secondary font-bold text-white disabled:bg-gray-200"
        >
          반려하기
        </button>
      </div>
    </div>
  );
}
