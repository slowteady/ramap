import type { MetadataRoute } from "next";
import {
  closurePublicState,
  GUIDES,
  LINEAGES,
  listAreaGenrePages,
  listAreaPages,
  shopsByArea,
  shopsByAreaGenre,
  shopsByGenre,
  shouldNoindexArea,
  shouldNoindexAreaGenre,
  shouldNoindexShop,
} from "@/entities/shop";
import { getClosureLedger } from "@/entities/shop/api/get-closure-ledger";
import { getShopLastmod } from "@/entities/shop/api/get-shop-lastmod";
import { getShops } from "@/entities/shop/api/get-shops";
import type { Shop } from "@/entities/shop/model/types";

const BASE = "https://ramap.kr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const shops = await getShops();
  const lastmod = await getShopLastmod();
  const ledger = await getClosureLedger();
  const dateOf = (s: Shop) => lastmod[s.id] ?? s.lastVerifiedAt;
  /* 목록 페이지는 담긴 매장 중 가장 최근 변경일 — 내용이 실제로 바뀐 날만 신호가 된다 */
  const latest = (list: Shop[]) => {
    const dates = list.map(dateOf).filter((d): d is string => Boolean(d));
    return dates.length > 0
      ? { lastModified: new Date(dates.sort().at(-1)!) }
      : {};
  };
  const open = shops.filter((s) => s.status !== "closed");

  return [
    { url: BASE, priority: 1, ...latest(open) },
    { url: `${BASE}/guide`, priority: 0.8 },
    ...GUIDES.map((g) => ({
      url: `${BASE}/guide/${g.slug}`,
      priority: 0.8,
      ...latest(shopsByGenre(shops, g.slug)),
    })),
    ...LINEAGES.filter((l) => l.kind === "taste").map((l) => ({
      url: `${BASE}/style/${l.slug}`,
      priority: 0.8,
      ...latest(open.filter((s) => (s.lineages as string[]).includes(l.slug))),
    })),
    ...shops
      .filter(
        (s) =>
          !shouldNoindexShop(s) && closurePublicState(s, ledger) !== "hidden",
      )
      .map((s) => ({
        url: `${BASE}/shop/${s.id}`,
        priority: 0.7,
        ...latest([s]),
        ...(s.photos.length > 0 && { images: s.photos }),
      })),
    ...listAreaPages(shops)
      .filter((a) => !shouldNoindexArea(shopsByArea(shops, a.area).length))
      .map((a) => ({
        url: `${BASE}/area/${encodeURIComponent(a.area)}`,
        priority: 0.8,
        ...latest(shopsByArea(shops, a.area)),
      })),
    ...listAreaGenrePages(shops)
      .filter((p) => !shouldNoindexAreaGenre(p.genre))
      .map((p) => ({
        url: `${BASE}/area/${encodeURIComponent(p.area)}/${p.genre}`,
        priority: 0.8,
        ...latest(shopsByAreaGenre(shops, p.area, p.genre)),
      })),
  ];
}
