import { describe, expect, it } from "vitest";
import { faqAnswer } from "./area-copy";

describe("faqAnswer", () => {
  it("설명 끝 받침에 맞춰 해요체로 끝낸다", () => {
    expect(faqAnswer("돼지뼈를 오래 끓여 뽀얗고 진한 국물")).toBe(
      "돼지뼈를 오래 끓여 뽀얗고 진한 국물이에요",
    );
    expect(faqAnswer("요코하마식 라멘")).toBe("요코하마식 라멘이에요");
    expect(faqAnswer("양 많은 라멘 스타일")).toBe("양 많은 라멘 스타일이에요");
    expect(faqAnswer("라멘집에서 직접 뽑는 면 요리")).toBe(
      "라멘집에서 직접 뽑는 면 요리예요",
    );
  });
});
