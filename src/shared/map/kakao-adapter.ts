import { loadKakaoSdk } from "./kakao-loader";
import type {
  KakaoMap,
  KakaoOverlay,
  LatLng,
  MapAdapter,
  MapClusterMarker,
  MapMarker,
} from "./types";

function markerEl(marker: MapMarker, onTap: (id: string) => void): HTMLElement {
  const el = document.createElement("button");
  el.type = "button";
  const selected = marker.state === "selected";
  const visited = marker.state === "visited";
  el.style.cssText = [
    "display:flex;align-items:center;gap:5px;padding:6px 10px;border-radius:9999px;border:0;cursor:pointer",
    "font:700 12px Pretendard,-apple-system,sans-serif;box-shadow:0 1px 5px rgba(26,27,31,.18)",
    selected
      ? "background:#1a1b1f;color:#fff"
      : visited
        ? "background:#f4f5f7;color:#9aa0a8"
        : "background:#fff;color:#1a1b1f",
  ].join(";");
  const dot = document.createElement("span");
  dot.style.cssText = `width:8px;height:8px;border-radius:9999px;background:${visited ? "#c9cdd3" : marker.color}`;
  el.append(dot, document.createTextNode(marker.label));
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

export async function createKakaoAdapter(key: string | undefined): Promise<MapAdapter> {
  await loadKakaoSdk(key);
  let map: KakaoMap | null = null;
  let overlays: KakaoOverlay[] = [];
  let userOverlay: KakaoOverlay | null = null;

  const clearOverlays = () => {
    for (const o of overlays) o.setMap(null);
    overlays = [];
  };

  const place = (pos: LatLng, content: HTMLElement) => {
    const overlay = new window.kakao.maps.CustomOverlay({
      position: new window.kakao.maps.LatLng(pos.lat, pos.lng),
      content,
      yAnchor: 1.1,
      clickable: true,
    });
    if (map) overlay.setMap(map);
    overlays.push(overlay);
  };

  return {
    mount(el, center, level) {
      map = new window.kakao.maps.Map(el, {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level,
      });
    },
    destroy() {
      clearOverlays();
      userOverlay?.setMap(null);
      userOverlay = null;
      map = null;
    },
    setMarkers(markers, onTap) {
      clearOverlays();
      for (const m of markers) place(m.pos, markerEl(m, onTap));
    },
    setClusters(clusters, onTap) {
      clearOverlays();
      for (const c of clusters) place(c.pos, clusterEl(c, onTap));
    },
    onViewportChange(cb) {
      if (!map) return;
      window.kakao.maps.event.addListener(map, "zoom_changed", () => {
        if (map) cb(map.getLevel());
      });
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
