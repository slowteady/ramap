"use client";

import { useEffect, useMemo, useState } from "react";
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
  EMPTY_FILTERS,
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
  const [tab, setTab] = useState<FilterAxis>("form");

  /* 어느 칩으로 열어도 통합 시트가 해당 탭으로 */
  useEffect(() => {
    if (axis) setTab(axis);
  }, [axis]);

  const config = FILTER_AXES.find((a) => a.axis === tab) ?? FILTER_AXES[0];
  const counts = useMemo<Record<string, number>>(
    () => COUNTERS[config.axis](pins, filters),
    [config, pins, filters],
  );
  const resultCount = useMemo(() => applyFilters(pins, filters).length, [pins, filters]);
  const totalSelected =
    filters.soups.length + filters.forms.length + filters.lineages.length;

  if (!axis) return null;
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
        <DrawerHeader className="pb-2 text-left">
          <div className="flex items-baseline gap-2">
            <DrawerTitle className="text-title font-bold text-ink">필터</DrawerTitle>
            <span className="text-caption text-gray-400">복수 선택 가능</span>
          </div>
        </DrawerHeader>

        <div className="flex gap-5 border-b border-gray-100 px-4">
          {FILTER_AXES.map((a) => {
            const active = a.axis === tab;
            const count = (filters[a.filterKey] as string[]).length;
            return (
              <button
                key={a.axis}
                type="button"
                onClick={() => setTab(a.axis)}
                className={cn(
                  "-mb-px flex items-center gap-1 border-b-2 pb-2.5 text-body",
                  active
                    ? "border-ink font-bold text-ink"
                    : "border-transparent text-gray-400",
                )}
              >
                {a.title}
                {count > 0 && (
                  <span className="text-secondary font-bold text-ramen">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2 px-4 pt-4">
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

        <div className="flex gap-2 p-4">
          <button
            type="button"
            disabled={totalSelected === 0}
            onClick={() => onApply(EMPTY_FILTERS)}
            className="shrink-0 rounded-card border border-gray-100 bg-white px-5 py-3 text-body font-semibold text-ink disabled:text-gray-300"
          >
            초기화
          </button>
          <DrawerClose
            className="flex-1 rounded-card bg-ramen py-3 text-body font-bold text-white"
            onClick={onClose}
          >
            매장 {resultCount}곳 보기
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
