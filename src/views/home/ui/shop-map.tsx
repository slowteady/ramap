"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ShopPin } from "@/entities/shop";
import { useRecords } from "@/features/records";
import { useMapFilters } from "../model/use-map-filters";
import { useShopMap } from "../model/use-shop-map";
import type { FilterAxis } from "../model/filter-axes";
import { FilterChips } from "./filter-chips";
import { FilterSheet } from "./filter-sheet";
import { MapFallback } from "./map-fallback";
import { ShopPeekCard } from "./shop-peek-card";

export function ShopMap({ pins }: { pins: ShopPin[] }) {
  const { filters, apply } = useMapFilters();
  const focusId = useSearchParams().get("focus");
  const { records } = useRecords();
  const visitedIds = useMemo(
    () =>
      new Set(records.filter((r) => r.status === "visited").map((r) => r.shopId)),
    [records],
  );
  const { containerRef, status, visiblePins, selectedShop, selectPin, clearSelection } =
    useShopMap(pins, filters, focusId, visitedIds);
  const [sheetAxis, setSheetAxis] = useState<FilterAxis | null>(null);

  const selectSibling = (offset: number) => {
    if (!selectedShop) return;
    const index = visiblePins.findIndex((p) => p.id === selectedShop.id);
    const next = visiblePins[index + offset];
    if (next) selectPin(next.id);
  };

  return (
    <div className="flex flex-col">
      <FilterChips filters={filters} onOpenAxis={setSheetAxis} />
      {status === "failed" ? (
        <MapFallback pins={visiblePins} />
      ) : (
        <div className="relative h-[calc(100dvh-148px)]">
          <div ref={containerRef} className="size-full" />
          {status === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-050 text-secondary text-gray-400">
              지도를 불러오는 중
            </div>
          )}
        </div>
      )}
      <FilterSheet
        axis={sheetAxis}
        pins={pins}
        filters={filters}
        onApply={apply}
        onClose={() => setSheetAxis(null)}
      />
      {selectedShop && (
        <ShopPeekCard
          shop={selectedShop}
          onClose={clearSelection}
          onPrev={() => selectSibling(-1)}
          onNext={() => selectSibling(1)}
        />
      )}
    </div>
  );
}
