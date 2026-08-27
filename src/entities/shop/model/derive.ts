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
  return dayjs(now).diff(dayjs(shop.openedAt), "day") <= NEW_OPEN_DAYS;
}
