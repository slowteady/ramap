"use client";

import { useEffect, type RefObject } from "react";
import { AMENITY_OPTIONS, GENRE_AXES } from "../model/report-options";
import {
  EDIT_ITEMS,
  isDirtyEdit,
  MAX_PHOTOS,
  type ReportTarget,
} from "../model/report-payload";
import { useEditReportForm } from "../model/use-report-form";
import {
  BottomCta,
  CheckRow,
  ChipGrid,
  DoneView,
  Field,
  PhotoPicker,
  SegmentedPills,
  TextArea,
  TextInput,
} from "./form-controls";

const CLOSED_OPTIONS = [
  { value: "closed", label: "폐업" },
  { value: "paused", label: "휴업" },
] as const;

export function EditReportForm({
  target,
  onClose,
  dirtyRef,
}: {
  target: ReportTarget;
  onClose: () => void;
  dirtyRef?: RefObject<boolean>;
}) {
  const form = useEditReportForm(target);

  useEffect(() => {
    if (dirtyRef) dirtyRef.current = isDirtyEdit(form.draft);
  }, [dirtyRef, form.draft]);

  if (form.phase === "done")
    return (
      <DoneView
        title="수정 요청이 접수됐어요"
        description="라맵이 확인한 뒤 반영해 드려요. 폐업·휴업은 한 번 더 확인해요."
        onClose={onClose}
      />
    );

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-4 pt-1 pb-8">
        <div className="flex flex-col gap-1">
          <span className="text-secondary font-semibold text-ink">
            수정 항목
          </span>
          <span className="text-caption text-gray-400">
            해당하는 것을 모두 선택해 주세요
          </span>
          <div className="grid grid-cols-2 gap-x-3">
            {EDIT_ITEMS.map((item) => (
              <CheckRow
                key={item.key}
                label={item.label}
                checked={form.has(item.key)}
                onToggle={() => form.toggleItem(item.key)}
              />
            ))}
          </div>
        </div>

        {form.has("closed") && (
          <div className="flex flex-col gap-2.5 rounded-card bg-gray-050 p-3">
            <SegmentedPills
              options={CLOSED_OPTIONS}
              value={form.draft.closedStatus}
              onChange={(v) => form.set("closedStatus", v)}
            />
            <TextInput
              value={form.draft.closedEvidence}
              onChange={(e) => form.set("closedEvidence", e.target.value)}
              placeholder="근거 링크 — 인스타 공지, 리뷰 등"
              className="bg-white"
            />
            <p className="text-caption text-gray-400">
              폐업·휴업은 한 번 더 확인하고 반영해요.
            </p>
          </div>
        )}

        {form.has("hours") && (
          <Field label="달라진 영업시간">
            <TextInput
              value={form.draft.hours}
              onChange={(e) => form.set("hours", e.target.value)}
              placeholder="예) 11:30-21:00, 월 휴무"
            />
          </Field>
        )}

        {form.has("menu") && (
          <Field label="달라진 메뉴·가격">
            <TextInput
              value={form.draft.menu}
              onChange={(e) => form.set("menu", e.target.value)}
              placeholder="예) 니보시 시오 13,000원으로 인상"
            />
          </Field>
        )}

        {form.has("genre") &&
          GENRE_AXES.map((axis) => (
            <div key={axis.key} className="flex flex-col gap-1.5">
              <span className="text-secondary font-semibold text-ink">
                {axis.title}
              </span>
              <ChipGrid
                items={axis.items}
                selected={form.draft[axis.key]}
                onToggle={(slug) => form.toggle(axis.key, slug)}
              />
            </div>
          ))}

        {form.has("amenities") && (
          <div className="flex flex-col gap-1.5">
            <span className="text-secondary font-semibold text-ink">
              편의 정보
            </span>
            <ChipGrid
              items={AMENITY_OPTIONS}
              selected={form.draft.amenities}
              onToggle={(slug) => form.toggle("amenities", slug)}
            />
          </div>
        )}

        {form.has("location") && (
          <Field label="달라진 위치">
            <TextInput
              value={form.draft.location}
              onChange={(e) => form.set("location", e.target.value)}
              placeholder="새 주소 또는 지도 링크"
            />
          </Field>
        )}

        <Field label="상세 내용" required={form.has("etc")}>
          <TextArea
            value={form.draft.message}
            onChange={(e) => form.set("message", e.target.value)}
            placeholder="알고 계신 내용을 자유롭게 적어주세요"
            maxLength={500}
          />
        </Field>

        <div className="flex flex-col gap-1.5">
          <span className="text-secondary font-semibold text-ink">
            사진<span className="pl-1 font-normal text-gray-400">(선택)</span>
          </span>
          <PhotoPicker
            files={form.draft.photos}
            max={MAX_PHOTOS}
            onAdd={form.addPhotos}
            onRemove={form.removePhoto}
          />
        </div>
      </div>
      <BottomCta
        label="보내기"
        disabled={!form.canSubmit}
        submitting={form.phase === "submitting"}
        onSubmit={form.submit}
      />
    </>
  );
}
