import { getSupabase } from "@/shared/api/supabase";

export type ResultTimes = {
  reports: (string | null)[];
  photos: (string | null)[];
};

function fieldsOf(row: unknown): Record<string, unknown> {
  return row && typeof row === "object" ? { ...row } : {};
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export async function fetchResultTimes(
  userId: string,
): Promise<ResultTimes | null> {
  const client = getSupabase();
  if (!client) return null;
  try {
    const [reports, photos] = await Promise.all([
      client.rpc("my_reports"),
      client
        .from("record_photos")
        .select("reviewed_at")
        .eq("user_id", userId)
        .neq("status", "pending"),
    ]);
    if (reports.error || photos.error) return null;
    const reportRows: unknown[] = Array.isArray(reports.data)
      ? reports.data
      : [];
    const photoRows: unknown[] = Array.isArray(photos.data) ? photos.data : [];
    return {
      reports: reportRows
        .map(fieldsOf)
        .filter((r) => r.status === "done")
        .map((r) => stringOrNull(r.resolved_at)),
      photos: photoRows.map((r) => stringOrNull(fieldsOf(r).reviewed_at)),
    };
  } catch {
    return null;
  }
}
