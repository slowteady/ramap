"use client";

import { useRef, useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import type { RecordPhoto } from "@/features/records";
import { visitOrdinals } from "@/features/records";
import { cn } from "@/shared/lib/utils";
import { Drawer, DrawerContent, DrawerTitle } from "@/shared/ui/drawer";

/* 그리드 탭 = 기록 뷰어 (인스타 문법) — 사진 가로 스와이프 + 도트, 매장 이동은 한 단계 뒤로 */
export function RecordViewerSheet({
  shopName,
  shopId,
  photos,
  onClose,
}: {
  shopName: string;
  shopId: string;
  photos: RecordPhoto[];
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const ordinals = visitOrdinals(photos);
  const current = photos[index] ?? photos[0];

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <Drawer open onOpenChange={(next) => !next && onClose()}>
      <DrawerContent showClose>
        <div className="flex flex-col gap-3 overflow-y-auto px-4 pt-4 pb-8">
          <DrawerTitle className="text-title font-bold text-ink">
            {shopName}
          </DrawerTitle>

          <div className="relative">
            <div
              ref={scroller}
              onScroll={onScroll}
              className="flex snap-x snap-mandatory overflow-x-auto rounded-card [scrollbar-width:none]"
            >
              {photos.map((p) => (
                <div
                  key={p.id}
                  className="relative w-full shrink-0 snap-center"
                >
                  {p.url ? (
                    <img
                      src={p.url}
                      alt={p.comment ?? shopName}
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-square w-full bg-gray-050" />
                  )}
                  {p.status === "pending" && (
                    <span className="absolute top-2 left-2 rounded-chip bg-ink/60 px-1.5 py-0.5 text-caption font-semibold text-white">
                      검토 중
                    </span>
                  )}
                  {p.status === "rejected" && (
                    <span className="absolute top-2 left-2 rounded-chip bg-gray-500 px-1.5 py-0.5 text-caption font-semibold text-white">
                      반려됨
                    </span>
                  )}
                </div>
              ))}
            </div>
            {photos.length > 1 && (
              <div className="absolute right-0 -bottom-4 left-0 flex justify-center gap-1.5">
                {photos.map((p, i) => (
                  <span
                    key={p.id}
                    className={cn(
                      "size-1.5 rounded-pill",
                      i === index ? "bg-ramen" : "bg-gray-200",
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          <div
            className={cn("flex flex-col gap-1", photos.length > 1 && "pt-3")}
          >
            {current?.comment && (
              <p className="text-body text-ink">{current.comment}</p>
            )}
            {current && (
              <p className="text-caption text-gray-400">
                {ordinals.get(current.id) ?? 1}번째 완식 ·{" "}
                {dayjs(current.createdAt).format("YYYY.M.D")}
              </p>
            )}
          </div>

          <Link
            href={`/shop/${shopId}`}
            className="mt-1 flex h-12 items-center justify-center rounded-card-lg bg-gray-050 text-body font-semibold text-ink"
          >
            매장 보기
          </Link>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
