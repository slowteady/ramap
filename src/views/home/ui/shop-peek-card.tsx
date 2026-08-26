"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import {
  formBySlug,
  soupBySlug,
  LINEAGES,
  type ShopPin,
} from "@/entities/shop";
import { cn } from "@/shared/lib/utils";
import { Drawer, DrawerContent, DrawerTitle } from "@/shared/ui/drawer";

const PEEK = 0.24;
const HALF = 0.66;

type ShopPeekCardProps = {
  shop: ShopPin;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

function tagLabels(shop: ShopPin): string[] {
  return [
    ...shop.soups.map((s) => soupBySlug(s)?.label ?? s),
    ...shop.forms.map((f) => formBySlug(f)?.label ?? f),
    ...shop.lineages.map(
      (l) => LINEAGES.find((x) => x.slug === l)?.label ?? l,
    ),
  ];
}

export function ShopPeekCard({ shop, onClose, onPrev, onNext }: ShopPeekCardProps) {
  const [snap, setSnap] = useState<number | string | null>(PEEK);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    touchStart.current = { x: e.clientX, y: e.clientY };
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0) onNext();
    else onPrev();
  };

  return (
    <Drawer
      open
      modal={false}
      snapPoints={[PEEK, HALF]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      onOpenChange={(open) => !open && onClose()}
    >
      <DrawerContent
        overlay={false}
        className="h-dvh border-t-0 shadow-[0_-2px_12px_rgba(26,27,31,0.1)] data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:max-h-none"
      >
        <div
          className="flex h-full flex-col gap-1.5 px-4 pt-2 pb-6"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-col gap-0.5">
              <span
                className={cn(
                  "text-secondary font-semibold",
                  shop.status === "open" ? "text-open" : "text-gray-400",
                )}
              >
                {shop.status === "open" ? "영업중" : "휴업"}
              </span>
              <DrawerTitle className="truncate text-title font-bold text-ink">
                {shop.name}
              </DrawerTitle>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="shrink-0 rounded-pill p-1.5 text-gray-400"
            >
              <X className="size-5" />
            </button>
          </div>
          <span className="truncate text-secondary text-gray-500">
            {tagLabels(shop).join(" · ")}
          </span>
          {shop.areaLabel && (
            <span className="text-secondary text-gray-400">{shop.areaLabel}</span>
          )}
          {snap === HALF && shop.topMenu && (
            <div className="mt-3 flex items-center justify-between rounded-card bg-gray-050 px-3 py-2.5">
              <span className="text-body font-semibold text-ink">
                {shop.topMenu.name}
              </span>
              {shop.topMenu.price !== null && (
                <span className="text-secondary text-gray-500">
                  {shop.topMenu.price.toLocaleString()}원
                </span>
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
