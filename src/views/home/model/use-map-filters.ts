"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
