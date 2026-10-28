import { describe, expect, it } from "vitest";
import { visitOrdinalLabel } from "./visit-ordinal";

describe("visitOrdinalLabel", () => {
  it("첫 번째는 '첫', 이후는 'N번째'", () => {
    expect(visitOrdinalLabel(1)).toBe("첫");
    expect(visitOrdinalLabel(4)).toBe("4번째");
  });
});
