"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildAreaClusters, type ShopPin } from "@/entities/shop";
import {
  CLUSTER_LEVEL_THRESHOLD,
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_LEVEL,
} from "@/shared/config/map";
import { createKakaoAdapter } from "@/shared/map/kakao-adapter";
import type { MapAdapter, MapView } from "@/shared/map/types";
import { applyFilters, type MapFilters } from "./filter";
import { expandBounds, planMarkers, withinBounds } from "./label-collision";
import { toClusterMarkers } from "./markers";

type MapStatus = "loading" | "ready" | "failed";

const BOUNDS_BUFFER_RATIO = 0.3;

export function useShopMap(
  pins: ShopPin[],
  filters: MapFilters,
  focusId: string | null = null,
  visitedIds: ReadonlySet<string> = new Set(),
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const adapterRef = useRef<MapAdapter | null>(null);
  const [status, setStatus] = useState<MapStatus>("loading");
  const [view, setView] = useState<MapView | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const focusApplied = useRef(false);

  const visiblePins = useMemo(() => applyFilters(pins, filters), [pins, filters]);
  const selectedShop = useMemo(
    () => visiblePins.find((p) => p.id === selectedId) ?? null,
    [visiblePins, selectedId],
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
        adapter.onMapClick(() => setSelectedId(null));
        adapterRef.current = adapter;
        if (focusId && !focusApplied.current) {
          const target = pins.find((p) => p.id === focusId);
          if (target) {
            focusApplied.current = true;
            adapter.setLevel(CLUSTER_LEVEL_THRESHOLD - 1);
            adapter.panTo({ lat: target.lat, lng: target.lng });
            setSelectedId(focusId);
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
      adapter.render([], toClusterMarkers(clusters), () => {}, (area) => {
        const target = clusters.find((c) => c.area === area);
        if (!target) return;
        adapter.setLevel(CLUSTER_LEVEL_THRESHOLD - 1);
        adapter.panTo({ lat: target.lat, lng: target.lng });
      });
      return;
    }

    const buffered = expandBounds(view.bounds, BOUNDS_BUFFER_RATIO);
    const inView = visiblePins.filter((p) => withinBounds(p, buffered));
    adapter.render(
      planMarkers(inView, view.level, selectedId, visitedIds),
      [],
      setSelectedId,
      () => {},
    );
  }, [status, view, visiblePins, selectedId, visitedIds]);

  const selectPin = useCallback((id: string | null) => setSelectedId(id), []);
  const clearSelection = useCallback(() => setSelectedId(null), []);

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
    selectedShop,
    selectPin,
    clearSelection,
    locate,
  };
}
