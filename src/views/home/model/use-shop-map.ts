"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildAreaClusters, type ShopPin } from "@/entities/shop";
import {
  CLUSTER_LEVEL_THRESHOLD,
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_LEVEL,
} from "@/shared/config/map";
import { createKakaoAdapter } from "@/shared/map/kakao-adapter";
import type { LatLng, MapAdapter, MapView } from "@/shared/map/types";
import { applyFilters, type MapFilters } from "./filter";
import {
  boundsCenter,
  expandBounds,
  planMarkers,
  sortByDistance,
  withinBounds,
} from "./label-collision";
import { toClusterMarkers } from "./markers";

type MapStatus = "loading" | "ready" | "failed";

const BOUNDS_BUFFER_RATIO = 0.3;

export function useShopMap(
  pins: ShopPin[],
  filters: MapFilters,
  selectedId: string | null,
  visitedIds: ReadonlySet<string>,
  onSelect: (id: string) => void,
  onClear: () => void,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const adapterRef = useRef<MapAdapter | null>(null);
  const [status, setStatus] = useState<MapStatus>("loading");
  const [view, setView] = useState<MapView | null>(null);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const center = useMemo(
    () => (view ? boundsCenter(view.bounds) : null),
    [view],
  );
  const focusApplied = useRef(false);
  const onSelectRef = useRef(onSelect);
  const onClearRef = useRef(onClear);
  onSelectRef.current = onSelect;
  onClearRef.current = onClear;

  const visiblePins = useMemo(
    () => applyFilters(pins, filters),
    [pins, filters],
  );
  const selectedShop = useMemo(
    () => visiblePins.find((p) => p.id === selectedId) ?? null,
    [visiblePins, selectedId],
  );
  /* 시트 목록: 버퍼 없는 실제 화면 범위, 중심 가까운 순 */
  const listPins = useMemo(
    () =>
      view
        ? sortByDistance(
            visiblePins.filter((p) => withinBounds(p, view.bounds)),
            boundsCenter(view.bounds),
          )
        : visiblePins,
    [view, visiblePins],
  );

  useEffect(() => {
    let cancelled = false;
    const el = containerRef.current;
    if (!el) return;

    createKakaoAdapter(process.env.NEXT_PUBLIC_KAKAO_MAP_KEY)
      .then((adapter) => {
        if (cancelled) return;
        adapter.mount(el, MAP_DEFAULT_CENTER, MAP_DEFAULT_LEVEL);
        adapter.onViewportChange(setView);
        adapter.onMapClick(() => onClearRef.current());
        adapterRef.current = adapter;
        if (selectedId && !focusApplied.current) {
          const target = pins.find((p) => p.id === selectedId);
          if (target) {
            focusApplied.current = true;
            adapter.setLevel(CLUSTER_LEVEL_THRESHOLD - 1);
            adapter.panTo({ lat: target.lat, lng: target.lng });
          }
        }
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });

    return () => {
      cancelled = true;
      adapterRef.current?.destroy();
      adapterRef.current = null;
    };
  }, []);

  useEffect(() => {
    const adapter = adapterRef.current;
    if (status !== "ready" || !adapter || !view) return;

    if (view.level >= CLUSTER_LEVEL_THRESHOLD) {
      const clusters = buildAreaClusters(visiblePins);
      adapter.render(
        [],
        toClusterMarkers(clusters),
        () => {},
        (area) => {
          const target = clusters.find((c) => c.area === area);
          if (!target) return;
          adapter.setLevel(CLUSTER_LEVEL_THRESHOLD - 1);
          adapter.panTo({ lat: target.lat, lng: target.lng });
        },
      );
      return;
    }

    const buffered = expandBounds(view.bounds, BOUNDS_BUFFER_RATIO);
    const inView = visiblePins.filter((p) => withinBounds(p, buffered));
    adapter.render(
      planMarkers(inView, view.level, selectedId, visitedIds),
      [],
      (id) => onSelectRef.current(id),
      () => {},
    );
  }, [status, view, visiblePins, selectedId, visitedIds]);

  const panToPin = useCallback((pin: ShopPin) => {
    const adapter = adapterRef.current;
    if (!adapter) return;
    adapter.setLevel(CLUSTER_LEVEL_THRESHOLD - 1);
    adapter.panTo({ lat: pin.lat, lng: pin.lng });
  }, []);

  const locate = useCallback((onDenied: () => void) => {
    if (!navigator.geolocation) {
      onDenied();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const adapter = adapterRef.current;
        if (!adapter) return;
        const pos = { lat: coords.latitude, lng: coords.longitude };
        setUserLocation(pos);
        adapter.setUserLocation(pos);
        adapter.setLevel(CLUSTER_LEVEL_THRESHOLD - 2);
        adapter.panTo(pos);
      },
      () => onDenied(),
    );
  }, []);

  return {
    containerRef,
    status,
    visiblePins,
    listPins,
    userLocation,
    center,
    selectedShop,
    panToPin,
    locate,
  };
}
