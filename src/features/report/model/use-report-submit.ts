"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { ReportRow } from "./report-payload";
import { submitReport } from "./report-sink";

export type ReportPhase = "editing" | "submitting" | "done";

export function useReportSubmit() {
  const [phase, setPhase] = useState<ReportPhase>("editing");

  const submit = useCallback(async (row: ReportRow) => {
    setPhase("submitting");
    const result = await submitReport(row);
    if (result.ok) {
      setPhase("done");
      return;
    }
    setPhase("editing");
    toast(
      result.reason === "unconfigured"
        ? "제보 접수를 준비 중이에요. 인스타그램 DM으로 보내주세요."
        : "전송에 실패했어요. 잠시 후 다시 시도해 주세요.",
    );
  }, []);

  return { phase, submit };
}
