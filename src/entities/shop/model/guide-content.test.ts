import { describe, expect, it } from "vitest";
import { GUIDES } from "./guide-content";

const texts = GUIDES.flatMap((g) => [
  ...g.intro,
  g.origin,
  g.traits.taste,
  g.traits.body,
  g.boundary,
]);

describe("장르 가이드 본문", () => {
  it("해요체로 쓴다", () => {
    for (const text of texts) expect(text).not.toMatch(/니다[.\s]|니다$/);
  });

  it("일본어·한자 원문은 괄호 안에만 둔다", () => {
    for (const text of texts) {
      const outside = text.replace(/\([^)]*\)/g, "");
      expect(outside).not.toMatch(/[぀-ヿ一-鿿]/);
    }
  });

  it("업계 용어는 처음 나올 때 풀어 쓴다", () => {
    for (const g of GUIDES) {
      const body = [
        ...g.intro,
        g.origin,
        g.traits.taste,
        g.traits.body,
        g.boundary,
      ].join(" ");
      for (const term of ["타레", "백탁", "라유", "콧테리"]) {
        const first = body.indexOf(term);
        if (first === -1) continue;
        expect(body.slice(first, first + term.length + 1)).toBe(`${term}(`);
      }
    }
  });
});
