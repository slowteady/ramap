"use client";

import { useState } from "react";
import { UserRound } from "lucide-react";
import { displayName, useAuth } from "@/features/auth";
import { LoginPromptSheet, useRecords } from "@/features/records";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/drawer";

export function AuthEntry() {
  const { enabled, user, ready, signOut } = useAuth();
  const { records, exportDownload, isSynced } = useRecords();
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
      {!user && <LoginPromptSheet open={open} onClose={() => setOpen(false)} />}
      {open && user && (
        <Drawer open onOpenChange={(next) => !next && setOpen(false)}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle className="text-title font-bold text-ink">
                {displayName(user)}
              </DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col gap-3 px-4 pb-6">
              <p className="text-body text-gray-500">
                {isSynced
                  ? `지금까지 완식 ${visitedCount}곳 — 기록은 계정에 자동 저장돼요.`
                  : `지금까지 완식 ${visitedCount}곳 — 서버 연결을 확인하는 중이에요.`}
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
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
