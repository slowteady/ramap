"use client";

import { useEffect, useState } from "react";

const KEY = "ramap.onboarding.v1";

export function useOnboarding() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch {
      /* 스토리지 불가 환경에선 온보딩 생략 */
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
