"use client";

import { useState } from "react";
import { UserRound } from "lucide-react";
import { displayName, useAuth } from "@/features/auth";
import { useRecords } from "@/features/records";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/drawer";

export function AuthEntry() {
  const { enabled, user, ready, signInWithKakao, signOut } = useAuth();
  const { records, exportDownload } = useRecords();
  const [open, setOpen] = useState(false);

  if (!enabled) return null;
  const visitedCount = records.filter((r) => r.status === "visited").length;

  return (
    <>
      <button
        type="button"
        aria-label={user ? "내 기록" : "로그인"}
        disabled={!ready}
        onClick={() => ready && setOpen(true)}
        className="flex size-8 items-center justify-center rounded-pill bg-gray-050 text-ink disabled:opacity-40"
      >
        <UserRound className="size-4.5" />
      </button>
      {open && (
        <Drawer open onOpenChange={(next) => !next && setOpen(false)}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle className="text-title font-bold text-ink">
                {user ? displayName(user) : "기록을 계정에 백업하세요"}
              </DrawerTitle>
            </DrawerHeader>
            {user ? (
              <div className="flex flex-col gap-3 px-4 pb-6">
                <p className="text-body text-gray-500">
                  지금까지 완식 {visitedCount}곳 — 기록은 계정에 자동 저장돼요.
                </p>
                <button
                  type="button"
                  onClick={exportDownload}
                  className="w-full rounded-pill bg-gray-050 py-3 text-body font-bold text-ink"
                >
                  기록 JSON 내려받기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                  className="text-secondary text-gray-400 underline underline-offset-2"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 px-4 pb-6">
                <p className="text-body text-gray-500">
                  로그인하면 완식 기록이 계정에 저장되고 기기를 바꿔도
                  이어집니다. 지금 기기의 기록은 자동으로 합쳐져요.
                </p>
                {/* #FEE500은 카카오 브랜드 가이드 고정색 — 단일 유채색 원칙의 명시적 예외 */}
                <button
                  type="button"
                  onClick={signInWithKakao}
                  className="w-full rounded-pill bg-[#FEE500] py-3 text-body font-bold text-[#191919]"
                >
                  카카오로 시작하기
                </button>
              </div>
            )}
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
