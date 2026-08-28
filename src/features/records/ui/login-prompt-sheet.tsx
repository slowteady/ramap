"use client";

import { KakaoLoginButton } from "@/shared/ui/kakao-login-button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/drawer";
import type { RecordAction } from "../model/use-visit-action";

const COPY = {
  visit: { title: "로그인으로 완식한 라멘집을 모아보세요" },
  save: { title: "로그인으로 가고 싶은 라멘집을 모아보세요" },
} as const;

export function LoginPromptSheet({
  action,
  onClose,
}: {
  action: RecordAction | null;
  onClose: () => void;
}) {
  if (!action) return null;
  const copy = COPY[action];
  return (
    <Drawer open onOpenChange={(next) => !next && onClose()}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-title font-bold text-ink">
            {copy.title}
          </DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-3 px-4 pt-2 pb-6">
          <KakaoLoginButton />
          <button
            type="button"
            onClick={onClose}
            className="py-1 text-body text-gray-400"
          >
            다음에 할게요
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
