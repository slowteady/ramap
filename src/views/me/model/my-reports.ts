export type MyReport = {
  id: number;
  type: "new" | "edit";
  shopName: string;
  shopId: string | null;
  createdAt: string;
  status: "open" | "done";
  resolution: "applied" | "duplicate" | "rejected" | null;
  rejectReason: string | null;
  resolvedAt: string | null;
};

const RESOLUTIONS = ["applied", "duplicate", "rejected"] as const;

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function parseRow(raw: unknown): MyReport | null {
  if (!raw || typeof raw !== "object") return null;
  const r: Record<string, unknown> = { ...raw };
  if (typeof r.id !== "number") return null;
  if (r.type !== "new" && r.type !== "edit") return null;
  if (typeof r.shop_name !== "string" || typeof r.created_at !== "string")
    return null;
  if (r.status !== "open" && r.status !== "done") return null;
  const resolution = RESOLUTIONS.find((v) => v === r.resolution) ?? null;
  return {
    id: r.id,
    type: r.type,
    shopName: r.shop_name,
    shopId: stringOrNull(r.shop_id),
    createdAt: r.created_at,
    status: r.status,
    resolution,
    rejectReason: stringOrNull(r.reject_reason),
    resolvedAt: stringOrNull(r.resolved_at),
  };
}

export function parseMyReports(data: unknown): MyReport[] {
  if (!Array.isArray(data)) return [];
  return data.flatMap((row) => parseRow(row) ?? []);
}
