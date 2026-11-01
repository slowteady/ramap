"use client";

import { useEffect, useState } from "react";
import { track } from "@/shared/lib/analytics";
import { fetchMyReports } from "./my-reports-api";
import type { MyReport } from "./my-reports";
import { countNewResults } from "./report-result";

export function useMyReports(enabled: boolean, seenAt: string | null) {
  const [reports, setReports] = useState<MyReport[] | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    void fetchMyReports().then((rows) => {
      if (cancelled) return;
      const list = rows ?? [];
      setReports(list);
      track("my_reports_viewed", {
        count: list.length,
        new_results: countNewResults(list, seenAt),
      });
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, seenAt]);

  return { reports, loaded: reports !== null };
}
