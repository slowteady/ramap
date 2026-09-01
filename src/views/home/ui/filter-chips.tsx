"use client";

import { ChevronDown, RotateCcw } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useDragScroll } from "@/shared/lib/use-drag-scroll";
import { EMPTY_FILTERS, type MapFilters } from "../model/filter";
import {
  axisChipCount,
  FILTER_AXES,
  type FilterAxis,
} from "../model/filter-axes";

type FilterChipsProps = {
  filters: MapFilters;
  onOpenAxis: (axis: FilterAxis) => void;
  onApply: (next: MapFilters) => void;
  hideVisited: boolean | null;
  onToggleHideVisited: () => void;
};

export function FilterChips({
  filters,
  onOpenAxis,
  onApply,
  hideVisited,
  onToggleHideVisited,
}: FilterChipsProps) {
  const drag = useDragScroll();
  const activeCount = FILTER_AXES.reduce(
    (n, a) => n + axisChipCount(a, filters),
    0,
  );
  return (
    <div
      {...drag.handlers}
      className="mask-fade-r flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-2 pr-8 pl-4 select-none [scrollbar-width:none]"
    >
      {activeCount > 0 && (
        <button
          type="button"
          aria-label="필터 초기화"
          onClick={() => onApply(EMPTY_FILTERS)}
          className="flex size-8 shrink-0 items-center justify-center rounded-pill border border-gray-100 bg-white text-gray-500 shadow-[0_1px_4px_rgba(26,27,31,0.06)] duration-150 animate-in fade-in zoom-in-95"
        >
          <RotateCcw className="size-4" />
        </button>
      )}
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
      {hideVisited !== null && (
        <button
          type="button"
          onClick={onToggleHideVisited}
          className={cn(
            "shrink-0 rounded-pill border py-1.5 px-3.5 text-secondary font-semibold whitespace-nowrap transition-colors duration-150",
            hideVisited
              ? "border-ramen bg-ramen-050 text-ramen"
              : "border-gray-100 bg-white text-ink shadow-[0_1px_4px_rgba(26,27,31,0.06)]",
          )}
        >
          안 가본 집
        </button>
      )}
    </div>
  );
}
