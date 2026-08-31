export type ReportType = "new" | "edit" | "closed";

export type ReportPayload = {
  type: ReportType;
  shopName: string;
  location: string;
  message: string;
};

export type ReportResult =
  { ok: true } | { ok: false; reason: "unconfigured" | "network" };

export async function submitReport(
  payload: ReportPayload,
): Promise<ReportResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { ok: false, reason: "unconfigured" };

  try {
    const res = await fetch(`${url}/rest/v1/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        type: payload.type,
        shop_name: payload.shopName,
        location: payload.location,
        message: payload.message || null,
      }),
    });
    return res.ok ? { ok: true } : { ok: false, reason: "network" };
  } catch {
    return { ok: false, reason: "network" };
  }
}
