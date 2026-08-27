import type { AreaCluster, ShopPin } from "@/entities/shop";
import type { MapClusterMarker, MapMarker } from "@/shared/map/types";

export function toMarkers(
  pins: ShopPin[],
  selectedId: string | null,
  visitedIds: ReadonlySet<string> = new Set(),
): MapMarker[] {
  return pins.map((p) => ({
    id: p.id,
    pos: { lat: p.lat, lng: p.lng },
    label: p.name,
    state:
      p.id === selectedId
        ? "selected"
        : visitedIds.has(p.id)
          ? "visited"
          : "default",
  }));
}

export function toClusterMarkers(clusters: AreaCluster[]): MapClusterMarker[] {
  return clusters.map((c) => ({
    id: c.area,
    pos: { lat: c.lat, lng: c.lng },
    label: `${c.area} ${c.count}`,
  }));
}
