import { describe, expect, it } from "vitest";
import {
  matchEnrichment,
  mergeEnrichments,
  toSlug,
  type Enrichment,
} from "./enrich";

describe("toSlug", () => {
  it("로마자 슬러그 생성·중복 시 접미사", () => {
    const taken = new Set<string>();
    expect(toSlug("멘야준", "", taken)).toBe("mennyajun");
    expect(toSlug("멘야준", "", taken)).toBe("mennyajun-2");
  });

  it("지점명을 포함한다", () => {
    const taken = new Set<string>();
    expect(toSlug("역전우동", "서울역점", taken)).toMatch(/^yeokjeonudong-/);
  });
});

describe("matchEnrichment", () => {
  const list: Enrichment[] = [
    { name: "아오리의 행방불명", soups: ["돈코츠"] },
    { name: "멘야준", soups: ["니보시"] },
  ];

  it("정규화 부분 매칭(3자 이상)으로 찾는다", () => {
    expect(matchEnrichment("아오리의행방불명", "노원점", list)).toHaveLength(1);
    expect(matchEnrichment("잇풍당", "", list)).toHaveLength(0);
  });
});

describe("mergeEnrichments", () => {
  it("복수 소스의 장르를 합집합, 단일 값은 선착", () => {
    const merged = mergeEnrichments([
      { name: "a", soups: ["돈코츠"], instagram: "one" },
      { name: "a", soups: ["쇼유"], instagram: "two", closed: true },
    ]);
    expect(merged.soups).toEqual(["돈코츠", "쇼유"]);
    expect(merged.instagram).toBe("one");
    expect(merged.closed).toBe(true);
  });
});
