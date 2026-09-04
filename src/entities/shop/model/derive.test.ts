import { describe, it, expect } from "vitest";
import type { Shop } from "./types";
import {
  isNewOpen,
  listAreaGenrePages,
  nearbyShops,
  shopById,
  shopsByArea,
  shopsByAreaGenre,
  shopsByGenre,
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
  photos: [],
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
    expect(shopsByAreaGenre(shops, "성수", "iekei").map((s) => s.id)).toEqual([
      "c",
    ]);
  });

  it("3곳 이상 조합만 정식 페이지로 생성한다", () => {
    const pages = listAreaGenrePages(shops);
    expect(pages).toContainEqual({ area: "성수", genre: "niboshi" });
    expect(pages).not.toContainEqual({ area: "성수", genre: "shio" });
    expect(pages).not.toContainEqual({ area: "연남", genre: "niboshi" });
  });
});

describe("isNewOpen", () => {
  it("90일 이내 오픈만 NEW", () => {
    const now = new Date("2026-08-26");
    expect(isNewOpen(shop({ openedAt: "2026-08-01" }), now)).toBe(true);
    expect(isNewOpen(shop({ openedAt: "2026-04-01" }), now)).toBe(false);
    expect(isNewOpen(shop({}), now)).toBe(false);
  });
});

describe("nearbyShops", () => {
  const me = shop({ id: "me", lat: 37.54, lng: 127.05 });
  const near = shop({ id: "near", lat: 37.541, lng: 127.051 });
  const far = shop({ id: "far", lat: 37.6, lng: 127.1 });
  const mid = shop({ id: "mid", lat: 37.545, lng: 127.06 });
  const closed = shop({
    id: "closed",
    lat: 37.5401,
    lng: 127.0501,
    status: "closed",
  });
  const noCoord = shop({ id: "nocoord", lat: null, lng: null });

  it("자기 자신·폐업·좌표 없음을 빼고 가까운 순으로 n곳", () => {
    const result = nearbyShops([far, closed, me, noCoord, mid, near], me, 2);
    expect(result.map((s) => s.id)).toEqual(["near", "mid"]);
  });

  it("기준 매장에 좌표가 없으면 빈 배열", () => {
    expect(nearbyShops([near, far], noCoord, 3)).toEqual([]);
  });
});

describe("shopsByGenre", () => {
  it("대표 국물 일치 > 운영자 확인 > 한줄소개 > 최근 확인일, 폐업 제외", () => {
    const sub = shop({
      id: "sub",
      soups: ["tonkotsu", "niboshi"],
      primarySoup: "tonkotsu",
      verification: "confirmed",
      tagline: "x",
      lastVerifiedAt: "2026-08-30",
    });
    const pending = shop({
      id: "pending",
      soups: ["niboshi"],
      primarySoup: "niboshi",
      verification: "pending",
      tagline: "x",
      lastVerifiedAt: "2026-08-30",
    });
    const noTag = shop({
      id: "notag",
      soups: ["niboshi"],
      primarySoup: "niboshi",
      verification: "confirmed",
      tagline: null,
      lastVerifiedAt: "2026-08-30",
    });
    const older = shop({
      id: "older",
      soups: ["niboshi"],
      primarySoup: "niboshi",
      verification: "confirmed",
      tagline: "x",
      lastVerifiedAt: "2026-08-01",
    });
    const newer = shop({
      id: "newer",
      soups: ["niboshi"],
      primarySoup: "niboshi",
      verification: "confirmed",
      tagline: "x",
      lastVerifiedAt: "2026-08-25",
    });
    const closed = shop({
      id: "closed",
      soups: ["niboshi"],
      primarySoup: "niboshi",
      status: "closed",
    });
    expect(
      shopsByGenre([sub, pending, noTag, older, newer, closed], "niboshi").map(
        (s) => s.id,
      ),
    ).toEqual(["newer", "older", "notag", "pending", "sub"]);
  });

  it("계보는 lineages 포함이 대표 일치", () => {
    const iekei = shop({
      id: "iekei",
      lineages: ["iekei"],
      soups: ["tonkotsu-shoyu"],
      primarySoup: "tonkotsu-shoyu",
    });
    expect(shopsByGenre([iekei], "iekei").map((s) => s.id)).toEqual(["iekei"]);
  });
});

describe("shopsByGenre 태깅확신도 정렬", () => {
  const base = {
    verification: "pending" as const,
    tagline: null,
    soups: ["tonkotsu"],
    primarySoup: "tonkotsu",
  } as Partial<Shop>;

  it("운영자 확인이 동률이면 태깅확신도 확정이 앞선다", () => {
    const sorted = shopsByGenre(
      [
        shop({ ...base, id: "estimated", confidence: "estimated" }),
        shop({ ...base, id: "certain", confidence: "certain" }),
      ],
      "tonkotsu",
    );
    expect(sorted.map((s) => s.id)).toEqual(["certain", "estimated"]);
  });

  it("운영자 확인이 태깅확신도보다 우선한다", () => {
    const sorted = shopsByGenre(
      [
        shop({
          ...base,
          id: "certain-pending",
          verification: "pending",
          confidence: "certain",
        }),
        shop({
          ...base,
          id: "estimated-confirmed",
          verification: "confirmed",
          confidence: "estimated",
        }),
      ],
      "tonkotsu",
    );
    expect(sorted.map((s) => s.id)).toEqual([
      "estimated-confirmed",
      "certain-pending",
    ]);
  });
});
