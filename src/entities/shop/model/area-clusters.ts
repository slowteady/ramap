import type { ShopPin } from "./map-manifest";

export type AreaCluster = {
  area: string;
  count: number;
  lat: number;
  lng: number;
};

export function buildAreaClusters(pins: ShopPin[]): AreaCluster[] {
  const groups = new Map<string, ShopPin[]>();
  for (const pin of pins) {
    /* 동네라벨 없는 매장은 구 단위로 — 클러스터 레벨에서 유령이 되지 않게 */
    const key = pin.areaLabel ?? pin.district;
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push(pin);
    groups.set(key, list);
  }
  return [...groups.entries()].map(([area, list]) => ({
    area,
    count: list.length,
    lat: list.reduce((sum, p) => sum + p.lat, 0) / list.length,
    lng: list.reduce((sum, p) => sum + p.lng, 0) / list.length,
  }));
}
