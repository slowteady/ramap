import { describe, expect, it } from "vitest";
import { confidenceLabelOf } from "./grade";

describe("confidenceLabelOf", () => {
  it("조사 매칭 + 장르 확인 + 형태 확인이면 확정", () => {
    expect(
      confidenceLabelOf(2, {
        name: "가게",
        soups: ["돈코츠"],
        primarySoup: "돈코츠",
        forms: ["라멘"],
      }),
    ).toBe("확정");
  });

  it("조사 매칭이 없으면 추정", () => {
    expect(
      confidenceLabelOf(0, {
        name: "가게",
        soups: ["돈코츠"],
        primarySoup: "돈코츠",
        forms: ["라멘"],
      }),
    ).toBe("추정");
  });

  it("국물이 비면 추정 — 업종 분류로만 걸러진 매장", () => {
    expect(confidenceLabelOf(1, { name: "가게", forms: ["라멘"] })).toBe(
      "추정",
    );
  });

  it("형태가 비면 추정", () => {
    expect(
      confidenceLabelOf(1, {
        name: "가게",
        soups: ["돈코츠"],
        primarySoup: "돈코츠",
      }),
    ).toBe("추정");
  });

  it("판정 마크가 붙은 매장은 확정으로 올리지 않는다", () => {
    expect(
      confidenceLabelOf(1, {
        name: "가게",
        soups: ["돈코츠"],
        primarySoup: "돈코츠",
        forms: ["라멘"],
        soupDetail: ["실존 미확인"],
      }),
    ).toBe("추정");
  });
});
