"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { PIN_PICK_MAX_LEVEL } from "@/shared/config/map";
import type { LatLng } from "@/shared/map/types";
import {
  aimPoint,
  canConfirmAt,
  formatPin,
  roundPin,
  type PinPickerControls,
} from "./pin-pick";

type MapRect = { top: number; width: number; height: number };

export function usePinPicker(
  controls: PinPickerControls,
  pin: LatLng | null,
  onConfirm: (pin: LatLng) => void,
) {
  const { containerRef, view, coordsAt } = controls;
  const [rect, setRect] = useState<MapRect | null>(null);
  const controlsRef = useRef(controls);
  controlsRef.current = controls;

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const { top, width, height } = el.getBoundingClientRect();
      setRect({ top, width, height });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [containerRef]);

  /* 진입 1회: 임계보다 축소돼 있으면 강제 확대, 기존 핀이 있으면 그 위치로 */
  const pinAtEntry = useRef(pin);
  useLayoutEffect(() => {
    const { view: entryView, setLevel, panTo } = controlsRef.current;
    if (entryView && !canConfirmAt(entryView.level)) {
      setLevel(PIN_PICK_MAX_LEVEL);
    }
    if (pinAtEntry.current) panTo(pinAtEntry.current);
  }, []);

  const aim = useMemo(
    () => (rect ? aimPoint(rect.width, rect.height) : null),
    [rect],
  );
  const canConfirm = canConfirmAt(view?.level ?? null);
  /* view가 바뀔 때마다 부모가 재렌더하므로 memo 없이 매 렌더 재계산 */
  const coords = aim && view ? coordsAt(aim.x, aim.y) : null;

  const confirm = useCallback(() => {
    if (!canConfirmAt(controlsRef.current.view?.level ?? null) || !aim) return;
    const pos = controlsRef.current.coordsAt(aim.x, aim.y);
    if (pos) onConfirm(roundPin(pos));
  }, [aim, onConfirm]);

  return {
    rect,
    aim,
    coordsLabel: coords ? formatPin(roundPin(coords)) : null,
    canConfirm,
    confirm,
  };
}
