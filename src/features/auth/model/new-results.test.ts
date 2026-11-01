import { describe, expect, it } from "vitest";
import { hasNewResult } from "./new-results";

describe("hasNewResult", () => {
  it("마지막 확인 뒤에 처리된 결과가 있으면 새 결과", () => {
    expect(
      hasNewResult(
        ["2026-10-29T10:00:00Z", "2026-10-31T10:00:00Z"],
        "2026-10-30T10:00:00Z",
      ),
    ).toBe(true);
  });

  it("모두 확인 전에 처리됐으면 새 결과 없음", () => {
    expect(hasNewResult(["2026-10-29T10:00:00Z"], "2026-10-30T10:00:00Z")).toBe(
      false,
    );
  });

  it("확인한 적이 없으면 처리된 결과가 하나라도 있으면 새 결과", () => {
    expect(hasNewResult(["2026-10-29T10:00:00Z"], null)).toBe(true);
  });

  it("처리 시각이 없는 결과와 빈 목록은 세지 않는다", () => {
    expect(hasNewResult([null], null)).toBe(false);
    expect(hasNewResult([], null)).toBe(false);
  });
});
