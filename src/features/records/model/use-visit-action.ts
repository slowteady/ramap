"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useRecords } from "./use-records";

const FIRST_TOAST_KEY = "ramap.first-visit-toast.v1";

export function useVisitAction(shopId: string) {
  const records = useRecords();
  const { markVisited, exportDownload, isSynced } = records;

  const visit = useCallback(() => {
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
  }, [shopId, markVisited, exportDownload, isSynced]);

  return { ...records, visit };
}
