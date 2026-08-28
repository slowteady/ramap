"use client";

import { KakaoLoginButton } from "@/shared/ui/kakao-login-button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/drawer";

export function LoginPromptSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <Drawer open onOpenChange={(next) => !next && onClose()}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-title font-bold text-ink">
            로그인하고 기록을 남겨보세요
          </DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-3 px-4 pb-6">
          <p className="text-body text-gray-500">
            완식한 라멘집이 나만의 지도에 쌓여요. 가고 싶은 집은 저장해
            두고 하나씩 정복해 보세요.
          </p>
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
