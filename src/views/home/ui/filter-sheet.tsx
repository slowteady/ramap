"use client";

import { useMemo } from "react";
import type { ShopPin } from "@/entities/shop";
import { cn } from "@/shared/lib/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/drawer";
import {
  applyFilters,
  countByForm,
  countByLineage,
  countBySoup,
  type MapFilters,
} from "../model/filter";
import { FILTER_AXES, type FilterAxis } from "../model/filter-axes";

type FilterSheetProps = {
  axis: FilterAxis | null;
  pins: ShopPin[];
  filters: MapFilters;
  onApply: (next: MapFilters) => void;
  onClose: () => void;
};

const COUNTERS = {
  form: countByForm,
  soup: countBySoup,
  lineage: countByLineage,
} as const;

export function FilterSheet({ axis, pins, filters, onApply, onClose }: FilterSheetProps) {
  const config = FILTER_AXES.find((a) => a.axis === axis) ?? null;

  const counts = useMemo<Record<string, number>>(
    () => (config ? COUNTERS[config.axis](pins, filters) : {}),
    [config, pins, filters],
  );
  const resultCount = useMemo(() => applyFilters(pins, filters).length, [pins, filters]);

  if (!config) return null;
  const selected = filters[config.filterKey] as string[];

  const toggle = (slug: string) => {
    const next = selected.includes(slug)
      ? selected.filter((s) => s !== slug)
      : [...selected, slug];
    onApply({ ...filters, [config.filterKey]: next });
  };

  return (
    <Drawer open onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <DrawerTitle className="text-title font-bold text-ink">
                {config.sheetTitle}
              </DrawerTitle>
              <span className="text-caption text-gray-400">복수 선택 가능</span>
            </div>
            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => onApply({ ...filters, [config.filterKey]: [] })}
                className="text-secondary text-gray-400 underline underline-offset-2"
              >
                초기화
              </button>
            )}
          </div>
        </DrawerHeader>
        <div className="grid grid-cols-2 gap-2 px-4">
          {config.items.map((item) => {
            const isOn = selected.includes(item.slug);
            const count = counts[item.slug] ?? 0;
            const disabled = count === 0 && !isOn;
            return (
              <button
                key={item.slug}
                type="button"
                disabled={disabled}
                onClick={() => toggle(item.slug)}
                className={cn(
                  "flex flex-col gap-0.5 rounded-card border px-3 py-2.5 text-left",
                  isOn
                    ? "border-ramen bg-ramen-100 text-ramen"
                    : disabled
                      ? "border-gray-100 bg-white text-gray-300"
                      : "border-gray-100 bg-white text-ink",
                )}
              >
                <span className="flex items-baseline justify-between">
                  <span className="text-body font-semibold">{item.label}</span>
                  <span
                    className={cn(
                      "text-caption",
                      isOn ? "text-ramen/70" : "text-gray-400",
                    )}
                  >
                    {count}
                  </span>
                </span>
                {item.description && (
                  <span
                    className={cn(
                      "text-caption",
                      isOn ? "text-ramen/70" : "text-gray-400",
                    )}
                  >
                    {item.description}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="px-4 pt-3 text-caption text-gray-400">
          0곳인 값은 선택할 수 없어요
        </p>
        <div className="p-4 pt-2">
          <DrawerClose
            className="w-full rounded-pill bg-ramen py-3 text-body font-bold text-white"
            onClick={onClose}
          >
            매장 {resultCount}곳 보기
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
