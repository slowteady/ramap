"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { AMENITY_OPTIONS, GENRE_AXES } from "../model/report-options";
import { useNewReportForm } from "../model/use-report-form";
import {
  ChipGrid,
  DoneView,
  Field,
  SubmitBar,
  TextArea,
  TextInput,
} from "./form-controls";

export function NewReportForm({ onClose }: { onClose: () => void }) {
  const form = useNewReportForm();
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (form.phase === "done") return <DoneView onClose={onClose} />;

  return (
    <div className="flex flex-col gap-5 px-4 pt-2 pb-10">
      <p className="text-secondary text-gray-500">
        이름과 위치만 주시면 나머지는 저희가 확인해서 올립니다. 로그인 없이
        제출됩니다.
      </p>

      <Field label="가게 이름">
        <TextInput
          value={form.draft.shopName}
          onChange={(e) => form.set("shopName", e.target.value)}
          placeholder="예) 라멘야 무구"
        />
      </Field>
      <Field label="위치 또는 링크">
        <TextInput
          value={form.draft.location}
          onChange={(e) => form.set("location", e.target.value)}
          placeholder='인스타그램 주소, 지도 링크, 또는 "성수역 근처"'
        />
      </Field>

      <button
        type="button"
        aria-expanded={detailsOpen}
        onClick={() => setDetailsOpen((v) => !v)}
        className="flex items-center justify-between rounded-card bg-gray-050 px-3 py-3 text-left"
      >
        <span className="flex flex-col gap-0.5">
          <span className="text-body font-semibold text-ink">
            아는 만큼만 알려주세요
          </span>
          <span className="text-caption text-gray-400">
            장르·편의·영업시간 — 전부 선택이에요
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-5 text-gray-400 transition-transform duration-150",
            detailsOpen && "rotate-180",
          )}
        />
      </button>

      {detailsOpen && (
        <div className="flex flex-col gap-5 duration-150 animate-in fade-in">
          {GENRE_AXES.map((axis) => (
            <div key={axis.key} className="flex flex-col gap-2">
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
          <div className="flex flex-col gap-2">
            <span className="text-secondary font-semibold text-ink">편의</span>
            <ChipGrid
              items={AMENITY_OPTIONS}
              selected={form.draft.amenities}
              onToggle={(slug) => form.toggle("amenities", slug)}
            />
          </div>
          <Field label="영업시간" optional>
            <TextInput
              value={form.draft.hours}
              onChange={(e) => form.set("hours", e.target.value)}
              placeholder="예) 11:30-21:00, 월 휴무"
            />
          </Field>
          <Field label="대표 메뉴" optional>
            <div className="flex gap-2">
              <TextInput
                value={form.draft.menuName}
                onChange={(e) => form.set("menuName", e.target.value)}
                placeholder="메뉴명"
                className="flex-1"
              />
              <TextInput
                value={form.draft.menuPrice}
                onChange={(e) => form.set("menuPrice", e.target.value)}
                placeholder="가격"
                inputMode="numeric"
                className="w-28"
              />
            </div>
          </Field>
        </div>
      )}

      <Field label="하고 싶은 말" optional>
        <TextArea
          value={form.draft.message}
          onChange={(e) => form.set("message", e.target.value)}
          placeholder="예) 지로계인데 라맵에 없어요"
          maxLength={500}
        />
      </Field>

      <SubmitBar
        disabled={!form.canSubmit}
        submitting={form.phase === "submitting"}
        onSubmit={form.submit}
        notice="모든 제보는 검수 후 게재됩니다."
      />
    </div>
  );
}
