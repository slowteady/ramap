import { describe, it, expect } from "vitest";
import type { Shop } from "./types";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  itemListJsonLd,
  restaurantJsonLd,
} from "./structured-data";

const shop = {
  id: "kinka",
  name: "킨카",
  address: "서울 성동구 성수이로",
  lat: 37.54,
  lng: 127.05,
  hours: "11:00-21:00",
  soups: ["niboshi", "shio"],
  menus: [{ name: "니보시 시오 라멘", price: 12000 }],
} as unknown as Shop;

describe("restaurantJsonLd", () => {
  it("필수 필드를 채운다", () => {
    const ld = restaurantJsonLd(shop) as Record<string, unknown>;
    expect(ld["@type"]).toBe("Restaurant");
    expect(ld.name).toBe("킨카");
    expect(ld.geo).toMatchObject({ latitude: 37.54, longitude: 127.05 });
    expect(ld.servesCuisine).toBe("라멘");
  });
});

describe("itemList / breadcrumb / faq", () => {
  it("ItemList는 position을 1부터 매긴다", () => {
    const ld = itemListJsonLd([shop], "https://ramap.kr/area/성수") as {
      itemListElement: { position: number }[];
    };
    expect(ld.itemListElement[0].position).toBe(1);
  });

  it("BreadcrumbList·FAQPage 형태", () => {
    const bc = breadcrumbJsonLd([
      { name: "서울", url: "https://ramap.kr" },
      { name: "성수", url: "https://ramap.kr/area/성수" },
    ]) as Record<string, unknown>;
    expect(bc["@type"]).toBe("BreadcrumbList");
    const faq = faqJsonLd([{ q: "니보시란?", a: "건어물 다시 계열" }]) as Record<
      string,
      unknown
    >;
    expect(faq["@type"]).toBe("FAQPage");
  });
});
