import { loadKakaoSdk } from "./kakao-loader";
import type {
  KakaoMap,
  KakaoOverlay,
  LatLng,
  MapAdapter,
  MapClusterMarker,
  MapMarker,
  MapView,
} from "./types";

const VIEWPORT_DEBOUNCE_MS = 150;

/* 도넛(레드 링+흰 심, 캐치테이블 문법) — 테두리·그림자는 강화판 (2026-09-03) */
function dot(size: number, ring: string): string {
  const core = Math.max(3, Math.round(size * 0.16));
  return [
    `width:${size}px;height:${size}px;border-radius:9999px;flex:none`,
    `background:radial-gradient(circle, #fff 0 ${core}px, ${ring} ${core}px 100%)`,
    "border:3px solid #fff;box-shadow:0 1px 5px rgba(26,27,31,.35)",
  ].join(";");
}

/* 시각 크기와 별개로 터치 타깃 44px 확보(명세 §1) — 투명 패딩 + 앵커 마진 보정 */
const HIT_PAD = 10;

function markerEl(marker: MapMarker, onTap: (id: string) => void): HTMLElement {
  const el = document.createElement("button");
  el.type = "button";
  const selected = marker.state === "selected";
  const visited = marker.state === "visited";
  const ring = visited ? "#c9cdd3" : "#e23c36";
  const size = selected ? 28 : 22;
  el.style.cssText = `display:flex;flex-direction:column;align-items:center;gap:2px;padding:${HIT_PAD}px;border:0;background:none;cursor:pointer;margin-top:-${HIT_PAD + size / 2}px`;
  const dotEl = document.createElement("span");
  dotEl.style.cssText = dot(size, ring);
  el.append(dotEl);
  if (marker.kind === "dot" && !selected) {
    el.setAttribute("aria-label", marker.label);
  } else {
    /* 라벨 pill — 흰 라운드 칩으로 타일과 분리 (에어비앤비 문법) */
    const label = document.createElement("span");
    label.style.cssText = [
      "display:flex;align-items:center;gap:3px;white-space:nowrap",
      "padding:3px 8px;border-radius:9999px;background:#fff",
      "box-shadow:0 1px 4px rgba(26,27,31,.22)",
      `font:800 13px Pretendard,-apple-system,sans-serif`,
      `color:${visited ? "#9aa0a8" : selected ? "#e23c36" : "#1a1b1f"}`,
    ].join(";");
    if (marker.isNew && !visited) {
      const badge = document.createElement("span");
      badge.textContent = "NEW";
      badge.style.cssText =
        "display:inline-block;padding:1px 4px;border-radius:4px;background:#e23c36;color:#fff;font:800 9px Pretendard,-apple-system,sans-serif";
      label.append(badge);
    }
    label.append(document.createTextNode(marker.label));
    el.append(label);
  }
  el.addEventListener("click", () => onTap(marker.id));
  return el;
}

function clusterEl(
  cluster: MapClusterMarker,
  onTap: (id: string) => void,
): HTMLElement {
  const el = document.createElement("button");
  el.type = "button";
  el.style.cssText =
    "display:flex;align-items:center;gap:4px;padding:6px 11px;border-radius:9999px;border:2px solid #e23c36;cursor:pointer;background:#fff;font:700 12px Pretendard,-apple-system,sans-serif;color:#1a1b1f;box-shadow:0 1px 4px rgba(26,27,31,.15)";
  const [name, count] = [
    cluster.label.replace(/ \d+$/, ""),
    cluster.label.match(/\d+$/)?.[0],
  ];
  el.append(document.createTextNode(name));
  if (count) {
    const n = document.createElement("span");
    n.textContent = count;
    n.style.cssText = "color:#e23c36";
    el.append(n);
  }
  el.addEventListener("click", () => onTap(cluster.id));
  return el;
}

function markerSig(m: MapMarker): string {
  return `${m.kind}|${m.state}|${m.label}|${m.isNew}`;
}

