export type ReportQuery = { kind: "new" } | { kind: "edit"; shopId: string };

export const REPORT_PARAM = "report";
export const SHOP_PARAM = "shop";

export function parseReportQuery(params: URLSearchParams): ReportQuery | null {
  const kind = params.get(REPORT_PARAM);
  if (kind === "new") return { kind: "new" };
  if (kind === "edit") {
    const shopId = params.get(SHOP_PARAM);
    return shopId ? { kind: "edit", shopId } : null;
  }
  return null;
}
