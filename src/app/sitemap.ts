import type { MetadataRoute } from "next";
import {
  buildAreaClusters,
  GUIDES,
  LINEAGES,
  listAreaGenrePages,
  toMapManifest,
} from "@/entities/shop";
import { getShops } from "@/entities/shop/api/get-shops";

const BASE = "https://ramap.kr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const shops = await getShops();
  const areas = buildAreaClusters(toMapManifest(shops));
  const genrePages = listAreaGenrePages(shops);

  return [
    { url: BASE, priority: 1 },
    { url: `${BASE}/guide`, priority: 0.8 },
    ...GUIDES.map((g) => ({ url: `${BASE}/guide/${g.slug}`, priority: 0.8 })),
    ...LINEAGES.filter((l) => l.kind === "taste").map((l) => ({
      url: `${BASE}/style/${l.slug}`,
      priority: 0.8,
    })),
    ...shops
      .filter((s) => s.status !== "closed")
      .map((s) => ({
        url: `${BASE}/shop/${s.id}`,
        priority: 0.7,
        ...(s.lastVerifiedAt && { lastModified: new Date(s.lastVerifiedAt) }),
      })),
    ...areas.map((a) => ({
      url: `${BASE}/area/${encodeURIComponent(a.area)}`,
      priority: 0.8,
    })),
    ...genrePages.map((p) => ({
      url: `${BASE}/area/${encodeURIComponent(p.area)}/${p.genre}`,
      priority: 0.8,
    })),
  ];
}
