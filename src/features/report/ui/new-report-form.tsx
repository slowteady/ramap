"use client";

import { MapPin, Plus, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { MAX_LINKS, MAX_PHOTOS, type LatLng } from "../model/report-payload";
import { useNewReportForm } from "../model/use-report-form";
import {
  BottomCta,
  DoneView,
  Field,
  PhotoPicker,
  TextArea,
  TextInput,
} from "./form-controls";

export function NewReportForm({
  mapCenter,
  onClose,
}: {
  mapCenter: LatLng | null;
  onClose: () => void;
}) {
  const form = useNewReportForm(mapCenter);
  const { draft } = form;

  if (form.phase === "done")
    return (
      <DoneView
        title="등록 요청을 받았어요"
        description="확인 후 지도에 올려드려요. 보통 며칠 안에 반영돼요."
        onClose={onClose}
      />
    );

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-4 pt-1 pb-8">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-body text-gray-500">
            아직 라맵에 없는 라멘집을 알려주세요.
          </p>
          <span className="shrink-0 text-caption text-gray-400">
            <span className="text-ramen">*</span> 필수
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Field label="가게 이름" required>
              <TextInput
                value={draft.shopName}
                onChange={(e) => form.set("shopName", e.target.value)}
              />
            </Field>
          </div>
          <Field label="지점명" optional>
            <TextInput
              value={draft.branch}
              onChange={(e) => form.set("branch", e.target.value)}
            />
          </Field>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-secondary font-semibold text-ink">
            링크<span className="text-ramen"> *</span>
          </span>
          {draft.links.map((link, i) => {
            const error = form.linkError(i);
            return (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <TextInput
                    value={link}
                    onChange={(e) => form.setLink(i, e.target.value)}
                    onBlur={() => form.touchLink(i)}
                    inputMode="url"
                    aria-invalid={Boolean(error)}
                    className="flex-1"
                  />
                  {i > 0 && (
                    <button
                      type="button"
                      aria-label="링크 삭제"
                      onClick={() => form.removeLink(i)}
                      className="flex size-9 shrink-0 items-center justify-center rounded-pill text-gray-300"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
                {error && (
                  <span className="text-caption text-ramen">{error}</span>
                )}
              </div>
            );
          })}
          <span className="text-caption text-gray-400">
            인스타그램, 카카오맵, 네이버 지도 중 하나면 충분해요
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {draft.links.length < MAX_LINKS && (
              <button
                type="button"
                onClick={form.addLink}
                className="flex items-center gap-1 py-1 text-secondary font-semibold text-gray-500"
              >
                <Plus className="size-4" />
                링크 추가
              </button>
            )}
            {form.canAttachPin && (
              <button
                type="button"
                onClick={form.togglePin}
                className={cn(
                  "flex items-center gap-1 py-1 text-secondary font-semibold",
                  draft.pin ? "text-ramen" : "text-gray-500",
                )}
              >
                <MapPin className="size-4" />
                {draft.pin ? "지도 위치 첨부됨" : "지금 보는 지도 위치 첨부"}
                {draft.pin && <X className="size-3.5" />}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-secondary font-semibold text-ink">
            사진<span className="pl-1 font-normal text-gray-400">(선택)</span>
          </span>
          <PhotoPicker
            files={draft.photos}
            max={MAX_PHOTOS}
            onAdd={form.addPhotos}
            onRemove={form.removePhoto}
          />
        </div>

        <TextArea
          value={draft.message}
          onChange={(e) => form.set("message", e.target.value)}
          placeholder="더 알려주실 내용이 있다면 자유롭게 적어주세요"
          maxLength={500}
        />
      </div>
      <BottomCta
        label="등록하기"
        disabled={!form.canSubmit}
        submitting={form.phase === "submitting"}
        onSubmit={form.submit}
      />
    </>
  );
}
