import { soupBySlug } from "./taxonomy";
import type { Shop } from "./types";

export function restaurantJsonLd(shop: Shop): object {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: shop.name,
    servesCuisine: "라멘",
    ...(shop.address && { address: shop.address }),
    ...(shop.lat !== null &&
      shop.lng !== null && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: shop.lat,
          longitude: shop.lng,
        },
      }),
    ...(shop.hours && { openingHours: shop.hours }),
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

export function breadcrumbJsonLd(items: { name: string; url: string }[]): object {
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
