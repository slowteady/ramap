"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  FileText,
  LogOut,
  Mail,
  ShieldCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth";
import { CONTACT_EMAIL } from "@/shared/config/legal";
import { deleteMyRecordPhotoFiles } from "@/features/records/index.client";
import { Drawer, DrawerContent, DrawerTitle } from "@/shared/ui/drawer";
import { MenuList, type MenuSection } from "@/shared/ui/menu-list";

const POLICY_SECTION: MenuSection = {
  label: "약관·정책",
  items: [
    { icon: FileText, label: "이용약관", href: "/terms" },
    { icon: ShieldCheck, label: "개인정보 처리방침", href: "/privacy" },
    {
      icon: Mail,
      label: "문의하기",
      href: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("[라맵] 문의")}`,
    },
  ],
};

const ACCOUNT_SECTION: MenuSection = {
  label: "계정",
  items: [
    { icon: LogOut, label: "로그아웃", action: "signout" },
    { icon: UserX, label: "회원탈퇴", action: "withdraw" },
  ],
};

export function SettingsPage() {
  const router = useRouter();
  const { user, signOut, deleteAccount } = useAuth();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col pb-10">
      <header className="flex items-center px-2 py-2">
        <Link
          href="/me"
          aria-label="마이로 돌아가기"
          className="flex size-10 items-center justify-center rounded-pill text-ink"
        >
          <ChevronLeft className="size-5" />
        </Link>
      </header>

      <h1 className="px-4 pt-1 pb-5 text-heading font-extrabold text-ink">
        설정
      </h1>

      <MenuList
        sections={user ? [POLICY_SECTION, ACCOUNT_SECTION] : [POLICY_SECTION]}
        onAction={(action) => {
          if (action === "withdraw") setWithdrawOpen(true);
          else {
            signOut();
            router.push("/");
          }
        }}
      />

      {withdrawOpen && (
        <Drawer open onOpenChange={(next) => !next && setWithdrawOpen(false)}>
          <DrawerContent>
            <div className="flex flex-col gap-4 px-4 pt-5 pb-8">
              <div className="flex flex-col gap-1">
                <DrawerTitle className="text-title font-bold text-ink">
                  탈퇴할까요?
                </DrawerTitle>
                <p className="text-secondary text-gray-500">
                  완식·저장 기록과 남긴 사진이 모두 지워지고 되돌릴 수 없어요
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWithdrawOpen(false)}
                  className="h-13 flex-1 rounded-card-lg bg-gray-050 text-body font-semibold text-ink"
                >
                  닫기
                </button>
                <button
                  type="button"
                  disabled={withdrawing}
                  onClick={async () => {
                    setWithdrawing(true);
                    const ok =
                      (await deleteMyRecordPhotoFiles()) &&
                      (await deleteAccount());
                    setWithdrawing(false);
                    if (!ok) {
                      toast(
                        "탈퇴하지 못했어요. 인터넷 연결을 확인하고 다시 눌러 주세요",
                      );
                      return;
                    }
                    setWithdrawOpen(false);
                    toast("탈퇴했어요");
                    router.push("/");
                  }}
                  className="h-13 flex-1 rounded-card-lg bg-ramen text-body font-bold text-white disabled:opacity-40"
                >
                  {withdrawing ? "탈퇴하는 중…" : "탈퇴하기"}
                </button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
