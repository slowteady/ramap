"use client";

import { useState } from "react";
import { Drawer } from "vaul";

const SNAP_PEEK = 0.22;
const SNAP_HALF = 0.66;

export default function SheetDemo() {
  const [snap, setSnap] = useState<number | string | null>(SNAP_PEEK);

  return (
    <main className="h-dvh bg-gray-100">
      <div className="p-6 text-secondary text-gray-400">
        지도 영역 가정 — 시트가 peek/half 두 스냅으로 동작해야 함
      </div>
      <Drawer.Root
        open
        modal={false}
        dismissible={false}
        snapPoints={[SNAP_PEEK, SNAP_HALF]}
        activeSnapPoint={snap}
        setActiveSnapPoint={setSnap}
      >
        <Drawer.Portal>
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-10 flex h-full max-h-[97%] flex-col rounded-t-[16px] border-t border-gray-150 bg-white shadow-[0_-4px_16px_rgba(26,27,31,0.10)]">
            <div className="mx-auto mt-2 h-1 w-9 rounded-full bg-gray-150" />
            <div className="flex flex-col gap-2 p-5">
              <span className="text-caption font-bold text-open">
                영업중 <span className="font-medium text-gray-400">· 21:00까지</span>
              </span>
              <div className="flex items-center gap-2.5">
                <span className="text-title font-extrabold">킨카</span>
                <span className="text-secondary text-gray-400">니보시 · 시오 · 자가제면</span>
              </div>
              <span className="text-secondary text-gray-400">성수동 · 서울숲역 도보 6분</span>
              <p className="mt-3 text-body text-gray-500">
                (half에서 보이는 영역) 위로 끌면 half, 아래로 끌면 peek로 스냅됩니다. 현재 스냅:{" "}
                {String(snap)}
              </p>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </main>
  );
}
