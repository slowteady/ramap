import { describe, expect, it } from "vitest";
import { LINEAGES, SOUPS } from "@/entities/shop";
import { EMPTY_FILTERS } from "./filter";
import { axisChipCount, FILTER_AXES, visibleItems } from "./filter-axes";

describe("visibleItems", () => {
  it("etc와 trait 항목을 숨긴다", () => {
    const soups = visibleItems(SOUPS);
    expect(soups.some((i) => i.slug === "etc-soup")).toBe(false);
    const lineages = visibleItems(LINEAGES);
    expect(lineages.every((i) => i.kind !== "trait")).toBe(true);
    expect(lineages.some((i) => i.slug === "iekei")).toBe(true);
  });
});

describe("axisChipCount", () => {
  const soupAxis = FILTER_AXES.find((a) => a.axis === "soup")!;
  const lineageAxis = FILTER_AXES.find((a) => a.axis === "lineage")!;

  it("일반 축은 선택 개수 그대로", () => {
    expect(
      axisChipCount(soupAxis, {
        ...EMPTY_FILTERS,
        soups: ["tonkotsu", "shoyu"],
      }),
    ).toBe(2);
  });

  it("스타일 축은 특성(trait) 선택을 세지 않는다", () => {
    const trait = LINEAGES.find((l) => l.kind === "trait")!;
    expect(
      axisChipCount(lineageAxis, {
        ...EMPTY_FILTERS,
        lineages: [trait.slug, "iekei"],
      }),
    ).toBe(1);
  });
});
