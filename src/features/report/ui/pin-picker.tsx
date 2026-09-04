"use client";

import type { LatLng } from "@/shared/map/types";
import { PIN_BAR_HEIGHT, type PinPickerControls } from "../model/pin-pick";
import { usePinPicker } from "../model/use-pin-picker";

/* 중앙 십자선 고정 + 지도 이동 조준 — 하단 확정 바, 좌상단 취소 (docs/plans/2026-09-03-backlog) */
export function PinPicker({
  shopName,
  pin,
  controls,
  onConfirm,
  onCancel,
}: {
  shopName: string;
  pin: LatLng | null;
  controls: PinPickerControls;
  onConfirm: (pin: LatLng) => void;
  onCancel: () => void;
}) {
  const picker = usePinPicker(controls, pin, onConfirm);
  if (!picker.rect || !picker.aim) return null;

  return (
    <div className="absolute inset-0">
      {/* 지도 밖 상단(홈 헤더·필터)은 픽 모드 동안 비활성 */}
      <div
        className="pointer-events-auto absolute inset-x-0 top-0 bg-white/70"
        style={{ height: picker.rect.top }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{ top: picker.rect.top }}
      >
        <button
          type="button"
          onClick={onCancel}
          className="pointer-events-auto absolute top-3 left-3 rounded-pill bg-white px-3.5 py-2 text-secondary font-semibold text-ink shadow-[0_1px_5px_rgba(26,27,31,0.2)]"
        >
          취소
        </button>

        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: picker.aim.x, top: picker.aim.y }}
        >
          {shopName && (
            <span className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-pill bg-white px-2 py-1 text-secondary font-extrabold whitespace-nowrap text-ink shadow-[0_1px_4px_rgba(26,27,31,0.22)]">
              {shopName}
            </span>
          )}
          <span className="absolute top-1/2 left-1/2 h-px w-10 -translate-x-1/2 -translate-y-1/2 bg-ramen/60" />
          <span className="absolute top-1/2 left-1/2 h-10 w-px -translate-x-1/2 -translate-y-1/2 bg-ramen/60" />
          <span className="flex size-6 items-center justify-center rounded-pill border-2 border-ramen bg-white/30">
            <span className="size-1.5 rounded-pill bg-ramen" />
          </span>
        </div>

        <div
          className="pointer-events-auto absolute inset-x-0 bottom-0 flex flex-col justify-center gap-1 border-t border-gray-100 bg-white px-4"
          style={{ height: PIN_BAR_HEIGHT }}
        >
          <span className="text-caption text-gray-400">
            {picker.canConfirm ? picker.coordsLabel : "조금 더 확대해 주세요"}
          </span>
          <button
            type="button"
            disabled={!picker.canConfirm}
            onClick={picker.confirm}
            className="flex h-12 w-full items-center justify-center rounded-card bg-ramen text-body font-bold text-white disabled:opacity-40"
          >
            이 위치로 지정
          </button>
        </div>
      </div>
    </div>
  );
}
