export type LatLng = { lat: number; lng: number };

export type MarkerState = "default" | "selected" | "visited";

export type MapMarker = {
  id: string;
  pos: LatLng;
  label: string;
  color: string;
  state: MarkerState;
};

export type MapClusterMarker = {
  id: string;
  pos: LatLng;
  label: string;
};

export interface MapAdapter {
  mount(el: HTMLElement, center: LatLng, level: number): void;
  destroy(): void;
  setMarkers(markers: MapMarker[], onTap: (id: string) => void): void;
  setClusters(clusters: MapClusterMarker[], onTap: (id: string) => void): void;
  onViewportChange(cb: (level: number) => void): void;
  panTo(pos: LatLng): void;
  setLevel(level: number): void;
}

declare global {
  interface Window {
    kakao: {
      maps: {
        load(cb: () => void): void;
        LatLng: new (lat: number, lng: number) => unknown;
        Map: new (el: HTMLElement, opts: { center: unknown; level: number }) => KakaoMap;
        CustomOverlay: new (opts: {
          position: unknown;
          content: HTMLElement;
          yAnchor?: number;
          clickable?: boolean;
        }) => KakaoOverlay;
        event: {
          addListener(target: unknown, type: string, cb: () => void): void;
        };
      };
    };
  }
}

export type KakaoMap = {
  getLevel(): number;
  setLevel(level: number): void;
  panTo(pos: unknown): void;
  relayout(): void;
};

export type KakaoOverlay = {
  setMap(map: KakaoMap | null): void;
};
