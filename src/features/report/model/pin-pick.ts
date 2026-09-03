import type { RefObject } from "react";
import { PIN_PICK_MAX_LEVEL } from "@/shared/config/map";
import type { LatLng, MapView } from "@/shared/map/types";

export const PIN_BAR_HEIGHT = 88;

/* 지도를 다루는 쪽(홈)이 채워 내려주는 조작면 — 피커는 지도 인스턴스를 새로 만들지 않는다 */
export type PinPickerControls = {
  containerRef: RefObject<HTMLDivElement | null>;
  view: MapView | null;
  setLevel: (level: number) => void;
  panTo: (pos: LatLng) => void;
  coordsAt: (x: number, y: number) => LatLng | null;
};

/* 조준점: 바를 뺀 가시영역 중심에서 위로 10% — 엄지·바에 안 가리는 위치 (docs/plans/2026-09-03-backlog) */
export function aimPoint(
  width: number,
  height: number,
  barHeight: number = PIN_BAR_HEIGHT,
): { x: number; y: number } {
  return { x: width / 2, y: Math.max(0, height - barHeight) * 0.4 };
}

export function canConfirmAt(level: number | null): boolean {
  return level !== null && level <= PIN_PICK_MAX_LEVEL;
}

/* 소수 6자리 ≈ 0.1m — 저장·표시 공통 정밀도 */
const round6 = (v: number) => Math.round(v * 1e6) / 1e6;

export function roundPin(pos: LatLng): LatLng {
  return { lat: round6(pos.lat), lng: round6(pos.lng) };
}

export function formatPin(pos: LatLng): string {
  return `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`;
}
