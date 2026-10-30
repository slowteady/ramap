"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { track } from "@/shared/lib/analytics";
import type { ReportRow } from "./report-payload";
import { submitReport } from "./report-sink";

export type ReportPhase = "editing" | "submitting" | "done";

/* build가 null을 돌려주면 사전 단계(사진 업로드 등) 실패 — 토스트는 호출부 책임 */
export function useReportSubmit() {
  const [phase, setPhase] = useState<ReportPhase>("editing");

  const submit = useCallback(async (build: () => Promise<ReportRow | null>) => {
    setPhase("submitting");
    const row = await build();
    if (!row) {
      setPhase("editing");
      return;
    }
    const result = await submitReport(row);
    track("report_submitted", { type: row.type, ok: result.ok });
    if (result.ok) {
      setPhase("done");
      return;
    }
    setPhase("editing");
    toast(
      result.reason === "unconfigured"
        ? "지금은 인스타그램 메시지로 보내 주세요. 입력한 내용은 그대로 있어요."
        : "보내지 못했어요. 인터넷 연결을 확인하고 다시 보내 주세요.",
    );
  }, []);

  return { phase, submit };
}
