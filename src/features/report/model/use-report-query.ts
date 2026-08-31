"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { parseReportQuery, REPORT_PARAM, SHOP_PARAM } from "./report-query";

/* 열기는 push(뒤로가기 = 닫기), 닫기는 replace — use-selected-shop과 같은 규약 */
export function useReportQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = useMemo(
    () => parseReportQuery(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const openNew = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(REPORT_PARAM, "new");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  const openEdit = useCallback(
    (shopId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(REPORT_PARAM, "edit");
      params.set(SHOP_PARAM, shopId);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const close = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(REPORT_PARAM) === "edit") params.delete(SHOP_PARAM);
    params.delete(REPORT_PARAM);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [router, pathname, searchParams]);

  return { query, openNew, openEdit, close };
}
