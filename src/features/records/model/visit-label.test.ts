import { describe, expect, it } from "vitest";
import { visitLabel } from "./visit-label";

describe("visitLabel", () => {
  it("완식 전엔 '완식'", () => {
    expect(visitLabel(null)).toEqual({ action: "완식", count: null });
    expect(visitLabel({ visited: false, count: 0 })).toEqual({
      action: "완식",
      count: null,
    });
  });

  it("완식 후엔 다시 누를 행동('한 그릇 더')과 횟수를 따로 — 완료형 문구는 재탭을 막는다(2026-10-28 PO)", () => {
    expect(visitLabel({ visited: true, count: 3 })).toEqual({
      action: "한 그릇 더",
      count: "3회",
    });
  });
});
