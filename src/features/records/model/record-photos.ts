import { getSupabase } from "@/shared/api/supabase";
import { toJpegBlob } from "@/shared/lib/image";
import {
  normalizeComment,
  type RecordPhoto,
  type RecordPhotoStatus,
} from "./record-photo-ops";

const BUCKET = "record-photos";
const SIGNED_URL_TTL_S = 3600;

type RecordPhotoRow = {
  id: number;
  user_id: string;
  shop_id: string;
  photo_path: string;
  comment: string | null;
  consent: boolean;
  status: string;
  reject_reason: string | null;
  created_at: string;
  entry_id: string | null;
};

function fromRow(row: RecordPhotoRow): RecordPhoto {
  return {
    id: row.id,
    userId: row.user_id,
    shopId: row.shop_id,
    photoPath: row.photo_path,
    comment: row.comment,
    consent: row.consent,
    status: row.status as RecordPhotoStatus,
    rejectReason: row.reject_reason,
    createdAt: row.created_at,
    entryId: row.entry_id,
    nickname: null,
    url: null,
  };
}

/* 다중 사진 = 한 제출 묶음(entry_id 공유), 한줄평은 첫 행에만 — 부분 실패는 전체 실패로 처리 */
export async function submitRecordPhotos(input: {
  shopId: string;
  files: File[];
  comment: string;
  consent: boolean;
}): Promise<boolean> {
  const client = getSupabase();
  if (!client || input.files.length === 0) return false;
  const { data } = await client.auth.getUser();
  const user = data.user;
  if (!user) return false;
  try {
    const entryId = crypto.randomUUID();
    const blobs = await Promise.all(input.files.map((f) => toJpegBlob(f)));
    const paths = blobs.map(() => `${user.id}/${crypto.randomUUID()}.jpg`);
    const uploads = await Promise.all(
      blobs.map((blob, i) =>
        client.storage
          .from(BUCKET)
          .upload(paths[i], blob, { contentType: "image/jpeg" }),
      ),
    );
    if (uploads.some((u) => u.error)) return false;
    const inserted = await client.from("record_photos").insert(
      paths.map((path, i) => ({
        user_id: user.id,
        shop_id: input.shopId,
        photo_path: path,
        comment: i === 0 ? normalizeComment(input.comment) : null,
        consent: input.consent,
        entry_id: entryId,
      })),
    );
    return !inserted.error;
  } catch {
    return false;
  }
}

async function attachMeta(
  client: NonNullable<ReturnType<typeof getSupabase>>,
  photos: RecordPhoto[],
): Promise<RecordPhoto[]> {
  if (photos.length === 0) return photos;

  const userIds = [...new Set(photos.map((p) => p.userId))];
  const profiles = await client
    .from("profiles")
    .select("user_id, nickname")
    .in("user_id", userIds);
  const nicknames = new Map(
    (profiles.data ?? []).map((p: { user_id: string; nickname: string }) => [
      p.user_id,
      p.nickname,
    ]),
  );

  const signed = await client.storage.from(BUCKET).createSignedUrls(
    photos.map((p) => p.photoPath),
    SIGNED_URL_TTL_S,
  );
  const urls = new Map(
    (signed.data ?? [])
      .filter((s) => s.signedUrl)
      .map((s) => [s.path, s.signedUrl]),
  );

  return photos.map((p) => ({
    ...p,
    nickname: nicknames.get(p.userId) ?? null,
    url: urls.get(p.photoPath) ?? null,
  }));
}

/* RLS가 노출 범위를 강제 — 타인 승인·동의분 + 본인 전부만 내려온다 */
export async function fetchShopRecordPhotos(
  shopId: string,
): Promise<RecordPhoto[] | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data, error } = await client
    .from("record_photos")
    .select(
      "id, user_id, shop_id, photo_path, comment, consent, status, reject_reason, created_at, entry_id",
    )
    .eq("shop_id", shopId)
    .order("created_at", { ascending: false });
  if (error || !data) return null;
  return attachMeta(client, (data as RecordPhotoRow[]).map(fromRow));
}

export async function fetchMyRecordPhotos(): Promise<RecordPhoto[] | null> {
  const client = getSupabase();
  if (!client) return null;
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await client
    .from("record_photos")
    .select(
      "id, user_id, shop_id, photo_path, comment, consent, status, reject_reason, created_at, entry_id",
    )
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });
  if (error || !data) return null;
  return attachMeta(client, (data as RecordPhotoRow[]).map(fromRow));
}

/* 회원탈퇴 선행 단계 — 스토리지 객체 소유자는 계정 삭제가 막히므로 본인 경로를 먼저 비운다 */
export async function deleteMyRecordPhotoFiles(): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;
  const { data } = await client.auth.getUser();
  const uid = data.user?.id;
  if (!uid) return false;
  const { data: files, error } = await client.storage.from(BUCKET).list(uid);
  if (error) return false;
  if (!files || files.length === 0) return true;
  const { error: removeError } = await client.storage
    .from(BUCKET)
    .remove(files.map((f) => `${uid}/${f.name}`));
  return !removeError;
}
