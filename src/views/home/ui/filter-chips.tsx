"use client";

import { cn } from "@/shared/lib/utils";
import type { MapFilters } from "../model/filter";
import { axisChipLabel, FILTER_AXES, type FilterAxis } from "../model/filter-axes";

type FilterChipsProps = {
  filters: MapFilters;
  onOpenAxis: (axis: FilterAxis) => void;
};

export function FilterChips({ filters, onOpenAxis }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none]">
      {FILTER_AXES.map((axis) => {
        const active = filters[axis.filterKey].length > 0;
        return (
          <button
            key={axis.axis}
            type="button"
            onClick={() => onOpenAxis(axis.axis)}
            className={cn(
              "shrink-0 rounded-pill px-3.5 py-1.5 text-secondary font-semibold whitespace-nowrap",
              active
                ? "bg-ink text-white"
                : "border border-gray-100 bg-white text-ink shadow-[0_1px_4px_rgba(26,27,31,0.06)]",
            )}
          >
            {axisChipLabel(axis, filters)}
          </button>
        );
      })}
    </div>
  );
}
