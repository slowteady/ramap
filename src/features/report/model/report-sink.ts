import { getSupabase } from "@/shared/api/supabase";
import { withReporter, type ReportRow } from "./report-payload";

export type ReportResult =
  | { ok: true; loggedIn: boolean }
  | { ok: false; loggedIn: boolean; reason: "unconfigured" | "network" };

export async function submitReport(row: ReportRow): Promise<ReportResult> {
  const client = getSupabase();
  if (!client) return { ok: false, loggedIn: false, reason: "unconfigured" };
  let userId: string | null = null;
  try {
    const { data } = await client.auth.getSession();
    userId = data.session?.user.id ?? null;
    const { error } = await client
      .from("reports")
      .insert(withReporter(row, userId));
    return error
      ? { ok: false, loggedIn: userId !== null, reason: "network" }
      : { ok: true, loggedIn: userId !== null };
  } catch {
    return { ok: false, loggedIn: userId !== null, reason: "network" };
  }
}
