import { getSupabase } from "@/shared/api/supabase";
import { parseMyReports, type MyReport } from "./my-reports";

export async function fetchMyReports(): Promise<MyReport[] | null> {
  const client = getSupabase();
  if (!client) return null;
  try {
    const { data, error } = await client.rpc("my_reports");
    return error ? null : parseMyReports(data);
  } catch {
    return null;
  }
}
