"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2, X } from "lucide-react";
import type { ShopPin } from "@/entities/shop";
import { cn } from "@/shared/lib/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
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
import { FILTER_AXES, visibleItems, type FilterAxis } from "../model/filter-axes";

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

  useEffect(() => {
    if (axis) setTab(axis);
  }, [axis]);

  const config = FILTER_AXES.find((a) => a.axis === tab) ?? FILTER_AXES[0];
  const counts = useMemo<Record<string, number>>(
    () => COUNTERS[config.axis](pins, filters),
    [config, pins, filters],
  );
  const resultCount = useMemo(() => applyFilters(pins, filters).length, [pins, filters]);

  const applied = FILTER_AXES.flatMap((a) =>
    (filters[a.filterKey] as string[]).map((slug) => ({
      axis: a,
      slug,
      label: a.items.find((i) => i.slug === slug)?.label ?? slug,
    })),
  );

  if (!axis) return null;
  const selected = filters[config.filterKey] as string[];

  const toggle = (slug: string) => {
    const next = selected.includes(slug)
      ? selected.filter((s) => s !== slug)
      : [...selected, slug];
    onApply({ ...filters, [config.filterKey]: next });
  };

  const renderItem = (item: (typeof config.items)[number]) => {
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
            ? "border-ramen bg-ramen-050 text-ramen"
            : disabled
              ? "border-gray-100 bg-white text-gray-300"
              : "border-gray-100 bg-white text-ink",
        )}
      >
        <span className="text-body font-semibold">{item.label}</span>
        {config.axis === "lineage" && item.description && (
          <span
            className={cn("text-caption", isOn ? "text-ramen/70" : "text-gray-400")}
          >
            {item.description}
          </span>
        )}
      </button>
    );
  };

  const removeValue = (item: (typeof applied)[number]) => {
    onApply({
      ...filters,
      [item.axis.filterKey]: (filters[item.axis.filterKey] as string[]).filter(
        (s) => s !== item.slug,
      ),
    });
  };

  return (
    <Drawer open onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <div className="flex gap-5 border-b border-gray-100 px-4 pt-4">
          {FILTER_AXES.map((a) => {
            const active = a.axis === tab;
            return (
              <button
                key={a.axis}
                type="button"
                onClick={() => setTab(a.axis)}
                className={cn(
                  "-mb-px border-b-2 pb-2.5 text-body",
                  active
                    ? "border-ink font-bold text-ink"
                    : "border-transparent text-gray-400",
                )}
              >
                {a.title}
              </button>
            );
          })}
        </div>

        <div className="flex items-baseline justify-between px-4 pt-4">
          <DrawerTitle className="text-title font-bold text-ink">
            {config.sheetTitle}
          </DrawerTitle>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onApply({ ...filters, [config.filterKey]: [] })}
              className="text-secondary text-gray-400"
            >
              초기화
            </button>
          )}
        </div>

        <div
          className={cn(
            "grid gap-2 px-4 pt-3",
            config.axis === "lineage" ? "grid-cols-2" : "grid-cols-3",
          )}
        >
          {visibleItems(config.items).map((item) => renderItem(item))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto px-4 pt-4 [scrollbar-width:none]">
          <button
            type="button"
            aria-label="전체 초기화"
            disabled={applied.length === 0}
            onClick={() => onApply(EMPTY_FILTERS)}
            className="flex size-9 shrink-0 items-center justify-center rounded-card border border-gray-100 text-gray-500 disabled:text-gray-200"
          >
            <Trash2 className="size-4" />
          </button>
          {applied.map((item) => (
            <button
              key={`${item.axis.axis}:${item.slug}`}
              type="button"
              onClick={() => removeValue(item)}
              className="flex shrink-0 items-center gap-1 rounded-card border border-ramen bg-ramen-050 px-2.5 py-1.5 text-secondary font-semibold text-ramen"
            >
              {item.label}
              <X className="size-3.5" />
            </button>
          ))}
        </div>

        <div className="flex gap-2 p-4 pt-3">
          <DrawerClose
            className="shrink-0 rounded-card border border-gray-100 bg-white px-6 py-3 text-body font-semibold text-ink"
            onClick={onClose}
          >
            닫기
          </DrawerClose>
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
