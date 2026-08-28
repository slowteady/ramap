import { describe, it, expect } from "vitest";
import type { Shop } from "./types";
import { toMapManifest } from "./map-manifest";

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

describe("toMapManifest", () => {
  it("좌표 없는 매장과 폐업 매장을 제외한다", () => {
    const pins = toMapManifest([
      shop({}),
      shop({ id: "no-coord", lat: null }),
      shop({ id: "closed", status: "closed" }),
    ]);
    expect(pins.map((p) => p.id)).toEqual(["kinka"]);
  });

  it("지도에 필요한 필드만 담는다", () => {
    const pin = toMapManifest([
      shop({ menus: [{ name: "니보시 소바", price: 11000 }] }),
    ])[0];
    expect(pin).toEqual({
      id: "kinka",
      name: "킨카",
      lat: 37.54,
      lng: 127.05,
      primarySoup: "niboshi",
      soups: ["niboshi"],
      forms: ["ramen"],
      lineages: [],
      areaLabel: "성수",
      status: "open",
      topMenu: { name: "니보시 소바", price: 11000 },
      hours: null,
      amenities: [],
      isNew: false,
    });
  });
});
