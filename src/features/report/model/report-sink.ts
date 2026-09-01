import { getSupabase } from "@/shared/api/supabase";
import type { ReportRow } from "./report-payload";

export type ReportResult =
  { ok: true } | { ok: false; reason: "unconfigured" | "network" };

export async function submitReport(row: ReportRow): Promise<ReportResult> {
  const client = getSupabase();
  if (!client) return { ok: false, reason: "unconfigured" };
  try {
    const { error } = await client.from("reports").insert(row);
    return error ? { ok: false, reason: "network" } : { ok: true };
  } catch {
    return { ok: false, reason: "network" };
  }
}
