"use client";

import { useMemo, useState } from "react";
import { LocateFixed } from "lucide-react";
import { toast } from "sonner";
import type { ShopPin } from "@/entities/shop";
import { useRecords } from "@/features/records";
import { ReportSheet, useReportQuery } from "@/features/report";
import { track } from "@/shared/lib/analytics";
import { useMapFilters } from "../model/use-map-filters";
import { useSearchQuery } from "../model/use-search-query";
import { useSelectedShop } from "../model/use-selected-shop";
import { useShopMap } from "../model/use-shop-map";
import type { FilterAxis } from "../model/filter-axes";
import { FilterChips } from "./filter-chips";
import { FilterSheet } from "./filter-sheet";
import { MapFallback } from "./map-fallback";
import { SearchOverlay } from "./search-overlay";
import { ShopSheet } from "./shop-sheet";

export function ShopMap({ pins }: { pins: ShopPin[] }) {
  const { filters, apply } = useMapFilters();
  const { selectedId, select, clear } = useSelectedShop();
  const { openNew: openReport, pick } = useReportQuery();
  const search = useSearchQuery();
  const { records } = useRecords();
  const visitedIds = useMemo(
    () => new Set(records.filter((r) => r.visited).map((r) => r.shopId)),
    [records],
  );
  const savedIds = useMemo(
    () => new Set(records.filter((r) => r.saved).map((r) => r.shopId)),
    [records],
  );
  const [hideVisited, setHideVisited] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const basePins = useMemo(
    () =>
      pins.filter(
        (p) =>
          !(hideVisited && visitedIds.has(p.id)) &&
          !(savedOnly && !savedIds.has(p.id)),
      ),
    [pins, hideVisited, visitedIds, savedOnly, savedIds],
  );
  const {
    containerRef,
    status,
    view,
    visiblePins,
    listPins,
    userLocation,
    selectedShop,
    panToPin,
    panToArea,
    setLevel,
    panTo,
    coordsAt,
    locate,
  } = useShopMap(
    basePins,
    filters,
    selectedId,
    visitedIds,
    savedIds,
    (id) => {
      track("shop_selected", { shop_id: id, source: "map" });
      select(id);
    },
    clear,
  );
  const [sheetAxis, setSheetAxis] = useState<FilterAxis | null>(null);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center">
        <FilterChips
          filters={filters}
          onOpenAxis={setSheetAxis}
          onApply={apply}
          hideVisited={visitedIds.size > 0 ? hideVisited : null}
          onToggleHideVisited={() => {
            track("hide_visited_toggled", { on: !hideVisited });
            setHideVisited((v) => !v);
          }}
          savedOnly={savedIds.size > 0 || savedOnly ? savedOnly : null}
          onToggleSavedOnly={() => {
            track("saved_only_toggled", { on: !savedOnly });
            setSavedOnly((v) => !v);
          }}
          hasNew={pins.some((p) => p.isNew)}
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
          <div ref={containerRef} className="map-tone size-full" />
          {status === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-050 text-secondary text-gray-400">
              지도를 불러오는 중
            </div>
          )}
          {status === "ready" && (
            <button
              type="button"
              onClick={() =>
                locate(
                  () => track("locate_clicked", { granted: true }),
                  () => {
                    track("locate_clicked", { granted: false });
                    toast("위치 권한이 없어 현위치를 표시할 수 없어요");
                  },
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
      {status === "ready" && !pick && (
        <ShopSheet
          listPins={listPins}
          userLocation={userLocation}
          selectedShop={selectedShop}
          onSelectPin={(pin) => {
            track("shop_selected", { shop_id: pin.id, source: "list" });
            select(pin.id);
            panToPin(pin);
          }}
          onClose={clear}
        />
      )}
      <ReportSheet
        picker={
          status === "ready"
            ? { containerRef, view, setLevel, panTo, coordsAt }
            : undefined
        }
      />
      {search.isOpen && (
        <SearchOverlay
          pins={pins}
          onSelectShop={(pin) => {
            track("shop_selected", { shop_id: pin.id, source: "search" });
            select(pin.id);
            panToPin(pin);
          }}
          onSelectGenre={(filterKey, slug) =>
            apply({ ...filters, [filterKey]: [slug] })
          }
          onSelectArea={panToArea}
          onReport={openReport}
          onClose={search.close}
        />
      )}
    </div>
  );
}
