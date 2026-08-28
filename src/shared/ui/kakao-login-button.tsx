"use client";

import { signInWithKakao } from "@/shared/api/supabase";

export function KakaoLoginButton() {
  return (
    <button
      type="button"
      onClick={signInWithKakao}
      className="flex h-13 w-full items-center justify-center gap-2 rounded-card-lg bg-[#FEE500] text-body font-semibold text-[rgba(0,0,0,0.85)]"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="size-4.5 fill-[rgba(0,0,0,0.9)]"
      >
        <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.76 1.86 5.19 4.66 6.56-.15.55-.97 3.53-1 3.76 0 0-.02.17.09.24.11.07.24.02.24.02.32-.04 3.66-2.4 4.24-2.81.58.08 1.17.13 1.77.13 5.52 0 10-3.48 10-7.9S17.52 3 12 3z" />
      </svg>
      카카오로 계속하기
    </button>
  );
}
