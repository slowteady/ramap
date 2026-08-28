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
    title: "완식 기록은 로그인이 필요해요",
    body: "로그인하면 완식한 라멘집이 내 지도에 차곡차곡 쌓여요.",
  },
  save: {
    title: "저장은 로그인이 필요해요",
    body: "로그인하면 가고 싶은 라멘집을 언제든 다시 꺼내볼 수 있어요.",
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
