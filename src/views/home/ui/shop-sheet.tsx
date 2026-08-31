"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bookmark, ChevronLeft } from "lucide-react";
import {
  AMENITIES,
  GenreChips,
  LINEAGES,
  OpenStatusBadge,
  type ShopPin,
} from "@/entities/shop";
import { RecordButtons, useRecords } from "@/features/records";
import { cn } from "@/shared/lib/utils";
import { Drawer, DrawerContent, DrawerTitle } from "@/shared/ui/drawer";
import type { LatLng } from "@/shared/map/types";
import { distanceMeters, formatDistance } from "../model/label-collision";

/* 접힘은 주소창 변동에 흔들리지 않게 고정 px, 나머지는 dvh 비율 (미결 5 — 실기기 확정 전) */
const SNAP_COLLAPSED = "96px";
const SNAP_CARD = "280px";
const SNAP_MID = 0.45;
const SNAP_FULL = 0.88;

type ShopSheetProps = {
  listPins: ShopPin[];
  userLocation: LatLng | null;
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

function ListRow({
  pin,
  center,
  record,
  onTap,
}: {
  pin: ShopPin;
  center: LatLng | null;
  record: "visited" | "want" | null;
  onTap: (e: React.MouseEvent) => void;
}) {
  const distance = center ? formatDistance(distanceMeters(pin, center)) : null;
  const hasHours = pin.status === "paused" || (pin.status === "open" && Boolean(pin.hours));
  const metaParts = [
    distance && (
      <span key="dist" className="shrink-0 text-secondary text-gray-500">
        {distance}
      </span>
    ),
    pin.areaLabel && (
      <span key="area" className="shrink-0 text-secondary text-gray-400">
        {pin.areaLabel}
      </span>
    ),
    hasHours && (
      <OpenStatusBadge
        key="hours"
        status={pin.status}
        hours={pin.hours}
        breakTime={null}
        closedDays={null}
        className="truncate"
      />
    ),
  ].filter(Boolean);

  return (
    <li className="border-b border-gray-050">
      <button
        type="button"
        onClick={onTap}
        className="flex w-full flex-col gap-1.5 py-3.5 text-left"
      >
        <span className="flex items-center gap-1.5">
          {pin.isNew && (
            <span className="text-caption font-extrabold text-ramen">NEW</span>
          )}
          <span className="truncate text-body font-bold text-ink">
            {pin.name}
          </span>
          {record === "visited" && (
            <span className="shrink-0 rounded-chip bg-ramen-050 px-1.5 py-0.5 text-caption font-semibold text-ramen">
              완식
            </span>
          )}
          {record === "want" && (
            <Bookmark className="size-3.5 shrink-0 fill-current text-gray-300" />
          )}
        </span>
        {metaParts.length > 0 && (
          <span className="flex min-w-0 items-baseline gap-1.5">
            {metaParts.map((part, i) => (
              <span key={i} className="contents">
                {i > 0 && <span className="text-secondary text-gray-300">·</span>}
                {part}
              </span>
            ))}
          </span>
        )}
        <GenreChips
          soups={pin.soups}
          forms={pin.forms}
          lineages={pin.lineages}
        />
      </button>
    </li>
  );
}

function ShopCardBody({
  shop,
  onClose,
}: {
  shop: ShopPin;
  onClose: () => void;
}) {
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
    <div className="flex h-full flex-col gap-1.5">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onClose}
          aria-label="목록으로"
          className="-ml-1.5 shrink-0 rounded-pill p-1 text-ink"
        >
          <ChevronLeft className="size-5" />
        </button>
        <DrawerTitle className="min-w-0 truncate text-title font-bold text-ink">
          {shop.name}
        </DrawerTitle>
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
      <GenreChips
        soups={shop.soups}
        forms={shop.forms}
        lineages={shop.lineages}
      />
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
      <div className="mt-auto flex items-center gap-2 pt-3">
        <RecordButtons shopId={shop.id} />
        <Link
          href={`/shop/${shop.id}`}
          className="flex flex-1 items-center justify-center rounded-pill bg-ink py-2 text-secondary font-bold text-white"
        >
          상세 보기
        </Link>
      </div>
    </div>
  );
}

export function ShopSheet({
  listPins,
  userLocation,
  selectedShop,
  onSelectPin,
  onClose,
}: ShopSheetProps) {
  const { get } = useRecords();
  const [snap, setSnap] = useState<number | string | null>(SNAP_COLLAPSED);
  const pointerDownY = useRef(0);

  useEffect(() => {
    setSnap((prev) => {
      if (selectedShop) return SNAP_CARD;
      return prev === SNAP_CARD ? SNAP_MID : prev;
    });
  }, [selectedShop]);

  return (
    <Drawer
      open
      modal={false}
      dismissible={false}
      snapPoints={
        selectedShop ? [SNAP_CARD] : [SNAP_COLLAPSED, SNAP_MID, SNAP_FULL]
      }
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <DrawerContent
        overlay={false}
        className="h-dvh border-t-0 shadow-[0_-2px_12px_rgba(26,27,31,0.1)] data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:max-h-none"
      >
        {selectedShop ? (
          <div className="h-sheet-card px-4 pt-2 pb-4">
            <ShopCardBody shop={selectedShop} onClose={onClose} />
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col px-4 pt-1">
            <span className="shrink-0 py-2 text-secondary font-bold text-ink">
              이 지역 매장 {listPins.length}곳
            </span>
            <ul
              onPointerDownCapture={(e) => {
                pointerDownY.current = e.clientY;
              }}
              className={cn(
                "min-h-0 flex-1",
                /* 제스처 충돌 회피 — 목록 스크롤은 풀 스냅에서만 */
                snap === SNAP_FULL
                  ? "overflow-y-auto overscroll-contain pb-10"
                  : "overflow-hidden",
              )}
            >
              {listPins.map((pin) => (
                <ListRow
                  key={pin.id}
                  pin={pin}
                  center={userLocation}
                  record={get(pin.id)?.status ?? null}
                  onTap={(e) => {
                    if (Math.abs(e.clientY - pointerDownY.current) > 8) return;
                    onSelectPin(pin);
                  }}
                />
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