export async function createKakaoAdapter(
  key: string | undefined,
): Promise<MapAdapter> {
  await loadKakaoSdk(key);
  let map: KakaoMap | null = null;
  /* diff 마운트 캐시 — 주 비용이 DOM 생성·삭제라 유지분은 건드리지 않는다 */
  const cache = new Map<string, { overlay: KakaoOverlay; sig: string }>();
  let userOverlay: KakaoOverlay | null = null;
  let viewportTimer: ReturnType<typeof setTimeout> | null = null;

  const makeOverlay = (
    pos: LatLng,
    content: HTMLElement,
    anchor: { x: number; y: number },
  ): KakaoOverlay => {
    const overlay = new window.kakao.maps.CustomOverlay({
      position: new window.kakao.maps.LatLng(pos.lat, pos.lng),
      content,
      xAnchor: anchor.x,
      yAnchor: anchor.y,
      clickable: true,
    });
    if (map) overlay.setMap(map);
    return overlay;
  };

  const clearAll = () => {
    for (const { overlay } of cache.values()) overlay.setMap(null);
    cache.clear();
  };

  const currentView = (): MapView | null => {
    if (!map) return null;
    const b = map.getBounds();
    const sw = b.getSouthWest();
    const ne = b.getNorthEast();
    return {
      level: map.getLevel(),
      bounds: {
        sw: { lat: sw.getLat(), lng: sw.getLng() },
        ne: { lat: ne.getLat(), lng: ne.getLng() },
      },
    };
  };

  return {
    mount(el, center, level) {
      map = new window.kakao.maps.Map(el, {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level,
      });
    },
    destroy() {
      if (viewportTimer) clearTimeout(viewportTimer);
      clearAll();
      userOverlay?.setMap(null);
      userOverlay = null;
      map = null;
    },
    render(markers, clusters, onMarkerTap, onClusterTap) {
      const next = new Map<
        string,
        {
          pos: LatLng;
          el: () => HTMLElement;
          sig: string;
          anchor: { x: number; y: number };
        }
      >();
      for (const m of markers) {
        next.set(`m:${m.id}`, {
          pos: m.pos,
          el: () => markerEl(m, onMarkerTap),
          sig: markerSig(m),
          anchor: { x: 0.5, y: 0 },
        });
      }
      for (const c of clusters) {
        next.set(`c:${c.id}`, {
          pos: c.pos,
          el: () => clusterEl(c, onClusterTap),
          sig: `cluster|${c.label}`,
          anchor: { x: 0.5, y: 0.5 },
        });
      }

      for (const [key, cached] of cache) {
        if (!next.has(key)) {
          cached.overlay.setMap(null);
          cache.delete(key);
        }
      }
      for (const [key, item] of next) {
        const cached = cache.get(key);
        if (!cached) {
          cache.set(key, {
            overlay: makeOverlay(item.pos, item.el(), item.anchor),
            sig: item.sig,
          });
        } else if (cached.sig !== item.sig) {
          cached.overlay.setContent(item.el());
          cached.sig = item.sig;
        }
      }
    },
    onViewportChange(cb) {
      if (!map) return;
      const emit = () => {
        if (viewportTimer) clearTimeout(viewportTimer);
        viewportTimer = setTimeout(() => {
          const view = currentView();
          if (view) cb(view);
        }, VIEWPORT_DEBOUNCE_MS);
      };
      window.kakao.maps.event.addListener(map, "idle", emit);
      const initial = currentView();
      if (initial) cb(initial);
    },
    onMapClick(cb) {
      if (!map) return;
      window.kakao.maps.event.addListener(map, "click", cb);
    },
    panTo(pos) {
      map?.panTo(new window.kakao.maps.LatLng(pos.lat, pos.lng));
    },
    setLevel(level) {
      map?.setLevel(level);
    },
    coordsAt(x, y) {
      if (!map) return null;
      const pos = map
        .getProjection()
        .coordsFromContainerPoint(new window.kakao.maps.Point(x, y));
      return { lat: pos.getLat(), lng: pos.getLng() };
    },
    setUserLocation(pos) {
      userOverlay?.setMap(null);
      userOverlay = null;
      if (!pos || !map) return;
      const dot = document.createElement("div");
      dot.style.cssText =
        "width:14px;height:14px;border-radius:9999px;background:#4285f4;border:3px solid #fff;box-shadow:0 1px 4px rgba(26,27,31,.3)";
      userOverlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(pos.lat, pos.lng),
        content: dot,
        yAnchor: 0.5,
        clickable: false,
      });
      userOverlay.setMap(map);
    },
  };
}
