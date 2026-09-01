"use client";

import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  FileText,
  LogOut,
  PenLine,
  ShieldCheck,
  Sparkles,
  UserX,
  type LucideIcon,
} from "lucide-react";

type MenuItem = {
  icon: LucideIcon;
  label: string;
} & ({ href: string } | { action: "withdraw" | "signout" });

type MenuSection = { label: string; items: MenuItem[]; authOnly?: boolean };

const SECTIONS: MenuSection[] = [
  {
    label: "둘러보기",
    items: [
      { icon: PenLine, label: "라멘집 등록하기", href: "/?report=new" },
      { icon: BookOpen, label: "장르 가이드", href: "/guide" },
      { icon: Sparkles, label: "신규 오픈", href: "/new" },
    ],
  },
  {
    label: "약관 및 정책",
    items: [
      { icon: FileText, label: "이용약관", href: "/terms" },
      { icon: ShieldCheck, label: "개인정보 처리방침", href: "/privacy" },
    ],
  },
  {
    label: "계정",
    authOnly: true,
    items: [
      { icon: LogOut, label: "로그아웃", action: "signout" },
      { icon: UserX, label: "회원탈퇴", action: "withdraw" },
    ],
  },
];

export function MeMenu({
  authed,
  onWithdraw,
  onSignOut,
}: {
  authed: boolean;
  onWithdraw?: () => void;
  onSignOut?: () => void;
}) {
  const sections = SECTIONS.filter((s) => authed || !s.authOnly);
  const run = (action: "withdraw" | "signout") => {
    if (action === "withdraw") onWithdraw?.();
    else onSignOut?.();
  };

  return (
    <div className="flex flex-col gap-5">
      {sections.map((section) => (
        <section key={section.label} className="flex flex-col">
          <h2 className="px-4 pb-1 text-caption font-semibold text-gray-400">
            {section.label}
          </h2>
          {section.items.map((item) => {
            const inner = (
              <>
                <item.icon className="size-4.5 shrink-0 text-gray-500" />
                <span className="flex-1 text-body text-ink">{item.label}</span>
                <ChevronRight className="size-4 shrink-0 text-gray-300" />
              </>
            );
            return "href" in item ? (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3.5"
              >
                {inner}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                onClick={() => run(item.action)}
                className="flex items-center gap-3 px-4 py-3.5 text-left"
              >
                {inner}
              </button>
            );
          })}
        </section>
      ))}
    </div>
  );
}
