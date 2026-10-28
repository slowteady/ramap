"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { DiscardDialog } from "@/shared/ui/discard-dialog";
import { Drawer, DrawerContent, DrawerTitle } from "@/shared/ui/drawer";
import { track } from "@/shared/lib/analytics";
import { PhotoPicker } from "@/shared/ui/photo-picker";
import { COMMENT_MAX, RECORD_PHOTO_MAX } from "../model/record-photo-ops";
import { submitRecordPhotos } from "../model/record-photos";
import { visitOrdinalLabel } from "../model/visit-ordinal";

type SheetState = "idle" | "submitting" | "failed";

export function RecordLogSheet({
  shopId,
  open,
  nextOrdinal,
  onVisit,
  onClose,
  onSubmitted,
}: {
  shopId: string;
  open: boolean;
  nextOrdinal?: number | null;
  onVisit?: () => void;
  onClose: () => void;
  onSubmitted?: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(true);
  const [state, setState] = useState<SheetState>("idle");
  const [confirming, setConfirming] = useState(false);

  if (!open) return null;

  const dirty = files.length > 0 || comment.trim() !== "";
  const requestClose = () => {
    if (dirty) setConfirming(true);
    else onClose();
  };

  const visitMode = onVisit !== undefined;
  const canSubmit = (visitMode || files.length > 0) && state !== "submitting";

  const submit = async () => {
    if (!canSubmit) return;
    if (files.length > 0) {
      setState("submitting");
      const result = await submitRecordPhotos({
        shopId,
        files,
        comment,
        consent,
      });
      track("record_log_submitted", {
        shop_id: shopId,
        photo_count: files.length,
        has_comment: comment.trim().length > 0,
        revisit: (nextOrdinal ?? 1) > 1,
        ok: result.ok,
        ...(result.ok ? {} : { failed_step: result.step }),
      });
      if (!result.ok) {
        setState("failed");
        return;
      }
      onSubmitted?.();
    }
    onVisit?.();
    onClose();
  };

  return (
    <Drawer open onOpenChange={(next) => !next && requestClose()}>
      <DrawerContent showClose>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 pt-5 pb-8">
          <div className="flex flex-col gap-1">
            <DrawerTitle className="text-title font-bold text-ink">
              완식 기록 남기기
            </DrawerTitle>
            <p className="text-secondary text-gray-500">
              {visitMode && nextOrdinal
                ? `${visitOrdinalLabel(nextOrdinal)} 완식이에요`
                : "오늘의 한 그릇을 사진으로 남겨보세요"}
            </p>
          </div>

          <PhotoPicker
            files={files}
            max={RECORD_PHOTO_MAX}
            onAdd={(picked) =>
              setFiles((prev) =>
                [...prev, ...picked].slice(0, RECORD_PHOTO_MAX),
              )
            }
            onRemove={(index) =>
              setFiles((prev) => prev.filter((_, i) => i !== index))
            }
          />

          <div className="flex flex-col gap-1.5">
            <input
              type="text"
              value={comment}
              maxLength={COMMENT_MAX}
              onChange={(e) => setComment(e.target.value)}
              disabled={files.length === 0}
              placeholder={
                files.length === 0
                  ? "한줄평 (사진을 넣으면 쓸 수 있어요)"
                  : "한줄평 (선택)"
              }
              className="h-12 rounded-card border border-gray-100 bg-white px-3.5 text-body text-ink placeholder:text-gray-300 focus:border-gray-300 focus:outline-none disabled:bg-gray-050"
            />
            <span className="self-end text-caption text-gray-300">
              {comment.length}/{COMMENT_MAX}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setConsent((prev) => !prev)}
            className="flex items-center gap-2 text-left"
          >
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-chip border",
                consent
                  ? "border-ramen bg-ramen text-white"
                  : "border-gray-200 bg-white",
              )}
            >
              {consent && <Check className="size-3.5" />}
            </span>
            <span className="text-secondary text-gray-500">
              매장 페이지에 소개돼도 좋아요
            </span>
          </button>

          {state === "failed" && (
            <p className="text-secondary text-ramen">
              저장에 실패했어요. 잠시 후 다시 시도해주세요
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={requestClose}
              className="h-13 rounded-card-lg px-5 text-body font-semibold text-gray-500"
            >
              {visitMode ? "취소" : "다음에"}
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              className={cn(
                "h-13 flex-1 rounded-card-lg text-body font-bold text-white",
                canSubmit ? "bg-ramen" : "bg-gray-200",
              )}
            >
              {state === "submitting"
                ? "올리는 중…"
                : visitMode
                  ? "완식 기록"
                  : "남기기"}
            </button>
          </div>
        </div>
        <DiscardDialog
          open={confirming}
          title="기록 작성을 그만할까요?"
          onLeave={() => {
            setConfirming(false);
            onClose();
          }}
          onStay={() => setConfirming(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}
