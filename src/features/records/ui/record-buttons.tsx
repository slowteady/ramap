"use client";

import { Bookmark, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { useRecords } from "../model/use-records";

const FIRST_TOAST_KEY = "ramap.first-visit-toast.v1";

export function RecordButtons({ shopId }: { shopId: string }) {
  const { get, markVisited, markWant, remove, exportDownload, isSynced } =
    useRecords();
  const record = get(shopId);
  const visited = record?.status === "visited";
  const want = record?.status === "want";

  const handleVisited = () => {
    markVisited(shopId, new Date());
    if (isSynced) return;
    try {
      if (!localStorage.getItem(FIRST_TOAST_KEY)) {
        localStorage.setItem(FIRST_TOAST_KEY, "1");
        toast("기록은 이 기기에 저장돼요", {
          action: { label: "백업하기", onClick: exportDownload },
        });
      }
    } catch {
      /* 스토리지 불가 환경에선 토스트 생략 */
    }
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleVisited}
        className={cn(
          "flex items-center gap-1.5 rounded-pill px-3.5 py-2 text-secondary font-bold",
          visited ? "bg-ink text-white" : "bg-gray-050 text-ink",
        )}
      >
        <Check className="size-4" />
        {visited && record ? `완식 ${record.count}` : "완식"}
      </button>
      <button
        type="button"
        onClick={() => (want ? remove(shopId) : markWant(shopId))}
        disabled={visited}
        className={cn(
          "flex items-center gap-1.5 rounded-pill px-3.5 py-2 text-secondary font-bold",
          want ? "bg-ink text-white" : "bg-gray-050 text-ink",
          visited && "opacity-40",
        )}
      >
        <Bookmark className="size-4" />
        가고싶다
      </button>
    </div>
  );
}
