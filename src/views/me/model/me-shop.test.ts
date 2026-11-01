import { describe, expect, it } from "vitest";
import type { Shop } from "@/entities/shop";
import { toMeShops } from "./me-shop";

describe("toMeShops", () => {
  it("마이 화면에 쓰는 칸만 남긴다", () => {
    const shop = {
      id: "huiok",
      name: "희옥",
      areaLabel: "망원",
      soups: ["shio"],
      forms: ["ramen"],
      lineages: [],
      address: "서울 마포구",
      menus: [{ name: "시오라멘", price: 12000 }],
      hours: "11:00-21:00",
    } as unknown as Shop;
    expect(toMeShops([shop])).toEqual([
      {
        id: "huiok",
        name: "희옥",
        areaLabel: "망원",
        soups: ["shio"],
        forms: ["ramen"],
        lineages: [],
      },
    ]);
  });
});
