"use client";

import { MapPin, Plus, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { GENRE_AXES } from "../model/report-options";
import { MAX_LINKS, MAX_PHOTOS, type LatLng } from "../model/report-payload";
import { useNewReportForm } from "../model/use-report-form";
import {
  BottomCta,
  CheckRow,
  ChipGrid,
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

        <Field label="가게 이름" required>
          <TextInput
            value={draft.shopName}
            onChange={(e) => form.set("shopName", e.target.value)}
            placeholder="예) 멘야코노하"
          />
        </Field>

        <div className="flex flex-col gap-1.5">
          <span className="text-secondary font-semibold text-ink">
            링크<span className="text-ramen"> *</span>
          </span>
          {draft.links.map((link, i) => (
            <div key={i} className="flex items-center gap-2">
              <TextInput
                value={link}
                onChange={(e) => form.setLink(i, e.target.value)}
                placeholder="인스타그램 · 카카오맵 · 네이버 지도"
                inputMode="url"
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
          ))}
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

        {GENRE_AXES.map((axis) => (
          <div key={axis.key} className="flex flex-col gap-1.5">
            <span className="text-secondary font-semibold text-ink">
              {axis.title}
            </span>
            <ChipGrid
              items={axis.items}
              selected={draft[axis.key]}
              onToggle={(slug) => form.toggle(axis.key, slug)}
            />
          </div>
        ))}

        <div className="flex flex-col gap-1.5">
          <span className="text-secondary font-semibold text-ink">사진</span>
          <PhotoPicker
            files={draft.photos}
            max={MAX_PHOTOS}
            onAdd={form.addPhotos}
            onRemove={form.removePhoto}
          />
          {draft.photos.length > 0 && (
            <CheckRow
              label="직접 촬영한 사진이며 라맵 게재에 동의해요"
              checked={draft.photoConsent}
              onToggle={() => form.set("photoConsent", !draft.photoConsent)}
            />
          )}
        </div>

        <Field label="한마디">
          <TextArea
            value={draft.message}
            onChange={(e) => form.set("message", e.target.value)}
            placeholder="예) 지로계인데 라맵에 없어요"
            maxLength={500}
          />
        </Field>
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
