"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { MapFilters } from "../model/filter";
import { axisChipCount, FILTER_AXES, type FilterAxis } from "../model/filter-axes";

type FilterChipsProps = {
  filters: MapFilters;
  onOpenAxis: (axis: FilterAxis) => void;
};

export function FilterChips({ filters, onOpenAxis }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none]">
      <button
        type="button"
        aria-label="전체 필터"
        onClick={() => onOpenAxis(FILTER_AXES[0].axis)}
        className="flex size-8 shrink-0 items-center justify-center rounded-pill border border-gray-100 bg-white text-ink shadow-[0_1px_4px_rgba(26,27,31,0.06)]"
      >
        <SlidersHorizontal className="size-4" />
      </button>
      {FILTER_AXES.map((axis) => {
        const count = axisChipCount(axis, filters);
        const active = count > 0;
        return (
          <button
            key={axis.axis}
            type="button"
            onClick={() => onOpenAxis(axis.axis)}
            className={cn(
              "flex shrink-0 items-center gap-0.5 rounded-pill border py-1.5 pr-2.5 pl-3.5 text-secondary font-semibold whitespace-nowrap",
              active
                ? "border-ramen bg-ramen-050 text-ramen"
                : "border-gray-100 bg-white text-ink shadow-[0_1px_4px_rgba(26,27,31,0.06)]",
            )}
          >
            {axis.title}
            {active && <span className="pl-0.5 font-bold">{count}</span>}
            <ChevronDown
              className={cn("size-4", active ? "text-ramen" : "text-gray-400")}
            />
          </button>
        );
      })}
    </div>
  );
}
