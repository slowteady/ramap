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
    if (!pin.areaLabel) continue;
    const list = groups.get(pin.areaLabel) ?? [];
    list.push(pin);
    groups.set(pin.areaLabel, list);
  }
  return [...groups.entries()].map(([area, list]) => ({
    area,
    count: list.length,
    lat: list.reduce((sum, p) => sum + p.lat, 0) / list.length,
    lng: list.reduce((sum, p) => sum + p.lng, 0) / list.length,
  }));
}
