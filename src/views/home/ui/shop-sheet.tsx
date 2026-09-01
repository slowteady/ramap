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
import type { ShopRecord } from "@/entities/record";
import { RecordButtons, useRecords } from "@/features/records";
import { cn } from "@/shared/lib/utils";
import { Drawer, DrawerContent, DrawerTitle } from "@/shared/ui/drawer";
import type { LatLng } from "@/shared/map/types";
import { distanceMeters, formatDistance } from "../model/label-collision";

/* 접힘은 주소창 변동에 흔들리지 않게 고정 px, 나머지는 dvh 비율 (미결 5 — 실기기 확정 전) */
const SNAP_HIDDEN = "32px";
const SNAP_COLLAPSED = "72px";
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

function MetaRow({
  pin,
  center,
  full,
}: {
  pin: ShopPin;
  center: LatLng | null;
  full: boolean;
}) {
  const distance = center ? formatDistance(distanceMeters(pin, center)) : null;
  const hasHours =
    pin.status === "paused" ||
    (pin.status === "open" &&
      Boolean(full ? pin.hours || pin.breakTime || pin.closedDays : pin.hours));
  const parts = [
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
        breakTime={full ? pin.breakTime : null}
        closedDays={full ? pin.closedDays : null}
        className="truncate"
      />
    ),
  ].filter(Boolean);
  if (parts.length === 0) return null;

  return (
    <span className="flex min-w-0 items-baseline gap-1.5">
      {parts.map((part, i) => (
        <span key={i} className="contents">
          {i > 0 && <span className="text-secondary text-gray-300">·</span>}
          {part}
        </span>
      ))}
    </span>
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
  record: ShopRecord | null;
  onTap: (e: React.MouseEvent) => void;
}) {
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
          {record?.visited && (
            <span className="shrink-0 rounded-chip bg-ramen-050 px-1.5 py-0.5 text-caption font-semibold text-ramen">
              완식
            </span>
          )}
          {record?.saved && (
            <Bookmark className="size-3.5 shrink-0 fill-current text-gray-300" />
          )}
        </span>
        <MetaRow pin={pin} center={center} full={false} />
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
  center,
  onClose,
}: {
  shop: ShopPin;
  center: LatLng | null;
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
          className="-my-2 -ml-3.5 flex size-11 shrink-0 items-center justify-center rounded-pill text-ink"
        >
          <ChevronLeft className="size-5" />
        </button>
        <DrawerTitle className="min-w-0 flex-1 truncate text-title font-bold text-ink">
          <Link href={`/shop/${shop.id}`}>{shop.name}</Link>
        </DrawerTitle>
        <a
          href={`https://map.kakao.com/link/to/${encodeURIComponent(shop.name)},${shop.lat},${shop.lng}`}
          target="_blank"
          rel="noreferrer"
          className="-my-2 -mr-2 flex h-11 shrink-0 items-center px-2 text-secondary font-semibold text-ramen"
        >
          길찾기 ›
        </a>
      </div>
      <Link href={`/shop/${shop.id}`} className="flex min-w-0 flex-col gap-1.5">
        <MetaRow pin={shop} center={center} full />
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
      </Link>
      <div className="mt-auto flex items-center gap-2 pt-3">
        <RecordButtons shopId={shop.id} className="flex-1" />
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
        selectedShop
          ? [SNAP_COLLAPSED, SNAP_CARD]
          : [SNAP_HIDDEN, SNAP_COLLAPSED, SNAP_MID, SNAP_FULL]
      }
      activeSnapPoint={snap}
      setActiveSnapPoint={(next) => {
        setSnap(next);
        /* 카드를 끌어내리면 닫고 목록 접힘으로 — 카카오맵·캐치테이블 관례 */
        if (selectedShop && next === SNAP_COLLAPSED) onClose();
      }}
    >
      <DrawerContent
        overlay={false}
        className="h-dvh border-t-0 shadow-[0_-2px_12px_rgba(26,27,31,0.1)] data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:max-h-none"
      >
        {selectedShop ? (
          <div className="h-sheet-card px-4 pt-2 pb-4">
            <ShopCardBody
              shop={selectedShop}
              center={userLocation}
              onClose={onClose}
            />
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
                  record={get(pin.id)}
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
