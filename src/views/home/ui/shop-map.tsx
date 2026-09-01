"use client";

import { useMemo, useState } from "react";
import { LocateFixed } from "lucide-react";
import { toast } from "sonner";
import type { ShopPin } from "@/entities/shop";
import { useRecords } from "@/features/records";
import { ReportSheet, useReportQuery } from "@/features/report";
import { useMapFilters } from "../model/use-map-filters";
import { useSelectedShop } from "../model/use-selected-shop";
import { useShopMap } from "../model/use-shop-map";
import type { FilterAxis } from "../model/filter-axes";
import { FilterChips } from "./filter-chips";
import { FilterSheet } from "./filter-sheet";
import { MapFallback } from "./map-fallback";
import { Onboarding } from "./onboarding";
import { ShopSheet } from "./shop-sheet";

export function ShopMap({ pins }: { pins: ShopPin[] }) {
  const { filters, apply } = useMapFilters();
  const { selectedId, select, clear } = useSelectedShop();
  const { openNew: openReport } = useReportQuery();
  const { records } = useRecords();
  const visitedIds = useMemo(
    () =>
      new Set(
        records.filter((r) => r.status === "visited").map((r) => r.shopId),
      ),
    [records],
  );
  const {
    containerRef,
    status,
    visiblePins,
    listPins,
    userLocation,
    center,
    selectedShop,
    panToPin,
    locate,
  } = useShopMap(pins, filters, selectedId, visitedIds, select, clear);
  const [sheetAxis, setSheetAxis] = useState<FilterAxis | null>(null);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Onboarding pins={pins} />
      <div className="flex items-center">
        <FilterChips
          filters={filters}
          onOpenAxis={setSheetAxis}
          onApply={apply}
        />
        <button
          type="button"
          onClick={openReport}
          className="mr-4 shrink-0 rounded-pill bg-ramen px-3.5 py-1.5 text-secondary font-bold whitespace-nowrap text-white"
        >
          라멘집 등록
        </button>
      </div>
      {status === "failed" ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <MapFallback pins={visiblePins} />
        </div>
      ) : (
        <div className="relative min-h-0 flex-1">
          <div ref={containerRef} className="size-full" />
          {status === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-050 text-secondary text-gray-400">
              지도를 불러오는 중
            </div>
          )}
          {status === "ready" && (
            <button
              type="button"
              onClick={() =>
                locate(() =>
                  toast("위치 권한이 없어 현위치를 표시할 수 없어요"),
                )
              }
              className="absolute right-3 bottom-28 z-10 flex items-center gap-1 rounded-pill bg-white py-2.5 pr-3.5 pl-3 text-secondary font-semibold text-ink shadow-[0_1px_5px_rgba(26,27,31,0.2)]"
            >
              <LocateFixed className="size-4 text-ramen" />
              내주변
            </button>
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
      {status === "ready" && (
        <ShopSheet
          listPins={listPins}
          userLocation={userLocation}
          selectedShop={selectedShop}
          onSelectPin={(pin) => {
            select(pin.id);
            panToPin(pin);
          }}
          onClose={clear}
        />
      )}
      <ReportSheet mapCenter={center} />
    </div>
  );
}
