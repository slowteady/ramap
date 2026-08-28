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
  visit: {
    title: "로그인으로 완식한 라멘집을 모아보세요",
    body: "기록은 계정에 저장돼 기기를 바꿔도 이어져요.",
  },
  save: {
    title: "로그인으로 가고 싶은 라멘집을 모아보세요",
    body: "저장한 집은 언제든 다시 꺼내볼 수 있어요.",
  },
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
        <div className="flex flex-col gap-3 px-4 pb-6">
          <p className="text-body text-gray-500">{copy.body}</p>
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
