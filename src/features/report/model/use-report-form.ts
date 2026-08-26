"use client";

import { useState } from "react";
import { toast } from "sonner";
import { submitReport, type ReportType } from "./report-sink";

type Phase = "editing" | "submitting" | "done";

export function useReportForm() {
  const [type, setType] = useState<ReportType>("new");
  const [shopName, setShopName] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [phase, setPhase] = useState<Phase>("editing");

  const canSubmit =
    phase === "editing" && shopName.trim() !== "" && location.trim() !== "";

  const submit = async () => {
    if (!canSubmit) return;
    setPhase("submitting");
    const result = await submitReport({
      type,
      shopName: shopName.trim(),
      location: location.trim(),
      message: message.trim(),
    });
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
  };

  return {
    type,
    setType,
    shopName,
    setShopName,
    location,
    setLocation,
    message,
    setMessage,
    phase,
    canSubmit,
    submit,
  };
}
