"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { DiscardDialog } from "@/shared/ui/discard-dialog";
import { Drawer, DrawerContent, DrawerTitle } from "@/shared/ui/drawer";
import { PhotoPicker } from "@/shared/ui/photo-picker";
import { COMMENT_MAX, RECORD_PHOTO_MAX } from "../model/record-photo-ops";
import { submitRecordPhotos } from "../model/record-photos";
import { useRecords } from "../model/use-records";

type SheetState = "idle" | "submitting" | "failed";

export function RecordLogSheet({
  shopId,
  open,
  revisit,
  onClose,
  onSubmitted,
}: {
  shopId: string;
  open: boolean;
  revisit: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}) {
  const { recordRevisit } = useRecords();
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

  const submit = async () => {
    if (files.length === 0 || state === "submitting") return;
    setState("submitting");
    const ok = await submitRecordPhotos({ shopId, files, comment, consent });
    if (!ok) {
      setState("failed");
      return;
    }
    if (revisit) recordRevisit(shopId, new Date());
    onSubmitted?.();
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
              {revisit
                ? "다시 온 한 그릇도 기록이 돼요"
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
              placeholder="한줄평 (선택)"
              className="h-12 rounded-card border border-gray-100 bg-white px-3.5 text-body text-ink placeholder:text-gray-300 focus:border-gray-300 focus:outline-none"
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

          <p className="text-caption text-gray-400">
            라멘이 주인공 · 직접 찍은 사진 · 다른 사람 얼굴이 안 나오게
          </p>

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
              다음에
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={files.length === 0 || state === "submitting"}
              className={cn(
                "h-13 flex-1 rounded-card-lg text-body font-bold text-white",
                files.length > 0 && state !== "submitting"
                  ? "bg-ramen"
                  : "bg-gray-200",
              )}
            >
              {state === "submitting" ? "올리는 중…" : "남기기"}
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
