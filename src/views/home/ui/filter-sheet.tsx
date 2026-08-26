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
          <DrawerTitle className="text-title font-bold text-ink">
            {config.title}
          </DrawerTitle>
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
                  "flex flex-col gap-0.5 rounded-card px-3 py-2.5 text-left",
                  isOn
                    ? "bg-ink text-white"
                    : disabled
                      ? "bg-gray-050 text-gray-300"
                      : "bg-gray-050 text-ink",
                )}
              >
                <span className="flex items-baseline justify-between">
                  <span className="text-body font-semibold">{item.label}</span>
                  <span
                    className={cn(
                      "text-caption",
                      isOn ? "text-white/70" : "text-gray-400",
                    )}
                  >
                    {count}
                  </span>
                </span>
                {item.description && (
                  <span
                    className={cn(
                      "text-caption",
                      isOn ? "text-white/70" : "text-gray-400",
                    )}
                  >
                    {item.description}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="p-4">
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
