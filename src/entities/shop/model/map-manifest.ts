import type { FormSlug, LineageSlug, SoupSlug } from "./taxonomy";
import { isNewOpen } from "./derive";
import type { Menu, Shop, ShopStatus } from "./types";

export type ShopPin = {
  id: string;
  name: string;
  branch: string | null;
  soupDetail: string[];
  lat: number;
  lng: number;
  primarySoup: SoupSlug;
  soups: SoupSlug[];
  forms: FormSlug[];
  lineages: LineageSlug[];
  areaLabel: string | null;
  district: string | null;
  city: string | null;
  status: ShopStatus;
  topMenu: Menu | null;
  hours: string | null;
  breakTime: string | null;
  closedDays: string | null;
  amenities: Shop["amenities"];
  openedAt: string | null;
  isNew: boolean;
};

export function toMapManifest(shops: Shop[], now = new Date()): ShopPin[] {
  const pins: ShopPin[] = [];
  for (const s of shops) {
    if (s.lat === null || s.lng === null || s.status === "closed") continue;
    pins.push({
      id: s.id,
      name: s.name,
      branch: s.branch,
      soupDetail: s.soupDetail,
      lat: s.lat,
      lng: s.lng,
      primarySoup: s.primarySoup,
      soups: s.soups,
      forms: s.forms,
      lineages: s.lineages,
      areaLabel: s.areaLabel,
      district: s.district,
      city: s.city,
      status: s.status,
      topMenu: s.menus[0] ?? null,
      hours: s.hours,
      breakTime: s.breakTime,
      closedDays: s.closedDays,
      amenities: s.amenities,
      openedAt: s.openedAt,
      isNew: isNewOpen(s, now),
    });
  }
  return pins;
}
