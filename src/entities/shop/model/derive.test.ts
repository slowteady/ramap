import { describe, it, expect } from "vitest";
import type { Shop } from "./types";
import {
  groupByOpenedMonth,
  isNewOpen,
  listAreaGenrePages,
  shopById,
  shopsByArea,
  shopsByAreaGenre,
} from "./derive";

const shop = (over: Partial<Shop>): Shop => ({
  id: "kinka",
  name: "킨카",
  branch: null,
  address: null,
  city: "서울",
  district: "성동구",
  areaLabel: "성수",
  lat: 37.54,
  lng: 127.05,
  coordSource: "manual-pin",
  hours: null,
  breakTime: null,
  closedDays: null,
  openedAt: null,
  status: "open",
  statusChangedAt: null,
  forms: ["ramen"],
  primaryForm: "ramen",
  soups: ["niboshi"],
  primarySoup: "niboshi",
  soupDetail: [],
  lineages: [],
  amenities: [],
  confidence: "certain",
  menus: [],
  seats: null,
  tagline: null,
  instagram: null,
  naverPlace: null,
  waitingLink: null,
  verification: "confirmed",
  lastVerifiedAt: null,
  source: null,
  note: null,
  ...over,
});

describe("shopById / shopsByArea", () => {
  const shops = [
    shop({}),
    shop({ id: "b", areaLabel: "성수" }),
    shop({ id: "closed", areaLabel: "성수", status: "closed" }),
    shop({ id: "c", areaLabel: "연남" }),
  ];

  it("id로 찾는다", () => {
    expect(shopById(shops, "b")?.id).toBe("b");
    expect(shopById(shops, "nope")).toBeUndefined();
  });

  it("지역 필터는 폐업을 제외한다", () => {
    expect(shopsByArea(shops, "성수").map((s) => s.id)).toEqual(["kinka", "b"]);
  });
});

describe("shopsByAreaGenre / listAreaGenrePages", () => {
  const shops = [
    shop({ id: "a", soups: ["niboshi"] }),
    shop({ id: "b", soups: ["niboshi", "shio"] }),
    shop({ id: "c", soups: ["niboshi"], lineages: ["iekei"] }),
    shop({ id: "d", areaLabel: "연남", soups: ["niboshi"] }),
  ];

  it("스프와 계보 슬러그 모두로 필터한다", () => {
    expect(shopsByAreaGenre(shops, "성수", "niboshi")).toHaveLength(3);
    expect(shopsByAreaGenre(shops, "성수", "iekei").map((s) => s.id)).toEqual(["c"]);
  });

  it("3곳 이상 조합만 정식 페이지로 생성한다", () => {
    const pages = listAreaGenrePages(shops);
    expect(pages).toContainEqual({ area: "성수", genre: "niboshi" });
    expect(pages).not.toContainEqual({ area: "성수", genre: "shio" });
    expect(pages).not.toContainEqual({ area: "연남", genre: "niboshi" });
  });
});

describe("groupByOpenedMonth / isNewOpen", () => {
  it("openedAt 있는 영업 매장을 최신 월부터 그룹한다", () => {
    const groups = groupByOpenedMonth([
      shop({ id: "a", openedAt: "2026-08-18" }),
      shop({ id: "b", openedAt: "2026-07-29" }),
      shop({ id: "c", openedAt: "2026-08-02" }),
      shop({ id: "no-date" }),
      shop({ id: "closed", openedAt: "2026-08-01", status: "closed" }),
    ]);
    expect(groups.map((g) => g.month)).toEqual(["2026-08", "2026-07"]);
    expect(groups[0].shops.map((s) => s.id)).toEqual(["a", "c"]);
  });

  it("90일 이내 오픈만 NEW", () => {
    const now = new Date("2026-08-26");
    expect(isNewOpen(shop({ openedAt: "2026-08-01" }), now)).toBe(true);
    expect(isNewOpen(shop({ openedAt: "2026-04-01" }), now)).toBe(false);
    expect(isNewOpen(shop({}), now)).toBe(false);
  });
});
