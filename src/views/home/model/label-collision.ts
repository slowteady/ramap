import type { ShopPin } from "@/entities/shop";
import type { LatLng, LatLngBounds, MapMarker } from "@/shared/map/types";

/* 카카오 레벨별 1px 근사 도(度) — level 1에서 1px≈0.25m, 위도 1도≈111,320m */
const BASE_DEG_PER_PX = 0.25 / 111320;
const LNG_SCALE = 1 / Math.cos((37.5 * Math.PI) / 180);
const DOT_HALF_PX = 12;
const LABEL_BLOCK_PX = 40;
const LABEL_CHAR_PX = 13;

export function degPerPx(level: number): number {
  return BASE_DEG_PER_PX * 2 ** (level - 1);
}

type Box = { x1: number; x2: number; y1: number; y2: number };

function pillBox(pin: ShopPin, unit: number): Box {
  const halfW =
    Math.max(DOT_HALF_PX, (pin.name.length * LABEL_CHAR_PX) / 2) * unit;
  return {
    x1: pin.lng - halfW * LNG_SCALE,
    x2: pin.lng + halfW * LNG_SCALE,
    y1: pin.lat - (LABEL_BLOCK_PX - DOT_HALF_PX) * unit,
    y2: pin.lat + DOT_HALF_PX * unit,
  };
}

function dotBox(pin: ShopPin, unit: number): Box {
  const half = DOT_HALF_PX * unit;
  return {
    x1: pin.lng - half * LNG_SCALE,
    x2: pin.lng + half * LNG_SCALE,
    y1: pin.lat - half,
    y2: pin.lat + half,
  };
}

function intersects(a: Box, b: Box): boolean {
  return a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;
}

/* 겹침 시 하위 우선순위 라벨을 점으로 강등 — 위치 이동 금지 (구글맵 collision behavior 방식) */
export function planMarkers(
  pins: ShopPin[],
  level: number,
  selectedId: string | null,
  visitedIds: ReadonlySet<string>,
): MapMarker[] {
  const unit = degPerPx(level);
  const priority = (p: ShopPin) =>
    p.id === selectedId ? 0 : visitedIds.has(p.id) ? 2 : 1;
  const ordered = [...pins].sort(
    (a, b) => priority(a) - priority(b) || a.name.localeCompare(b.name),
  );

  const kept: Box[] = [];
  const markers: MapMarker[] = [];
  for (const pin of ordered) {
    const box = pillBox(pin, unit);
    const collides = kept.some((k) => intersects(k, box));
    const pill = pin.id === selectedId || !collides;
    kept.push(pill ? box : dotBox(pin, unit));
    markers.push({
      id: pin.id,
      pos: { lat: pin.lat, lng: pin.lng },
      label: pin.name,
      kind: pill ? "pill" : "dot",
      isNew: pin.isNew,
      state:
        pin.id === selectedId
          ? "selected"
          : visitedIds.has(pin.id)
            ? "visited"
            : "default",
    });
  }
  return markers;
}

export function expandBounds(bounds: LatLngBounds, ratio: number): LatLngBounds {
  const latPad = (bounds.ne.lat - bounds.sw.lat) * ratio;
  const lngPad = (bounds.ne.lng - bounds.sw.lng) * ratio;
  return {
    sw: { lat: bounds.sw.lat - latPad, lng: bounds.sw.lng - lngPad },
    ne: { lat: bounds.ne.lat + latPad, lng: bounds.ne.lng + lngPad },
  };
}

export function withinBounds(pin: ShopPin, bounds: LatLngBounds): boolean {
  return (
    pin.lat >= bounds.sw.lat &&
    pin.lat <= bounds.ne.lat &&
    pin.lng >= bounds.sw.lng &&
    pin.lng <= bounds.ne.lng
  );
}

export function sortByDistance(pins: ShopPin[], center: LatLng): ShopPin[] {
  const dist = (p: ShopPin) => {
    const dLat = p.lat - center.lat;
    const dLng = (p.lng - center.lng) / LNG_SCALE;
    return dLat * dLat + dLng * dLng;
  };
  return [...pins].sort((a, b) => dist(a) - dist(b));
}

export function boundsCenter(bounds: LatLngBounds): LatLng {
  return {
    lat: (bounds.sw.lat + bounds.ne.lat) / 2,
    lng: (bounds.sw.lng + bounds.ne.lng) / 2,
  };
}
