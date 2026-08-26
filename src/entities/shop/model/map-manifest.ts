import type { FormSlug, LineageSlug, SoupSlug } from "./taxonomy";
import type { Shop, ShopStatus } from "./types";

export type ShopPin = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  primarySoup: SoupSlug;
  soups: SoupSlug[];
  forms: FormSlug[];
  lineages: LineageSlug[];
  areaLabel: string | null;
  status: ShopStatus;
};

export function toMapManifest(shops: Shop[]): ShopPin[] {
  const pins: ShopPin[] = [];
  for (const s of shops) {
    if (s.lat === null || s.lng === null || s.status === "closed") continue;
    pins.push({
      id: s.id,
      name: s.name,
      lat: s.lat,
      lng: s.lng,
      primarySoup: s.primarySoup,
      soups: s.soups,
      forms: s.forms,
      lineages: s.lineages,
      areaLabel: s.areaLabel,
      status: s.status,
    });
  }
  return pins;
}
