import dayjs from "dayjs";
import { getSupabase } from "@/shared/api/supabase";

const RECORD_BUCKET = "record-photos";
const REPORT_BUCKET = "report-photos";
const SIGNED_URL_TTL_S = 3600;

export type PendingPhoto = {
  id: number;
  shopId: string;
  comment: string | null;
  nickname: string | null;
  createdAt: string;
  url: string | null;
};

export type AdminReport = {
  id: number;
  type: "new" | "edit" | "closed";
  shopName: string;
  location: string;
  message: string | null;
  details: unknown;
  photoUrls: string[];
  createdAt: string;
  status: "open" | "done";
  resolution: ReportResolution | null;
  note: string | null;
  resolvedAt: string | null;
};

export type ReportResolution = "applied" | "duplicate" | "rejected";

/* 어드민 조회는 RLS(is_admin)가 강제 — 비관리자는 빈 결과 */
export async function fetchPendingPhotos(): Promise<PendingPhoto[] | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data, error } = await client
    .from("record_photos")
    .select("id, shop_id, comment, created_at, photo_path, user_id")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error || !data) return null;
  const rows = data as {
    id: number;
    shop_id: string;
    comment: string | null;
    created_at: string;
    photo_path: string;
    user_id: string;
  }[];
  if (rows.length === 0) return [];

  const [signed, profiles] = await Promise.all([
    client.storage.from(RECORD_BUCKET).createSignedUrls(
      rows.map((r) => r.photo_path),
      SIGNED_URL_TTL_S,
    ),
    client
      .from("profiles")
      .select("user_id, nickname")
      .in("user_id", [...new Set(rows.map((r) => r.user_id))]),
  ]);
  const urls = new Map(
    (signed.data ?? [])
      .filter((s) => s.signedUrl)
      .map((s) => [s.path, s.signedUrl]),
  );
  const nicknames = new Map(
    (profiles.data ?? []).map((p: { user_id: string; nickname: string }) => [
      p.user_id,
      p.nickname,
    ]),
  );
  return rows.map((r) => ({
    id: r.id,
    shopId: r.shop_id,
    comment: r.comment,
    nickname: nicknames.get(r.user_id) ?? null,
    createdAt: r.created_at,
    url: urls.get(r.photo_path) ?? null,
  }));
}

export async function reviewPhoto(
  id: number,
  status: "approved" | "rejected",
  rejectReason?: string,
): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  const { error } = await client
    .from("record_photos")
    .update({ status, reject_reason: rejectReason ?? null })
    .eq("id", id);
  return !error;
}

export async function fetchReports(): Promise<AdminReport[] | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data, error } = await client
    .from("reports")
    .select(
      "id, type, shop_name, location, message, details, created_at, status, resolution, note, resolved_at",
    )
    .order("created_at", { ascending: false });
  if (error || !data) return null;
  const rows = data as {
    id: number;
    type: AdminReport["type"];
    shop_name: string;
    location: string;
    message: string | null;
    details: { photos?: string[] } | null;
    created_at: string;
    status: AdminReport["status"];
    resolution: ReportResolution | null;
    note: string | null;
    resolved_at: string | null;
  }[];
  const allPaths = rows.flatMap((r) => r.details?.photos ?? []);
  const urls = new Map<string, string>();
  if (allPaths.length > 0) {
    const signed = await client.storage
      .from(REPORT_BUCKET)
      .createSignedUrls(allPaths, SIGNED_URL_TTL_S);
    for (const s of signed.data ?? []) {
      if (s.signedUrl && s.path) urls.set(s.path, s.signedUrl);
    }
  }
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    shopName: r.shop_name,
    location: r.location,
    message: r.message,
    details: r.details,
    photoUrls: (r.details?.photos ?? [])
      .map((p) => urls.get(p))
      .filter((u): u is string => Boolean(u)),
    createdAt: r.created_at,
    status: r.status,
    resolution: r.resolution,
    note: r.note,
    resolvedAt: r.resolved_at,
  }));
}

export async function resolveReports(
  ids: number[],
  resolution: ReportResolution,
  note?: string,
): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  const { error } = await client
    .from("reports")
    .update({
      status: "done",
      resolution,
      note: note || null,
      resolved_at: dayjs().toISOString(),
    })
    .in("id", ids);
  return !error;
}

export async function reopenReports(ids: number[]): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  const { error } = await client
    .from("reports")
    .update({ status: "open", resolution: null, note: null, resolved_at: null })
    .in("id", ids);
  return !error;
}
