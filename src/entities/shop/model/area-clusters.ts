import type { ShopPin } from "./map-manifest";

export type AreaCluster = {
  area: string;
  count: number;
  lat: number;
  lng: number;
};

/* 줌 스코프별 클러스터 입도 — 광역일수록 큰 행정 단위 (호갱노노 실측: 단지→동→시군구→시도) */
export type ClusterGranularity = "area" | "district" | "city";

function keyOf(pin: ShopPin, granularity: ClusterGranularity): string | null {
  switch (granularity) {
    case "area":
      /* 동네라벨 없는 매장은 구 단위로 — 클러스터 레벨에서 유령이 되지 않게 */
      return pin.areaLabel ?? pin.district;
    case "district":
      return pin.district;
    case "city":
      return pin.city;
  }
}

/* 인근 지역 크로스링크(SEO 링크 그래프)용 — 소축척 근사라 유클리드 제곱거리로 충분 */
export function nearestAreas(
  clusters: AreaCluster[],
  area: string,
  limit: number,
): AreaCluster[] {
  const base = clusters.find((c) => c.area === area);
  if (!base) return [];
  return clusters
    .filter((c) => c.area !== area)
    .sort(
      (a, b) =>
        (a.lat - base.lat) ** 2 +
        (a.lng - base.lng) ** 2 -
        ((b.lat - base.lat) ** 2 + (b.lng - base.lng) ** 2),
    )
    .slice(0, limit);
}

export function buildAreaClusters(
  pins: ShopPin[],
  granularity: ClusterGranularity = "area",
): AreaCluster[] {
  const groups = new Map<string, ShopPin[]>();
  for (const pin of pins) {
    const key = keyOf(pin, granularity);
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
