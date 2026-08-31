"use client";

import { X } from "lucide-react";
import type { ReportTarget } from "../model/report-payload";
import { useReportQuery } from "../model/use-report-query";
import { EditReportForm } from "./edit-report-form";
import { NewReportForm } from "./new-report-form";

/* 홈 상시 시트(z-50) 위에 떠야 하므로 z-60 */
export function ReportSheet({ editTarget }: { editTarget?: ReportTarget }) {
  const { query, close } = useReportQuery();
  if (!query) return null;

  const edit =
    query.kind === "edit" && editTarget?.id === query.shopId
      ? editTarget
      : null;
  if (query.kind === "edit" && !edit) return null;

  return (
    <div className="fixed inset-0 z-60 mx-auto flex w-full max-w-app flex-col bg-white duration-300 animate-in slide-in-from-bottom">
      <header className="flex shrink-0 items-center gap-1 px-2 py-2">
        <button
          type="button"
          aria-label="닫기"
          onClick={close}
          className="flex size-10 shrink-0 items-center justify-center rounded-pill text-ink"
        >
          <X className="size-5" />
        </button>
        <h1 className="min-w-0 truncate text-title font-bold text-ink">
          {edit ? `${edit.name} 정보 수정` : "새 라멘집 제보"}
        </h1>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {edit ? (
          <EditReportForm key={edit.id} target={edit} onClose={close} />
        ) : (
          <NewReportForm onClose={close} />
        )}
      </div>
    </div>
  );
}
