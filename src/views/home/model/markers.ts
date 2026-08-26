import type { AreaCluster, ShopPin } from "@/entities/shop";
import { SOUP_COLORS } from "@/shared/config/map";
import type { MapClusterMarker, MapMarker } from "@/shared/map/types";

export function toMarkers(pins: ShopPin[], selectedId: string | null): MapMarker[] {
  return pins.map((p) => ({
    id: p.id,
    pos: { lat: p.lat, lng: p.lng },
    label: p.name,
    color: SOUP_COLORS[p.primarySoup],
    state: p.id === selectedId ? "selected" : "default",
  }));
}

export function toClusterMarkers(clusters: AreaCluster[]): MapClusterMarker[] {
  return clusters.map((c) => ({
    id: c.area,
    pos: { lat: c.lat, lng: c.lng },
    label: `${c.area} ${c.count}`,
  }));
}
