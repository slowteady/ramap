import { describe, expect, it } from "vitest";
import type { ShopPin } from "@/entities/shop";
import { buildSuggestions, matchRank } from "./search";

const pin = (over: Partial<ShopPin>): ShopPin => ({
  id: "kinka",
  name: "킨카",
  branch: null,
  soupDetail: [],
  lat: 37.5,
  lng: 127.0,
  primarySoup: "niboshi",
  soups: ["niboshi"],
  forms: ["ramen"],
  lineages: [],
  areaLabel: "성수",
  status: "open",
  topMenu: null,
  hours: null,
  breakTime: null,
  closedDays: null,
  amenities: [],
  isNew: false,
  ...over,
});

describe("matchRank", () => {
  it("접두 0 < 부분 1 < 초성 접두 2 < 초성 부분 3, 미매칭 null", () => {
    expect(matchRank("니보시", "니보")).toBe(0);
    expect(matchRank("돈코츠쇼유", "쇼유")).toBe(1);
    expect(matchRank("니보시", "ㄴㅂ")).toBe(2);
    expect(matchRank("돈코츠쇼유", "ㅅㅇ")).toBe(3);
    expect(matchRank("니보시", "돈코")).toBeNull();
  });

  it("공백·빈 검색어 처리", () => {
    expect(matchRank("멘야 코노하", "야코")).toBe(1);
    expect(matchRank("니보시", " ")).toBeNull();
  });
});

describe("buildSuggestions", () => {
  const pins = [
    pin({}),
    pin({
      id: "menya",
      name: "멘야코노하",
      areaLabel: "서울숲",
      soups: ["niboshi", "shio"],
    }),
    pin({
      id: "daiya",
      name: "라멘다이야",
      areaLabel: "건대",
      soups: ["niboshi", "shoyu"],
    }),
  ];

  it("장르 제안이 먼저, 매장 수 포함", () => {
    const out = buildSuggestions(pins, "니보시");
    expect(out[0]).toMatchObject({ kind: "genre", slug: "niboshi", count: 3 });
    expect(out.some((s) => s.kind === "shop")).toBe(false);
  });

  it("매장명·지역 매칭", () => {
    const byName = buildSuggestions(pins, "멘야");
    expect(byName.some((s) => s.kind === "shop" && s.shop.id === "menya")).toBe(
      true,
    );
    const byArea = buildSuggestions(pins, "건대");
    expect(byArea.some((s) => s.kind === "shop" && s.shop.id === "daiya")).toBe(
      true,
    );
  });

  it("초성으로도 매장을 찾는다", () => {
    const out = buildSuggestions(pins, "ㅁㅇㅋ");
    expect(out.some((s) => s.kind === "shop" && s.shop.id === "menya")).toBe(
      true,
    );
  });

  it("빈 검색어는 빈 배열", () => {
    expect(buildSuggestions(pins, "  ")).toEqual([]);
  });

  it("지역 제안이 뜬다", () => {
    const out = buildSuggestions(pins, "성수");
    expect(out.some((s) => s.kind === "area" && s.area === "성수")).toBe(true);
  });

  it("영타 입력을 한글로 변환해 매칭한다", () => {
    const out = buildSuggestions(pins, "zlszk");
    expect(out.some((s) => s.kind === "shop" && s.shop.id === "kinka")).toBe(
      true,
    );
  });

  it("soupDetail·대표 메뉴로도 매장을 찾는다", () => {
    const extended = [
      ...pins,
      pin({
        id: "wassho",
        name: "왓쇼이켄",
        areaLabel: "연남",
        soupDetail: ["니보시파이탄"],
        topMenu: { name: "특제 소바", price: 12000 },
      }),
    ];
    expect(
      buildSuggestions(extended, "파이탄").some(
        (s) => s.kind === "shop" && s.shop.id === "wassho",
      ),
    ).toBe(true);
    expect(
      buildSuggestions(extended, "특제").some(
        (s) => s.kind === "shop" && s.shop.id === "wassho",
      ),
    ).toBe(true);
  });

  it("정확 매칭이 없을 때만 오타 1자를 허용한다", () => {
    const out = buildSuggestions(pins, "밴야코노하");
    expect(out.some((s) => s.kind === "shop" && s.shop.id === "menya")).toBe(
      true,
    );
  });
});
