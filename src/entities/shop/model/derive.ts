import dayjs from "dayjs";
import type { LineageSlug, SoupSlug } from "./taxonomy";
import type { Shop } from "./types";

export type GenreSlug = SoupSlug | LineageSlug;

export function shopById(shops: Shop[], id: string): Shop | undefined {
  return shops.find((s) => s.id === id);
}

export function shopsByArea(shops: Shop[], area: string): Shop[] {
  return shops.filter((s) => s.areaLabel === area && s.status !== "closed");
}

export function shopsByAreaGenre(
  shops: Shop[],
  area: string,
  genre: GenreSlug,
): Shop[] {
  return shopsByArea(shops, area).filter(
    (s) =>
      (s.soups as string[]).includes(genre) ||
      (s.lineages as string[]).includes(genre),
  );
}

/* 가이드의 매장 목록 — 운영자 확인분 먼저, 그다음 최근 확인일순 */
export function shopsByGenre(shops: Shop[], genre: GenreSlug): Shop[] {
  return shops
    .filter(
      (s) =>
        s.status !== "closed" &&
        ((s.soups as string[]).includes(genre) ||
          (s.lineages as string[]).includes(genre)),
    )
    .sort((a, b) => {
      const av = a.verification === "confirmed" ? 0 : 1;
      const bv = b.verification === "confirmed" ? 0 : 1;
      if (av !== bv) return av - bv;
      return (b.lastVerifiedAt ?? "").localeCompare(a.lastVerifiedAt ?? "");
    });
}

export function listAreaGenrePages(
  shops: Shop[],
  min = 3,
): { area: string; genre: GenreSlug }[] {
  const counts = new Map<string, number>();
  for (const s of shops) {
    if (s.status === "closed" || !s.areaLabel) continue;
    for (const genre of [...s.soups, ...s.lineages]) {
      const key = `${s.areaLabel}|${genre}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  const pages: { area: string; genre: GenreSlug }[] = [];
  for (const [key, count] of counts) {
    if (count < min) continue;
    const [area, genre] = key.split("|");
    pages.push({ area, genre: genre as GenreSlug });
  }
  return pages;
}

export function groupByOpenedMonth(
  shops: Shop[],
): { month: string; shops: Shop[] }[] {
  const opened = shops
    .filter((s): s is Shop & { openedAt: string } =>
      Boolean(s.openedAt && s.status !== "closed"),
    )
    .sort((a, b) => (a.openedAt < b.openedAt ? 1 : -1));
  const groups: { month: string; shops: Shop[] }[] = [];
  for (const s of opened) {
    const month = dayjs(s.openedAt).format("YYYY-MM");
    const last = groups[groups.length - 1];
    if (last?.month === month) last.shops.push(s);
    else groups.push({ month, shops: [s] });
  }
  return groups;
}

const NEW_OPEN_DAYS = 90;

export function isNewOpen(shop: Shop, now: Date): boolean {
  if (!shop.openedAt) return false;
  const age = dayjs(now).diff(dayjs(shop.openedAt), "day");
  return age >= 0 && age <= NEW_OPEN_DAYS;
}

/* 신규 오픈 페이지 기준 = NEW 마커와 동일한 90일 창 (13번 C절 NEW 배지) */
export function recentOpens(shops: Shop[], now: Date): Shop[] {
  return shops.filter((s) => s.status !== "closed" && isNewOpen(s, now));
}

const LNG_SCALE = 1 / Math.cos((37.5 * Math.PI) / 180);

export function nearbyShops(shops: Shop[], origin: Shop, n: number): Shop[] {
  if (origin.lat === null || origin.lng === null) return [];
  const [lat0, lng0] = [origin.lat, origin.lng];
  const dist = (s: Shop & { lat: number; lng: number }) => {
    const dLat = s.lat - lat0;
    const dLng = (s.lng - lng0) / LNG_SCALE;
    return dLat * dLat + dLng * dLng;
  };
  return shops
    .filter(
      (s): s is Shop & { lat: number; lng: number } =>
        s.id !== origin.id &&
        s.status !== "closed" &&
        s.lat !== null &&
        s.lng !== null,
    )
    .sort((a, b) => dist(a) - dist(b))
    .slice(0, n);
}
