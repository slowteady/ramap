import { describe, it, expect } from "vitest";
import type { ShopPin } from "@/entities/shop";
import {
  applyFilters,
  countBySoup,
  EMPTY_FILTERS,
  parseFilters,
  serializeFilters,
} from "./filter";

const pin = (id: string, over: Partial<ShopPin> = {}): ShopPin => ({
  id,
  name: id,
  lat: 37.5,
  lng: 127,
  primarySoup: "niboshi",
  soups: ["niboshi"],
  forms: ["ramen"],
  lineages: [],
  areaLabel: "성수",
  status: "open",
  topMenu: null,
  hours: null,
  amenities: [],
  isNew: false,
  ...over,
});

describe("parse/serialize", () => {
  it("왕복 보존하며 미지 슬러그는 무시한다", () => {
    const params = new URLSearchParams("soup=niboshi,shio,fake&form=tsukemen&lineage=iekei");
    const f = parseFilters(params);
    expect(f.soups).toEqual(["niboshi", "shio"]);
    expect(f.forms).toEqual(["tsukemen"]);
    expect(f.lineages).toEqual(["iekei"]);
    expect(parseFilters(new URLSearchParams(serializeFilters(f)))).toEqual(f);
  });

  it("빈 필터는 빈 문자열로 직렬화된다", () => {
    expect(serializeFilters(EMPTY_FILTERS)).toBe("");
  });
});

describe("newOnly", () => {
  it("new=1을 파싱·직렬화한다", () => {
    const f = parseFilters(new URLSearchParams("new=1"));
    expect(f.newOnly).toBe(true);
    expect(serializeFilters(f)).toBe("new=1");
  });

  it("newOnly면 isNew 핀만 통과한다", () => {
    const pins = [pin("a", { isNew: true }), pin("b")];
    const result = applyFilters(pins, { ...EMPTY_FILTERS, newOnly: true });
    expect(result.map((p) => p.id)).toEqual(["a"]);
  });
});

describe("applyFilters", () => {
  const pins = [
    pin("a", { soups: ["niboshi"], forms: ["ramen"] }),
    pin("b", { soups: ["tonkotsu"], forms: ["ramen", "tsukemen"], lineages: ["iekei"] }),
    pin("c", { soups: ["niboshi", "shio"], forms: ["tsukemen"] }),
  ];

  it("축 내 OR, 축 간 AND", () => {
    const f = { ...EMPTY_FILTERS, soups: ["niboshi" as const], forms: ["tsukemen" as const] };
    expect(applyFilters(pins, f).map((p) => p.id)).toEqual(["c"]);
  });

  it("빈 필터는 전체 통과", () => {
    expect(applyFilters(pins, EMPTY_FILTERS)).toHaveLength(3);
  });
});

describe("countBySoup", () => {
  it("스프 축 자신을 제외한 필터 기준으로 센다", () => {
    const pins = [
      pin("a", { soups: ["niboshi"], forms: ["ramen"] }),
      pin("b", { soups: ["niboshi"], forms: ["tsukemen"] }),
      pin("c", { soups: ["tonkotsu"], forms: ["tsukemen"] }),
    ];
    const counts = countBySoup(pins, {
      ...EMPTY_FILTERS,
      soups: ["tonkotsu"],
      forms: ["tsukemen"],
    });
    expect(counts.niboshi).toBe(1);
    expect(counts.tonkotsu).toBe(1);
  });
});
