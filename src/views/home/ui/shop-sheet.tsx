"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import {
  AMENITIES,
  GenreChips,
  LINEAGES,
  OpenStatusBadge,
  type ShopPin,
} from "@/entities/shop";
import { RecordButtons } from "@/features/records";
import { cn } from "@/shared/lib/utils";
import { Drawer, DrawerContent, DrawerTitle } from "@/shared/ui/drawer";

/* 접힘은 주소창 변동에 흔들리지 않게 고정 px, 나머지는 dvh 비율 (미결 5 — 실기기 확정 전) */
const SNAP_COLLAPSED = "96px";
const SNAP_MID = 0.45;
const SNAP_FULL = 0.88;

type ShopSheetProps = {
  listPins: ShopPin[];
  selectedShop: ShopPin | null;
  onSelectPin: (pin: ShopPin) => void;
  onClose: () => void;
};

function hasStatusText(pin: ShopPin): boolean {
  return (
    pin.status === "paused" ||
    (pin.status === "open" &&
      Boolean(pin.hours || pin.breakTime || pin.closedDays))
  );
}

function ListRow({ pin, onTap }: { pin: ShopPin; onTap: () => void }) {
  return (
    <li className="border-b border-gray-050">
      <button type="button" onClick={onTap} className="flex w-full flex-col gap-1.5 py-3.5 text-left">
        <span className="flex items-center gap-1.5">
          {pin.isNew && (
            <span className="text-caption font-extrabold text-ramen">NEW</span>
          )}
          <span className="truncate text-body font-bold text-ink">
            {pin.name}
          </span>
        </span>
        {(pin.areaLabel || hasStatusText(pin)) && (
          <span className="flex min-w-0 items-baseline gap-1.5">
            {pin.areaLabel && (
              <span className="shrink-0 text-secondary text-gray-400">
                {pin.areaLabel}
              </span>
            )}
            {pin.areaLabel && hasStatusText(pin) && (
              <span className="text-secondary text-gray-300">·</span>
            )}
            <OpenStatusBadge
              status={pin.status}
              hours={pin.hours}
              breakTime={pin.breakTime}
              closedDays={pin.closedDays}
              className="truncate"
            />
          </span>
        )}
        <GenreChips soups={pin.soups} forms={pin.forms} lineages={pin.lineages} />
      </button>
    </li>
  );
}

function ShopCardBody({ shop, onClose }: { shop: ShopPin; onClose: () => void }) {
  const amenityLabels = [
    ...shop.lineages.flatMap((l) => {
      const item = LINEAGES.find((x) => x.slug === l);
      return item?.kind === "trait" ? [item.label] : [];
    }),
    ...shop.amenities.flatMap((a) => {
      const label = AMENITIES.find((x) => x.slug === a)?.label;
      return label ? [label] : [];
    }),
  ];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start justify-between gap-2">
        <DrawerTitle className="min-w-0 truncate text-title font-bold text-ink">
          {shop.name}
        </DrawerTitle>
        <button
          type="button"
          onClick={onClose}
          aria-label="목록으로"
          className="shrink-0 rounded-pill p-1.5 text-gray-400"
        >
          <X className="size-5" />
        </button>
      </div>
      {(shop.areaLabel || hasStatusText(shop)) && (
        <span className="flex min-w-0 items-baseline gap-1.5">
          {shop.areaLabel && (
            <span className="shrink-0 text-secondary text-gray-400">
              {shop.areaLabel}
            </span>
          )}
          {shop.areaLabel && hasStatusText(shop) && (
            <span className="text-secondary text-gray-300">·</span>
          )}
          <OpenStatusBadge
            status={shop.status}
            hours={shop.hours}
            breakTime={shop.breakTime}
            closedDays={shop.closedDays}
            className="truncate"
          />
        </span>
      )}
      <GenreChips soups={shop.soups} forms={shop.forms} lineages={shop.lineages} />
      {amenityLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {amenityLabels.map((label) => (
            <span
              key={label}
              className="rounded-chip bg-gray-100 px-1.5 py-0.5 text-caption font-semibold text-gray-500"
            >
              {label}
            </span>
          ))}
        </div>
      )}
      <div className="pt-2">
        <RecordButtons shopId={shop.id} />
      </div>
      {shop.topMenu && (
        <div className="mt-2 flex items-baseline justify-between rounded-card bg-gray-050 px-3 py-2.5">
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
      <Link
        href={`/shop/${shop.id}`}
        className="mt-3 flex w-full items-center justify-center rounded-pill bg-ink py-3 text-body font-bold text-white"
      >
        상세 보기
      </Link>
    </div>
  );
}

export function ShopSheet({ listPins, selectedShop, onSelectPin, onClose }: ShopSheetProps) {
  const [snap, setSnap] = useState<number | string | null>(SNAP_COLLAPSED);

  /* 매장 선택 시 접힘 상태면 카드가 보이게 중간 스냅으로 */
  useEffect(() => {
    if (selectedShop) setSnap((prev) => (prev === SNAP_COLLAPSED ? SNAP_MID : prev));
  }, [selectedShop]);

  return (
    <Drawer
      open
      modal={false}
      dismissible={false}
      snapPoints={[SNAP_COLLAPSED, SNAP_MID, SNAP_FULL]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <DrawerContent
        overlay={false}
        className="h-dvh border-t-0 shadow-[0_-2px_12px_rgba(26,27,31,0.1)] data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:max-h-none"
      >
        {selectedShop ? (
          <div className="px-4 pt-2 pb-6">
            <ShopCardBody shop={selectedShop} onClose={onClose} />
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col px-4 pt-1">
            <span className="shrink-0 py-2 text-secondary font-bold text-ink">
              이 지역 매장 {listPins.length}곳
            </span>
            <ul
              className={cn(
                "min-h-0 flex-1",
                /* 제스처 충돌 회피 — 목록 스크롤은 풀 스냅에서만 */
                snap === SNAP_FULL ? "overflow-y-auto overscroll-contain pb-10" : "overflow-hidden",
              )}
            >
              {listPins.map((pin) => (
                <ListRow key={pin.id} pin={pin} onTap={() => onSelectPin(pin)} />
              ))}
              {listPins.length === 0 && (
                <li className="py-6 text-secondary text-gray-400">
                  이 지역에 조건에 맞는 매장이 없어요. 지도를 움직이거나 필터를
                  풀어보세요.
                </li>
              )}
            </ul>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
