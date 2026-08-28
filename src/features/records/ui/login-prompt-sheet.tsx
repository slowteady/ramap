"use client";

import { KakaoLoginButton } from "@/shared/ui/kakao-login-button";
import { Drawer, DrawerContent, DrawerTitle } from "@/shared/ui/drawer";

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
        <div className="flex flex-col items-center gap-2 px-4 pt-8 pb-8 text-center">
          <span aria-hidden className="text-5xl">
            🍜
          </span>
          <DrawerTitle className="pt-3 text-heading font-extrabold text-ink">
            라맵과 함께할까요?
          </DrawerTitle>
          <p className="text-body text-gray-400">
            카카오 계정으로 3초 만에 시작해요
          </p>
          <div className="w-full pt-4">
            <KakaoLoginButton />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
