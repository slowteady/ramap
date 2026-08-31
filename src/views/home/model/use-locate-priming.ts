"use client";

import { useEffect, useState } from "react";

const KEY = "ramap.locate-priming.v1";

export function useLocatePriming() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch {
      /* 스토리지 불가 환경에선 프라이밍 생략 */
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* 저장 실패 시 세션 내에서만 닫힘 */
    }
    setOpen(false);
  };

  return { open, dismiss };
}
