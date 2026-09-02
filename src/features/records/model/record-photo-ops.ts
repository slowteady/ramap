export const COMMENT_MAX = 30;
/* 제보 폼과 동일 상한 — 학습 일관성 */
export const RECORD_PHOTO_MAX = 5;

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
  /* 같은 제출(다중 사진)의 묶음 키 — 구 데이터는 null(행 단독 취급) */
  entryId: string | null;
  nickname: string | null;
  url: string | null;
};

function entryKey(p: RecordPhoto): string {
  return p.entryId ?? `row-${p.id}`;
}

export function normalizeComment(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, COMMENT_MAX);
}

/* 항목별 완식 차수 — 같은 유저의 제출 묶음을 오래된 순으로 센다 (다중 사진 1묶음 = 1완식) */
export function visitOrdinals(photos: RecordPhoto[]): Map<number, number> {
  const byUser = new Map<string, RecordPhoto[]>();
  for (const p of photos) {
    const list = byUser.get(p.userId) ?? [];
    list.push(p);
    byUser.set(p.userId, list);
  }
  const ordinals = new Map<number, number>();
  for (const list of byUser.values()) {
    const seen = new Map<string, number>();
    for (const p of [...list].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    )) {
      const key = entryKey(p);
      if (!seen.has(key)) seen.set(key, seen.size + 1);
      ordinals.set(p.id, seen.get(key)!);
    }
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
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id - b.id);
}

/* 표시용 — 같은 묶음의 첫 장에만 한줄평·메타를 붙인다 (묶음은 동일 createdAt이라 연속 배치됨) */
export function withEntryMeta(
  entries: RecordPhoto[],
): { photo: RecordPhoto; showMeta: boolean }[] {
  return entries.map((photo, i) => ({
    photo,
    showMeta: i === 0 || entryKey(entries[i - 1]) !== entryKey(photo),
  }));
}
