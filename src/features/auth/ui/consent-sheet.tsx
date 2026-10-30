"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerTitle } from "@/shared/ui/drawer";
import { cn } from "@/shared/lib/utils";
import { useProfile } from "../model/use-profile";

export function ConsentSheet() {
  const { needsConsent, agree } = useProfile();
  const [checked, setChecked] = useState(false);
  const [pending, setPending] = useState(false);

  if (!needsConsent) return null;

  const submit = async () => {
    setPending(true);
    const ok = await agree();
    setPending(false);
    if (!ok)
      toast("동의하지 못했어요. 인터넷 연결을 확인하고 다시 눌러 주세요");
  };

  return (
    <Drawer open dismissible={false}>
      <DrawerContent>
        <div className="flex flex-col gap-3 px-4 pt-4 pb-8">
          <DrawerTitle className="text-title font-bold text-ink">
            약관에 동의하면 바로 시작할 수 있어요
          </DrawerTitle>
          <label className="flex items-start gap-2.5 rounded-card bg-gray-050 px-3.5 py-3">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 size-4.5 accent-[var(--color-ramen)]"
            />
            <span className="text-body text-ink">
              <span>
                <Link
                  href="/terms"
                  target="_blank"
                  className="underline underline-offset-2"
                >
                  이용약관
                </Link>
                과{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="underline underline-offset-2"
                >
                  개인정보 처리방침
                </Link>
                에 동의해요 (필수)
              </span>
            </span>
          </label>
          <button
            type="button"
            disabled={!checked || pending}
            onClick={submit}
            className={cn(
              "h-13 w-full rounded-card-lg text-body font-bold text-white transition-colors duration-150",
              checked ? "bg-ramen" : "bg-gray-200",
            )}
          >
            동의하고 시작하기
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
