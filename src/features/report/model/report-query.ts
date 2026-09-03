export type ReportQuery = { kind: "new" } | { kind: "edit"; shopId: string };

export const REPORT_PARAM = "report";
export const SHOP_PARAM = "shop";
export const PICK_PARAM = "pick";

/* 핀 피커 모드 — 신규 등록 시트가 열린 상태에서만 성립 */
export function isPickQuery(params: URLSearchParams): boolean {
  return (
    parseReportQuery(params)?.kind === "new" && params.get(PICK_PARAM) === "1"
  );
}

export function parseReportQuery(params: URLSearchParams): ReportQuery | null {
  const kind = params.get(REPORT_PARAM);
  if (kind === "new") return { kind: "new" };
  if (kind === "edit") {
    const shopId = params.get(SHOP_PARAM);
    return shopId ? { kind: "edit", shopId } : null;
  }
  return null;
}
