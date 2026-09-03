import { describe, expect, it } from "vitest";
import { PIN_PICK_MAX_LEVEL } from "@/shared/config/map";
import {
  aimPoint,
  canConfirmAt,
  formatPin,
  PIN_BAR_HEIGHT,
  roundPin,
} from "./pin-pick";

describe("aimPoint", () => {
  it("x는 가로 중앙, y는 바를 뺀 가시영역 중심에서 위로 10%", () => {
    const { x, y } = aimPoint(390, 688, 88);
    expect(x).toBe(195);
    expect(y).toBe((688 - 88) * 0.4);
  });

  it("기본 바 높이는 PIN_BAR_HEIGHT", () => {
    expect(aimPoint(390, 688)).toEqual(aimPoint(390, 688, PIN_BAR_HEIGHT));
  });

  it("바보다 낮은 컨테이너에서도 음수가 되지 않는다", () => {
    expect(aimPoint(390, 50, 88).y).toBe(0);
  });
});

describe("canConfirmAt — 소프트 줌 게이트", () => {
  it("임계 레벨 이하에서만 확정 가능", () => {
    expect(canConfirmAt(PIN_PICK_MAX_LEVEL)).toBe(true);
    expect(canConfirmAt(1)).toBe(true);
    expect(canConfirmAt(PIN_PICK_MAX_LEVEL + 1)).toBe(false);
  });

  it("레벨 미상(지도 미준비)이면 불가", () => {
    expect(canConfirmAt(null)).toBe(false);
  });
});

describe("좌표 정밀도", () => {
  it("소수 6자리로 반올림한다", () => {
    expect(roundPin({ lat: 37.55443216, lng: 127.05591849 })).toEqual({
      lat: 37.554432,
      lng: 127.055918,
    });
  });

  it("표시 문자열도 6자리 고정", () => {
    expect(formatPin({ lat: 37.5544, lng: 127.05 })).toBe(
      "37.554400, 127.050000",
    );
  });
});
