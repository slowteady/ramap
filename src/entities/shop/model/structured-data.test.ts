import { describe, it, expect } from "vitest";
import type { Shop } from "./types";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  itemListJsonLd,
  restaurantJsonLd,
} from "./structured-data";
import {
  articleJsonLd,
  toJsonLdHtml,
  websiteJsonLd,
} from "./structured-data";

const shop = {
  id: "kinka",
  name: "킨카",
  address: "서울 성동구 성수이로 1",
  city: "서울",
  district: "성동구",
  lat: 37.54,
  lng: 127.05,
  hours: "11:00-21:00",
  photos: ["https://cdn.ramap.kr/kinka/1.jpg"],
  soups: ["niboshi", "shio"],
  menus: [{ name: "니보시 시오 라멘", price: 12000 }],
} as unknown as Shop;

describe("restaurantJsonLd", () => {
  it("필수 필드를 채운다 — 주소는 PostalAddress 객체 (구글 필수 형식)", () => {
    const ld = restaurantJsonLd(shop) as Record<string, unknown>;
    expect(ld["@type"]).toBe("Restaurant");
    expect(ld.name).toBe("킨카");
    expect(ld.address).toMatchObject({
      "@type": "PostalAddress",
      streetAddress: "서울 성동구 성수이로 1",
      addressRegion: "서울",
      addressLocality: "성동구",
      addressCountry: "KR",
    });
    expect(ld.url).toBe("https://ramap.kr/shop/kinka");
    expect(ld.image).toEqual(["https://cdn.ramap.kr/kinka/1.jpg"]);
    expect(ld.geo).toMatchObject({ latitude: 37.54, longitude: 127.05 });
    expect(ld.servesCuisine).toBe("라멘");
  });

  it("영업시간 원문은 구조화 형식이 아니라 마크업에 싣지 않는다", () => {
    const ld = restaurantJsonLd(shop) as Record<string, unknown>;
    expect(ld.openingHours).toBeUndefined();
  });

  it("사진 없으면 image가 빠진다", () => {
    const ld = restaurantJsonLd({ ...shop, photos: [] }) as Record<
      string,
      unknown
    >;
    expect(ld.image).toBeUndefined();
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
    const faq = faqJsonLd([
      { q: "니보시란?", a: "건어물 다시 계열" },
    ]) as Record<string, unknown>;
    expect(faq["@type"]).toBe("FAQPage");
  });
});

describe("toJsonLdHtml", () => {
  it("스크립트 주입을 막기 위해 <를 유니코드 이스케이프한다", () => {
    const html = toJsonLdHtml({ name: "</script><b>악성</b>" });
    expect(html).not.toContain("</script>");
    expect(html).toContain("\\u003c");
  });

  it("여러 객체를 하나의 배열로 직렬화한다", () => {
    const html = toJsonLdHtml({ a: 1 }, { b: 2 });
    expect(JSON.parse(html)).toEqual([{ a: 1 }, { b: 2 }]);
  });
});

describe("websiteJsonLd", () => {
  it("브랜드 검색용 WebSite 스키마 — 이름과 대체명", () => {
    const ld = websiteJsonLd() as Record<string, unknown>;
    expect(ld["@type"]).toBe("WebSite");
    expect(ld.name).toBe("라맵");
    expect(ld.url).toBe("https://ramap.kr");
  });
});

describe("articleJsonLd", () => {
  it("가이드용 Article — 발행 주체는 라맵 Organization", () => {
    const ld = articleJsonLd({
      headline: "니보시 라멘 가이드",
      url: "https://ramap.kr/guide/niboshi",
      description: "멸치·건어물 다시 계열",
    }) as Record<string, unknown>;
    expect(ld["@type"]).toBe("Article");
    expect(ld.headline).toBe("니보시 라멘 가이드");
    expect(ld.author).toMatchObject({ "@type": "Organization", name: "라맵" });
    expect(ld.publisher).toMatchObject({ name: "라맵" });
  });
});
