"use client";

import { useState } from "react";
import { InfoIcon } from "lucide-react";
import { Drawer, DrawerContent, DrawerTitle } from "@/shared/ui/drawer";

export function PickCriteriaButton({ checkedMonth }: { checkedMonth: string }) {
  const [open, setOpen] = useState(false);
  const lines = [
    "라멘을 즐겨 먹는 사람들의 평가와 가이드에서 여러 번 꼽힌 곳이에요",
    "돈을 받고 넣지 않아요",
    ...(checkedMonth ? [`${checkedMonth}에 확인했어요`] : []),
  ];

  return (
    <>
      <button
        type="button"
        aria-label="라맵 추천 기준 보기"
        onClick={() => setOpen(true)}
        className="-mr-2 flex size-11 items-center justify-center text-gray-400"
      >
        <InfoIcon className="size-5" />
      </button>
      {open && (
        <Drawer open onOpenChange={(next) => !next && setOpen(false)}>
          <DrawerContent showClose>
            <div className="flex flex-col gap-4 px-4 pt-8 pb-8">
              <DrawerTitle className="text-title font-bold text-ink">
                라맵 추천은 이렇게 골라요
              </DrawerTitle>
              <ul className="flex flex-col gap-2">
                {lines.map((line) => (
                  <li key={line} className="text-body text-ink">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
