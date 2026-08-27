import type { AreaCluster } from "@/entities/shop";
import type { MapClusterMarker } from "@/shared/map/types";

export function toClusterMarkers(clusters: AreaCluster[]): MapClusterMarker[] {
  return clusters.map((c) => ({
    id: c.area,
    pos: { lat: c.lat, lng: c.lng },
    label: `${c.area} ${c.count}`,
  }));
}
