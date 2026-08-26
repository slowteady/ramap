"use client";

import type { ShopPin } from "@/entities/shop";
import { useMapFilters } from "../model/use-map-filters";
import { useShopMap } from "../model/use-shop-map";
import { MapFallback } from "./map-fallback";

export function ShopMap({ pins }: { pins: ShopPin[] }) {
  const { filters } = useMapFilters();
  const { containerRef, status, visiblePins } = useShopMap(pins, filters);

  if (status === "failed") return <MapFallback pins={visiblePins} />;

  return (
    <div className="relative h-[calc(100dvh-104px)]">
      <div ref={containerRef} className="size-full" />
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-050 text-secondary text-gray-400">
          지도를 불러오는 중
        </div>
      )}
    </div>
  );
}
