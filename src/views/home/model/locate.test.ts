import { describe, expect, it } from "vitest";
import { locateFailureMessage } from "./locate";

describe("locateFailureMessage", () => {
  it("위치 권한을 거부하면 허용하라고 안내한다", () => {
    expect(locateFailureMessage(1)).toBe(
      "위치 접근을 허용하면 내 주변 라멘집을 볼 수 있어요",
    );
  });

  it("위치를 못 찾거나 시간이 지나면 다시 누르라고 안내한다", () => {
    const retry = "내 위치를 찾지 못했어요. 잠시 뒤에 다시 눌러 주세요";
    expect(locateFailureMessage(2)).toBe(retry);
    expect(locateFailureMessage(3)).toBe(retry);
  });

  it("브라우저가 위치 찾기를 지원하지 않으면 권한 탓을 하지 않는다", () => {
    expect(locateFailureMessage(null)).toBe(
      "이 브라우저에서는 내 위치를 찾을 수 없어요",
    );
  });
});
