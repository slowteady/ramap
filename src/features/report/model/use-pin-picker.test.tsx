import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PIN_PICK_MAX_LEVEL } from "@/shared/config/map";
import type { PinPickerControls } from "./pin-pick";
import { usePinPicker } from "./use-pin-picker";

function makeControls(level: number): PinPickerControls {
  const el = document.createElement("div");
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    top: 100,
    left: 0,
    width: 390,
    height: 600,
  } as DOMRect);
  return {
    containerRef: { current: el },
    view: {
      level,
      bounds: { sw: { lat: 37, lng: 127 }, ne: { lat: 38, lng: 128 } },
    },
    setLevel: vi.fn(),
    panTo: vi.fn(),
    coordsAt: vi.fn(() => ({ lat: 37.11111149, lng: 127.22222249 })),
  };
}

describe("usePinPicker", () => {
  it("임계보다 축소된 채 진입하면 강제로 확대한다", () => {
    const controls = makeControls(PIN_PICK_MAX_LEVEL + 3);
    renderHook(() => usePinPicker(controls, null, vi.fn()));
    expect(controls.setLevel).toHaveBeenCalledWith(PIN_PICK_MAX_LEVEL);
  });

  it("임계 이하로 진입하면 레벨을 건드리지 않는다", () => {
    const controls = makeControls(PIN_PICK_MAX_LEVEL);
    renderHook(() => usePinPicker(controls, null, vi.fn()));
    expect(controls.setLevel).not.toHaveBeenCalled();
  });

  it("기존 핀이 있으면 그 위치로 이동한다", () => {
    const controls = makeControls(PIN_PICK_MAX_LEVEL);
    const pin = { lat: 37.5, lng: 127.05 };
    renderHook(() => usePinPicker(controls, pin, vi.fn()));
    expect(controls.panTo).toHaveBeenCalledWith(pin);
  });

  it("컨테이너 실측으로 조준점을 잡고 확정 시 반올림 좌표를 올린다", () => {
    const controls = makeControls(PIN_PICK_MAX_LEVEL);
    const onConfirm = vi.fn();
    const { result } = renderHook(() =>
      usePinPicker(controls, null, onConfirm),
    );
    expect(result.current.rect).toEqual({ top: 100, width: 390, height: 600 });
    expect(result.current.canConfirm).toBe(true);
    result.current.confirm();
    expect(onConfirm).toHaveBeenCalledWith({
      lat: 37.111111,
      lng: 127.222222,
    });
  });

  it("게이트 미통과 상태에선 확정이 무시된다", () => {
    const controls = makeControls(PIN_PICK_MAX_LEVEL + 1);
    (controls.setLevel as ReturnType<typeof vi.fn>).mockClear();
    const onConfirm = vi.fn();
    const { result } = renderHook(() =>
      usePinPicker(controls, null, onConfirm),
    );
    expect(result.current.canConfirm).toBe(false);
    result.current.confirm();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
