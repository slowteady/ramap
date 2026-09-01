import { describe, expect, it } from "vitest";
import type { ShopPin } from "@/entities/shop";
import { buildSuggestions, matchRank, toChoseong } from "./search";

const pin = (over: Partial<ShopPin>): ShopPin => ({
  id: "kinka",
  name: "킨카",
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

describe("toChoseong", () => {
  it("한글은 초성으로, 그 외는 그대로", () => {
    expect(toChoseong("니보시")).toBe("ㄴㅂㅅ");
    expect(toChoseong("라멘abc")).toBe("ㄹㅁabc");
  });
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
    pin({ id: "menya", name: "멘야코노하", areaLabel: "서울숲", soups: ["niboshi", "shio"] }),
    pin({ id: "daiya", name: "라멘다이야", areaLabel: "건대", soups: ["niboshi", "shoyu"] }),
  ];

  it("장르 제안이 먼저, 매장 수 포함", () => {
    const out = buildSuggestions(pins, "니보시");
    expect(out[0]).toMatchObject({ kind: "genre", slug: "niboshi", count: 3 });
    expect(out.some((s) => s.kind === "shop")).toBe(false);
  });

  it("매장명·지역 매칭", () => {
    const byName = buildSuggestions(pins, "멘야");
    expect(byName.some((s) => s.kind === "shop" && s.shop.id === "menya")).toBe(true);
    const byArea = buildSuggestions(pins, "건대");
    expect(byArea.some((s) => s.kind === "shop" && s.shop.id === "daiya")).toBe(true);
  });

  it("초성으로도 매장을 찾는다", () => {
    const out = buildSuggestions(pins, "ㅁㅇㅋ");
    expect(out.some((s) => s.kind === "shop" && s.shop.id === "menya")).toBe(true);
  });

  it("빈 검색어는 빈 배열", () => {
    expect(buildSuggestions(pins, "  ")).toEqual([]);
  });
});
