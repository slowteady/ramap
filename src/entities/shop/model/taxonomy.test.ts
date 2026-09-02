import { describe, it, expect } from "vitest";
import {
  SOUPS,
  FORMS,
  LINEAGES,
  AMENITIES,
  soupBySlug,
} from "@/entities/shop/model/taxonomy";

describe("taxonomy v2.1", () => {
  it("스프 계열은 기타 포함 10종이며 슬러그가 유일하다", () => {
    expect(SOUPS).toHaveLength(10);
    expect(new Set(SOUPS.map((s) => s.slug)).size).toBe(10);
  });

  it("니보시는 커뮤니티 라벨을 쓴다 (어패계 아님)", () => {
    expect(soupBySlug("niboshi")?.label).toBe("니보시");
    expect(SOUPS.some((s) => s.label.includes("어패"))).toBe(false);
  });

  it("형태에 히야시츄카는 없다", () => {
    expect(FORMS.some((f) => f.label.includes("히야시"))).toBe(false);
    expect(FORMS).toHaveLength(4);
  });

  it("계보는 이에케 표기를 쓴다 (이에케이 아님)", () => {
    const iekei = LINEAGES.find((l) => l.slug === "iekei");
    expect(iekei?.label).toBe("이에케");
  });

  it("편의 태그는 15번 시트와 동일한 7종이다", () => {
    expect(AMENITIES).toHaveLength(7);
  });
});
