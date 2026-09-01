"use client";

import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { Camera } from "lucide-react";
import {
  RecordLogSheet,
  useRecords,
  visibleLogEntries,
  visitOrdinals,
  type RecordPhoto,
} from "@/features/records";
import { fetchShopRecordPhotos } from "@/features/records/index.client";
import { getSupabase } from "@/shared/api/supabase";
import { useDragScroll } from "@/shared/lib/use-drag-scroll";

function EntryMeta({
  entry,
  ordinal,
}: {
  entry: RecordPhoto;
  ordinal: number;
}) {
  return (
    <span className="text-caption text-gray-400">
      {[
        entry.nickname,
        `${ordinal}번째 완식`,
        dayjs(entry.createdAt).format("YYYY.M.D"),
      ]
        .filter(Boolean)
        .join(" · ")}
    </span>
  );
}

export function RecordLogSection({ shopId }: { shopId: string }) {
  const { get, isAuthed } = useRecords();
  const [photos, setPhotos] = useState<RecordPhoto[] | null>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { handlers } = useDragScroll();

  const load = useCallback(async () => {
    const client = getSupabase();
    if (!client) return;
    const [{ data }, fetched] = await Promise.all([
      client.auth.getUser(),
      fetchShopRecordPhotos(shopId),
    ]);
    setMyUserId(data.user?.id ?? null);
    if (fetched) setPhotos(fetched);
  }, [shopId]);

  useEffect(() => {
    void load();
  }, [load]);

  const entries = visibleLogEntries(photos ?? [], myUserId);
  const ordinals = visitOrdinals(photos ?? []);
  const visited = get(shopId)?.visited ?? false;

  if (entries.length === 0 && !visited) return null;

  return (
    <section className="flex flex-col gap-2 px-4 pt-7">
      <div className="flex items-baseline justify-between">
        <h2 className="text-title font-bold text-ink">완식 기록</h2>
        {isAuthed && visited && (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-1 text-secondary font-semibold text-ramen"
          >
            <Camera className="size-4" />
            남기기
          </button>
        )}
      </div>

      {entries.length > 0 ? (
        <ul
          {...handlers}
          className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1"
        >
          {entries.map((entry) => (
            <li key={entry.id} className="flex w-40 shrink-0 flex-col gap-1.5">
              <div className="relative">
                {entry.url ? (
                  <img
                    src={entry.url}
                    alt={entry.comment ?? "완식 사진"}
                    draggable={false}
                    className="aspect-square w-full rounded-card object-cover"
                  />
                ) : (
                  <div className="aspect-square w-full rounded-card bg-gray-050" />
                )}
                {entry.userId === myUserId && entry.status === "pending" && (
                  <span className="absolute top-2 left-2 rounded-chip bg-ink/60 px-1.5 py-0.5 text-caption font-semibold text-white">
                    검토 중
                  </span>
                )}
                {entry.userId === myUserId && entry.status === "rejected" && (
                  <span className="absolute top-2 left-2 rounded-chip bg-gray-500 px-1.5 py-0.5 text-caption font-semibold text-white">
                    반려됨
                  </span>
                )}
              </div>
              {entry.comment && (
                <p className="text-secondary text-ink">{entry.comment}</p>
              )}
              <EntryMeta entry={entry} ordinal={ordinals.get(entry.id) ?? 1} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-secondary text-gray-400">
          첫 완식 기록을 남겨보세요
        </p>
      )}

      <RecordLogSheet
        shopId={shopId}
        open={sheetOpen}
        revisit
        onClose={() => setSheetOpen(false)}
        onSubmitted={() => void load()}
      />
    </section>
  );
}
