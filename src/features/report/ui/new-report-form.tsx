"use client";

import { MapPin, Plus, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { AMENITY_OPTIONS, DAYS, GENRE_AXES } from "../model/report-options";
import { MAX_MENUS, MAX_PHOTOS, type LatLng } from "../model/report-payload";
import { useNewReportForm } from "../model/use-report-form";
import {
  BottomCta,
  CheckRow,
  ChipGrid,
  DayToggles,
  DoneView,
  Field,
  PhotoPicker,
  SectionTitle,
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
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 pt-1 pb-8">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-body text-gray-500">
            아직 라맵에 없는 라멘집을 알려주세요.
          </p>
          <span className="shrink-0 text-caption text-gray-400">
            <span className="text-ramen">*</span> 필수
          </span>
        </div>

        <SectionTitle>기본 정보</SectionTitle>
        <Field label="가게 이름" required>
          <TextInput
            value={draft.shopName}
            onChange={(e) => form.set("shopName", e.target.value)}
            placeholder="간판에 적힌 이름"
          />
        </Field>
        <Field label="지점명">
          <TextInput
            value={draft.branch}
            onChange={(e) => form.set("branch", e.target.value)}
            placeholder="예) 성수점"
          />
        </Field>
        <Field label="위치" required>
          <TextInput
            value={draft.location}
            onChange={(e) => form.set("location", e.target.value)}
            placeholder="주소, 지도 링크, 인스타그램 중 아무거나"
          />
        </Field>
        {form.canAttachPin && (
          <button
            type="button"
            onClick={form.togglePin}
            className={cn(
              "-mt-1 flex items-center gap-1.5 self-start rounded-pill border px-3 py-1.5 text-secondary font-semibold transition-colors duration-150",
              draft.pin
                ? "border-ramen bg-ramen-050 text-ramen"
                : "border-gray-100 bg-white text-ink",
            )}
          >
            <MapPin className="size-4" />
            {draft.pin
              ? `지도 위치 첨부됨 · ${draft.pin.lat.toFixed(4)}, ${draft.pin.lng.toFixed(4)}`
              : "지금 보는 지도 위치 첨부"}
            {draft.pin && <X className="size-3.5" />}
          </button>
        )}

        <SectionTitle>라멘 정보</SectionTitle>
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
          <span className="text-secondary font-semibold text-ink">
            대표 메뉴
          </span>
          {draft.menus.map((menu, i) => (
            <div key={i} className="flex items-center gap-2">
              <TextInput
                value={menu.name}
                onChange={(e) => form.setMenu(i, { name: e.target.value })}
                placeholder="메뉴명"
                className="flex-1"
              />
              <TextInput
                value={menu.price}
                onChange={(e) => form.setMenu(i, { price: e.target.value })}
                placeholder="가격"
                inputMode="numeric"
                className="w-24"
              />
              <button
                type="button"
                aria-label="메뉴 삭제"
                onClick={() => form.removeMenu(i)}
                className="flex size-9 shrink-0 items-center justify-center rounded-pill text-gray-300"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
          {draft.menus.length < MAX_MENUS && (
            <button
              type="button"
              onClick={form.addMenu}
              className="flex items-center gap-1 self-start py-1 text-secondary font-semibold text-gray-500"
            >
              <Plus className="size-4" />
              메뉴 추가
            </button>
          )}
        </div>

        <SectionTitle>영업 정보</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <Field label="영업시간">
            <TextInput
              value={draft.hours}
              onChange={(e) => form.set("hours", e.target.value)}
              placeholder="11:30-21:00"
            />
          </Field>
          <Field label="브레이크">
            <TextInput
              value={draft.breakTime}
              onChange={(e) => form.set("breakTime", e.target.value)}
              placeholder="15:00-17:00"
            />
          </Field>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-secondary font-semibold text-ink">휴무</span>
          <DayToggles
            days={DAYS}
            selected={draft.closedDays}
            onToggle={(day) => form.toggle("closedDays", day)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-secondary font-semibold text-ink">편의</span>
          <ChipGrid
            items={AMENITY_OPTIONS}
            selected={draft.amenities}
            onToggle={(slug) => form.toggle("amenities", slug)}
          />
        </div>
        <Field label="좌석">
          <TextInput
            value={draft.seats}
            onChange={(e) => form.set("seats", e.target.value)}
            placeholder="예) 카운터 9, 테이블 2"
          />
        </Field>

        <SectionTitle>사진 · 링크</SectionTitle>
        <div className="flex flex-col gap-1.5">
          <span className="text-secondary font-semibold text-ink">
            사진
            <span className="pl-1.5 font-normal text-gray-400">
              간판이나 전경 한 장이면 확인이 빨라요
            </span>
          </span>
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
        <Field label="인스타그램">
          <TextInput
            value={draft.instagram}
            onChange={(e) => form.set("instagram", e.target.value)}
            placeholder="https://instagram.com/…"
            inputMode="url"
          />
        </Field>
        <Field label="네이버플레이스">
          <TextInput
            value={draft.naverPlace}
            onChange={(e) => form.set("naverPlace", e.target.value)}
            placeholder="https://naver.me/…"
            inputMode="url"
          />
        </Field>
        <Field label="웨이팅 링크" hint="캐치테이블·테이블링">
          <TextInput
            value={draft.waitingLink}
            onChange={(e) => form.set("waitingLink", e.target.value)}
            placeholder="https://…"
            inputMode="url"
          />
        </Field>

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
