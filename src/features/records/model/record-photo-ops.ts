export const COMMENT_MAX = 30;

export type RecordPhotoStatus = "pending" | "approved" | "rejected";

export type RecordPhoto = {
  id: number;
  userId: string;
  shopId: string;
  photoPath: string;
  comment: string | null;
  consent: boolean;
  status: RecordPhotoStatus;
  rejectReason: string | null;
  createdAt: string;
  nickname: string | null;
  url: string | null;
};

export function normalizeComment(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, COMMENT_MAX);
}

/* 항목별 완식 차수 — 같은 유저의 제출을 오래된 순으로 센다 (1번째 제출 = 1번째 완식) */
export function visitOrdinals(photos: RecordPhoto[]): Map<number, number> {
  const byUser = new Map<string, RecordPhoto[]>();
  for (const p of photos) {
    const list = byUser.get(p.userId) ?? [];
    list.push(p);
    byUser.set(p.userId, list);
  }
  const ordinals = new Map<number, number>();
  for (const list of byUser.values()) {
    [...list]
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .forEach((p, i) => ordinals.set(p.id, i + 1));
  }
  return ordinals;
}

/* 타인에게 보이는 것과 동일한 목록 + 본인 제출분(pending·rejected 포함)을 최신순으로 */
export function visibleLogEntries(
  photos: RecordPhoto[],
  myUserId: string | null,
): RecordPhoto[] {
  return photos
    .filter(
      (p) =>
        (p.status === "approved" && p.consent) ||
        (myUserId !== null && p.userId === myUserId),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
