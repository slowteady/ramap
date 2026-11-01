import dayjs from "dayjs";

export function splitAreaPicks<T extends { id: string }>(
  shops: T[],
  pickIds: string[],
): { picks: T[]; rest: T[] } {
  const byId = new Map(shops.map((shop) => [shop.id, shop]));
  const picks = pickIds.flatMap((id) => {
    const shop = byId.get(id);
    return shop ? [shop] : [];
  });
  const pickSet = new Set(picks.map((shop) => shop.id));
  return { picks, rest: shops.filter((shop) => !pickSet.has(shop.id)) };
}

export function michelinLabel(year: number): string {
  return `미쉐린 빕 구르망 ${year}`;
}

export function checkedMonthLabel(checkedAt: string): string {
  if (!checkedAt) return "";
  return dayjs(checkedAt).format("YYYY년 M월");
}
