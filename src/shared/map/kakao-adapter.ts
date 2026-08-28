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

function markerEl(marker: MapMarker, onTap: (id: string) => void): HTMLElement {
  const el = document.createElement("button");
  el.type = "button";
  const selected = marker.state === "selected";
  const visited = marker.state === "visited";
  if (marker.kind === "dot") {
    el.setAttribute("aria-label", marker.label);
    el.style.cssText = [
      "width:12px;height:12px;border-radius:9999px;border:2px solid #fff;cursor:pointer;padding:0",
      "box-shadow:0 1px 4px rgba(26,27,31,.25)",
      `background:${visited ? "#c9cdd3" : "#e8442e"}`,
    ].join(";");
  } else {
    el.style.cssText = [
      "display:flex;align-items:center;padding:6px 10px;border-radius:9999px;border:0;cursor:pointer",
      "font:700 12px Pretendard,-apple-system,sans-serif;box-shadow:0 1px 5px rgba(26,27,31,.18)",
      selected
        ? "background:#1a1b1f;color:#fff"
        : visited
          ? "background:#f4f5f7;color:#9aa0a8"
          : "background:#fff;color:#1a1b1f",
    ].join(";");
    if (marker.isNew) {
      const badge = document.createElement("span");
      badge.textContent = "NEW";
      badge.style.cssText =
        "margin-right:4px;font:800 9px Pretendard,-apple-system,sans-serif;color:#e8442e;letter-spacing:.02em";
      el.append(badge);
    }
    el.append(document.createTextNode(marker.label));
  }
  el.addEventListener("click", () => onTap(marker.id));
  return el;
}

function clusterEl(cluster: MapClusterMarker, onTap: (id: string) => void): HTMLElement {
  const el = document.createElement("button");
  el.type = "button";
  el.textContent = cluster.label;
  el.style.cssText =
    "padding:7px 12px;border-radius:9999px;border:0;cursor:pointer;background:#3d4048;color:#fff;font:700 12px Pretendard,-apple-system,sans-serif;box-shadow:0 1px 5px rgba(26,27,31,.2)";
  el.addEventListener("click", () => onTap(cluster.id));
  return el;
}

function markerSig(m: MapMarker): string {
  return `${m.kind}|${m.state}|${m.label}|${m.isNew}`;
}

export async function createKakaoAdapter(key: string | undefined): Promise<MapAdapter> {
  await loadKakaoSdk(key);
  let map: KakaoMap | null = null;
  /* diff 마운트 캐시 — 주 비용이 DOM 생성·삭제라 유지분은 건드리지 않는다 */
  const cache = new Map<string, { overlay: KakaoOverlay; sig: string }>();
  let userOverlay: KakaoOverlay | null = null;
  let viewportTimer: ReturnType<typeof setTimeout> | null = null;

  const makeOverlay = (pos: LatLng, content: HTMLElement): KakaoOverlay => {
    const overlay = new window.kakao.maps.CustomOverlay({
      position: new window.kakao.maps.LatLng(pos.lat, pos.lng),
      content,
      yAnchor: 1.1,
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
        { pos: LatLng; el: () => HTMLElement; sig: string }
      >();
      for (const m of markers) {
        next.set(`m:${m.id}`, {
          pos: m.pos,
          el: () => markerEl(m, onMarkerTap),
          sig: markerSig(m),
        });
      }
      for (const c of clusters) {
        next.set(`c:${c.id}`, {
          pos: c.pos,
          el: () => clusterEl(c, onClusterTap),
          sig: `cluster|${c.label}`,
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
            overlay: makeOverlay(item.pos, item.el()),
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
