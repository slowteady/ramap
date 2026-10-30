import { describe, expect, it } from "vitest";
import { goneDescription } from "./gone-description";

describe("goneDescription", () => {
  it("폐업·이전을 날짜와 함께 해요체 문장으로", () => {
    expect(goneDescription("폐업", "2026-03-10")).toBe(
      "2026년 3월에 문을 닫았어요. ",
    );
    expect(goneDescription("이전", "2026-03-10")).toBe(
      "2026년 3월에 이전했어요. ",
    );
  });

  it("날짜가 없으면 날짜 없이", () => {
    expect(goneDescription("폐업", null)).toBe("문을 닫았어요. ");
    expect(goneDescription("이전", null)).toBe("이전했어요. ");
  });
});
