"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Check, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Drawer, DrawerContent, DrawerTitle } from "@/shared/ui/drawer";
import { COMMENT_MAX } from "../model/record-photo-ops";
import { submitRecordPhoto } from "../model/record-photos";
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
  const [file, setFile] = useState<File | null>(null);
  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(true);
  const [state, setState] = useState<SheetState>("idle");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  if (!open) return null;

  const submit = async () => {
    if (!file || state === "submitting") return;
    setState("submitting");
    const ok = await submitRecordPhoto({ shopId, file, comment, consent });
    if (!ok) {
      setState("failed");
      return;
    }
    if (revisit) recordRevisit(shopId, new Date());
    onSubmitted?.();
    onClose();
  };

  return (
    <Drawer open onOpenChange={(next) => !next && onClose()}>
      <DrawerContent>
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

          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="선택한 사진 미리보기"
                className="h-60 w-full rounded-card object-cover"
              />
              <button
                type="button"
                aria-label="사진 지우기"
                onClick={() => setFile(null)}
                className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-pill bg-ink/60 text-white"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex h-60 w-full shrink-0 flex-col items-center justify-center gap-2 rounded-card border border-dashed border-gray-200 bg-gray-050 text-gray-400"
            >
              <Camera className="size-7" />
              <span className="text-secondary font-semibold">
                사진 선택하기
              </span>
            </button>
          )}
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
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
              onClick={onClose}
              className="h-13 rounded-card-lg px-5 text-body font-semibold text-gray-500"
            >
              다음에
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!file || state === "submitting"}
              className={cn(
                "h-13 flex-1 rounded-card-lg text-body font-bold text-white",
                file && state !== "submitting" ? "bg-ramen" : "bg-gray-200",
              )}
            >
              {state === "submitting" ? "올리는 중…" : "남기기"}
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
