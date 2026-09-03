"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { DiscardDialog } from "@/shared/ui/discard-dialog";
import type { PinPickerControls } from "../model/pin-pick";
import type { ReportTarget } from "../model/report-payload";
import { useReportQuery } from "../model/use-report-query";
import { EditReportForm } from "./edit-report-form";
import { NewReportForm } from "./new-report-form";

/* 홈 상시 시트(z-50) 위에 떠야 하므로 z-60 */
export function ReportSheet({
  editTarget,
  picker,
}: {
  editTarget?: ReportTarget;
  picker?: PinPickerControls;
}) {
  const { query, pick, close } = useReportQuery();
  const dirtyRef = useRef(false);
  const [confirming, setConfirming] = useState(false);
  if (!query) return null;

  const requestClose = () => {
    if (dirtyRef.current) setConfirming(true);
    else close();
  };

  const edit =
    query.kind === "edit" && editTarget?.id === query.shopId
      ? editTarget
      : null;
  if (query.kind === "edit" && !edit) return null;

  /* 픽 모드: 폼은 언마운트 없이 숨기고 컨테이너를 투명하게 — 뒤의 ShopMap이 그대로 조준면 */
  const picking = query.kind === "new" && pick && Boolean(picker);

  return (
    <div
      className={cn(
        "fixed inset-0 z-60 mx-auto flex w-full max-w-app flex-col duration-300 animate-in slide-in-from-bottom",
        picking ? "pointer-events-none" : "bg-white",
      )}
    >
      <header
        className={cn(
          "flex shrink-0 items-center gap-1 px-2 py-2",
          picking && "hidden",
        )}
      >
        <button
          type="button"
          aria-label="닫기"
          onClick={requestClose}
          className="flex size-10 shrink-0 items-center justify-center rounded-pill text-ink"
        >
          <X className="size-5" />
        </button>
        <h1 className="min-w-0 truncate text-title font-bold text-ink">
          {edit ? "정보 수정" : "새 라멘집 등록"}
        </h1>
      </header>
      {edit ? (
        <EditReportForm
          key={edit.id}
          target={edit}
          onClose={close}
          dirtyRef={dirtyRef}
        />
      ) : (
        <NewReportForm picker={picker} onClose={close} dirtyRef={dirtyRef} />
      )}
      <DiscardDialog
        open={confirming}
        title={edit ? "정보 수정을 그만할까요?" : "라멘집 등록을 그만할까요?"}
        onLeave={() => {
          setConfirming(false);
          close();
        }}
        onStay={() => setConfirming(false)}
      />
    </div>
  );
}
