import dayjs from "dayjs";
import type { MyReport } from "./my-reports";

export type ReportResultView = {
  label: "검토 중" | "반영됨" | "이미 있는 정보" | "반영 안 됨";
  message: string | null;
  shopHref: string | null;
};

const REJECT_MESSAGES: Record<string, string> = {
  "확인 불가": "보내 준 정보로는 확인하지 못했어요",
  "라멘집 아님": "라멘을 내는 곳이 아니라서 지도에 올리지 않았어요",
  "정보 불일치": "확인한 정보와 달라서 반영하지 않았어요",
};

export function reportResult(report: MyReport): ReportResultView {
  if (report.status === "open" || report.resolution === null)
    return { label: "검토 중", message: null, shopHref: null };
  if (report.resolution === "applied")
    return {
      label: "반영됨",
      message: "지도에 반영했어요",
      shopHref:
        report.type === "edit" && report.shopId
          ? `/shop/${report.shopId}`
          : null,
    };
  if (report.resolution === "duplicate")
    return {
      label: "이미 있는 정보",
      message: "이미 라맵에 있는 정보예요",
      shopHref: null,
    };
  return {
    label: "반영 안 됨",
    message:
      (report.rejectReason && REJECT_MESSAGES[report.rejectReason]) ?? null,
    shopHref: null,
  };
}

export function countNewResults(
  reports: MyReport[],
  seenAt: string | null,
): number {
  return reports.filter(
    (r) =>
      r.status === "done" &&
      r.resolvedAt !== null &&
      (seenAt === null || dayjs(r.resolvedAt).isAfter(seenAt)),
  ).length;
}
