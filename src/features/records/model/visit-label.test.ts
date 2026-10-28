import { describe, expect, it } from "vitest";
import { visitLabel } from "./visit-label";

describe("visitLabel", () => {
  it("완식 전엔 '완식', 완식 후엔 횟수", () => {
    expect(visitLabel(null)).toBe("완식");
    expect(visitLabel({ visited: false, count: 0 })).toBe("완식");
    expect(visitLabel({ visited: true, count: 3 })).toBe("완식 3회");
  });
});
