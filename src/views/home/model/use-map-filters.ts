"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { track } from "@/shared/lib/analytics";
import {
  EMPTY_FILTERS,
  isActive,
  parseFilters,
  serializeFilters,
  type MapFilters,
} from "./filter";

export function useMapFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const apply = useCallback(
    (next: MapFilters) => {
      track("filter_changed", {
        soups: next.soups,
        forms: next.forms,
        lineages: next.lineages,
        new_only: next.newOnly,
        active_count:
          next.soups.length +
          next.forms.length +
          next.lineages.length +
          (next.newOnly ? 1 : 0),
      });
      const params = new URLSearchParams(serializeFilters(next));
      const shop = searchParams.get("shop");
      if (shop) params.set("shop", shop);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const clear = useCallback(() => apply(EMPTY_FILTERS), [apply]);

  return { filters, apply, clear, hasActiveFilters: isActive(filters) };
}
