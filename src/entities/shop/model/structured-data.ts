import { soupBySlug } from "./taxonomy";
import type { Shop } from "./types";

/* dangerouslySetInnerHTML 주입 차단 — Next 공식 가이드의 < 치환 */
export function toJsonLdHtml(...objs: object[]): string {
  return JSON.stringify(objs.length === 1 ? objs[0] : objs).replace(
    /</g,
    "\\u003c",
  );
}

export function websiteJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "라맵",
    alternateName: "Ramap",
    url: "https://ramap.kr",
  };
}

export function organizationJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "라맵",
    url: "https://ramap.kr",
    logo: "https://ramap.kr/apple-icon.png",
  };
}

/* 구글 LocalBusiness 필수 = name + PostalAddress. 영업시간 원문은 hh:mm 스펙 미충족이라
   잘못 싣는 것보다 생략이 안전. 평점·리뷰는 실데이터 전까지 마크업 금지(수동 조치 대상) */
export function restaurantJsonLd(shop: Shop): object {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: shop.name,
    url: `https://ramap.kr/shop/${shop.id}`,
    servesCuisine: "라멘",
    ...(shop.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: shop.address,
        ...(shop.city && { addressRegion: shop.city }),
        ...(shop.district && { addressLocality: shop.district }),
        addressCountry: "KR",
      },
    }),
    ...(shop.photos.length > 0 && { image: shop.photos }),
    ...(shop.lat !== null &&
      shop.lng !== null && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: shop.lat,
          longitude: shop.lng,
        },
      }),
    ...(shop.menus.length > 0 && {
      hasMenu: {
        "@type": "Menu",
        hasMenuItem: shop.menus.map((m) => ({
          "@type": "MenuItem",
          name: m.name,
          ...(m.price !== null && {
            offers: { "@type": "Offer", price: m.price, priceCurrency: "KRW" },
          }),
        })),
      },
    }),
    keywords: shop.soups
      .map((s) => soupBySlug(s)?.label)
      .filter(Boolean)
      .join(", "),
  };
}

export function itemListJsonLd(shops: Shop[], url: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    url,
    numberOfItems: shops.length,
    itemListElement: shops.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      url: `https://ramap.kr/shop/${s.id}`,
    })),
  };
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

const RAMAP_ORG = { "@type": "Organization", name: "라맵" };

export function articleJsonLd(opts: {
  headline: string;
  url: string;
  description?: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    url: opts.url,
    ...(opts.description && { description: opts.description }),
    author: RAMAP_ORG,
    publisher: RAMAP_ORG,
  };
}

export function faqJsonLd(qas: { q: string; a: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qas.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}
