export type LatLng = { lat: number; lng: number };

export type MarkerState = "default" | "selected" | "visited";

export type MapMarker = {
  id: string;
  pos: LatLng;
  label: string;
  kind: "pill" | "dot";
  state: MarkerState;
};

export type LatLngBounds = { sw: LatLng; ne: LatLng };

export type MapView = { level: number; bounds: LatLngBounds };

export type MapClusterMarker = {
  id: string;
  pos: LatLng;
  label: string;
};

export interface MapAdapter {
  mount(el: HTMLElement, center: LatLng, level: number): void;
  destroy(): void;
  render(
    markers: MapMarker[],
    clusters: MapClusterMarker[],
    onMarkerTap: (id: string) => void,
    onClusterTap: (id: string) => void,
  ): void;
  onViewportChange(cb: (view: MapView) => void): void;
  onMapClick(cb: () => void): void;
  panTo(pos: LatLng): void;
  setLevel(level: number): void;
  setUserLocation(pos: LatLng | null): void;
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
  getBounds(): {
    getSouthWest(): { getLat(): number; getLng(): number };
    getNorthEast(): { getLat(): number; getLng(): number };
  };
  getLevel(): number;
  setLevel(level: number): void;
  panTo(pos: unknown): void;
  relayout(): void;
};

export type KakaoOverlay = {
  setMap(map: KakaoMap | null): void;
  setContent(content: HTMLElement): void;
};
