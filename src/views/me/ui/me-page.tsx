"use client";

import { Suspense, useEffect, useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Layers,
  Settings,
  Soup,
} from "lucide-react";
import { GenreChips, type Shop } from "@/entities/shop";
import { useAuth, useProfile } from "@/features/auth";
import {
  LoginPromptSheet,
  useRecords,
  type RecordPhoto,
} from "@/features/records";
import { fetchMyRecordPhotos } from "@/features/records/index.client";
import { cn } from "@/shared/lib/utils";
import { hasMore, nextCount, PAGE_SIZE, visibleSlice } from "../model/paging";
import { recordTime, sortRecordsByRecent } from "../model/sort-records";
import { RecordViewerSheet } from "./record-viewer-sheet";

const TABS = [
  { key: "visited", label: "완식" },
  { key: "saved", label: "저장" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function MeBody({ shops }: { shops: Shop[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const { user, ready } = useAuth();
  const { displayName, profileLoaded } = useProfile();
  const { records } = useRecords();
  const [loginOpen, setLoginOpen] = useState(false);
  const [photosByShop, setPhotosByShop] = useState<Map<string, RecordPhoto[]>>(
    new Map(),
  );
  const [viewerShopId, setViewerShopId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    void fetchMyRecordPhotos().then((photos) => {
      if (!photos) return;
      const byShop = new Map<string, RecordPhoto[]>();
      for (const p of photos) {
        const list = byShop.get(p.shopId) ?? [];
        list.push(p);
        byShop.set(p.shopId, list);
      }
      setPhotosByShop(byShop);
    });
  }, [user]);

  const tab: TabKey = params.get("tab") === "saved" ? "saved" : "visited";
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => setVisibleCount(PAGE_SIZE), [tab]);
  const shopById = new Map(shops.map((s) => [s.id, s]));
  const visitedCount = records.filter((r) => r.visited).length;
  const savedCount = records.filter((r) => r.saved).length;
  const listed = sortRecordsByRecent(
    records.filter(
      (r) =>
        (tab === "visited" ? r.visited : r.saved) && shopById.has(r.shopId),
    ),
  );

  if (!ready) return <div className="min-h-dvh" />;

  if (!user) {
    return (
      <div className="flex min-h-dvh flex-col pb-10">
        <header className="flex items-center justify-between px-2 py-2">
          <Link
            href="/"
            aria-label="지도로 돌아가기"
            className="flex size-10 items-center justify-center rounded-pill text-ink"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <Link
            href="/settings"
            aria-label="설정"
            className="flex size-10 items-center justify-center rounded-pill text-ink"
          >
            <Settings className="size-5" />
          </Link>
        </header>
        <div className="flex flex-col gap-1 px-4 pt-1">
          <button
            type="button"
            onClick={() => setLoginOpen(true)}
            className="flex items-center gap-0.5 self-start text-heading font-extrabold text-ink"
          >
            로그인하기
            <ChevronRight className="size-5 text-gray-400" />
          </button>
          <p className="text-secondary text-gray-500">
            로그인하면 완식·저장 기록이 여기에 모여요
          </p>
        </div>
        <LoginPromptSheet
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col pb-10">
      <header className="flex items-center justify-between px-2 py-2">
        <Link
          href="/"
          aria-label="지도로 돌아가기"
          className="flex size-10 items-center justify-center rounded-pill text-ink"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <Link
          href="/settings"
          aria-label="설정"
          className="flex size-10 items-center justify-center rounded-pill text-ink"
        >
          <Settings className="size-5" />
        </Link>
      </header>

      <div className="flex flex-col gap-1 px-4 pt-1">
        {profileLoaded ? (
          <h1 className="text-heading font-extrabold text-ink">
            {displayName}님
          </h1>
        ) : (
          <div className="h-7 w-36 animate-pulse rounded-card bg-gray-100" />
        )}
        <div className="flex items-baseline justify-between">
          <p className="text-secondary text-gray-500">
            완식 {visitedCount} · 저장 {savedCount}
          </p>
          <Link
            href="/guide"
            className="flex items-center gap-1 text-secondary font-semibold text-gray-500"
          >
            <BookOpen className="size-4" />
            장르 가이드
          </Link>
        </div>
      </div>

      <div className="sticky top-0 z-10 flex gap-5 border-b border-gray-100 bg-white px-4 pt-5">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() =>
              router.replace(t.key === "visited" ? "/me" : "/me?tab=saved", {
                scroll: false,
              })
            }
            className={cn(
              "-mb-px border-b-2 pb-2.5 text-body",
              tab === t.key
                ? "border-ink font-bold text-ink"
                : "border-transparent text-gray-400",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {listed.length > 0 ? (
        tab === "visited" ? (
          /* 완식 = 인스타형 사진 그리드 — 사진 없는 기록은 아이콘 타일 (2026-09-03 PO) */
          <>
            <ul className="grid grid-cols-3 gap-0.5 pt-0.5">
              {visibleSlice(listed, visibleCount).map((record) => {
                const shop = shopById.get(record.shopId)!;
                const shopPhotos = photosByShop.get(shop.id) ?? [];
                const first = shopPhotos.find((p) => p.url);
                if (!first) {
                  return (
                    <li key={record.shopId}>
                      <Link
                        href={`/shop/${shop.id}`}
                        className="flex aspect-square flex-col items-center justify-center gap-1.5 bg-ramen-050 px-2"
                      >
                        <Soup className="size-6 text-ramen" />
                        <span className="line-clamp-1 text-caption font-semibold text-ink">
                          {shop.name}
                        </span>
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={record.shopId}>
                    <button
                      type="button"
                      aria-label={`${shop.name} 기록 보기`}
                      onClick={() => setViewerShopId(shop.id)}
                      className="relative block aspect-square w-full"
                    >
                      <img
                        src={first.url!}
                        alt={shop.name}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                      {shopPhotos.length > 1 && (
                        <Layers className="absolute top-1.5 right-1.5 size-4 text-white drop-shadow" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            {hasMore(visibleCount, listed.length) && (
              <div className="px-4 py-3">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((c) => nextCount(c, listed.length))
                  }
                  className="h-12 w-full rounded-card-lg bg-gray-050 text-body font-semibold text-ink"
                >
                  기록 더보기 ({listed.length - visibleCount})
                </button>
              </div>
            )}
          </>
        ) : (
          <ul className="px-4">
            {visibleSlice(listed, visibleCount).map((record) => {
              const shop = shopById.get(record.shopId)!;
              const at = recordTime(record);
              return (
                <li key={record.shopId} className="border-b border-gray-050">
                  <Link
                    href={`/shop/${shop.id}`}
                    className="flex w-full items-center gap-3 py-3.5"
                  >
                    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <span className="flex items-baseline gap-1.5">
                        <span className="truncate text-body font-bold text-ink">
                          {shop.name}
                        </span>
                        {shop.areaLabel && (
                          <span className="shrink-0 text-secondary text-gray-400">
                            {shop.areaLabel}
                          </span>
                        )}
                        {at && (
                          <span className="ml-auto shrink-0 text-caption text-gray-400">
                            {dayjs(at).format("YYYY.M.D")}
                          </span>
                        )}
                      </span>
                      <GenreChips
                        soups={shop.soups}
                        forms={shop.forms}
                        lineages={shop.lineages}
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
            {hasMore(visibleCount, listed.length) && (
              <li className="py-3">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((c) => nextCount(c, listed.length))
                  }
                  className="h-12 w-full rounded-card-lg bg-gray-050 text-body font-semibold text-ink"
                >
                  기록 더보기 ({listed.length - visibleCount})
                </button>
              </li>
            )}
          </ul>
        )
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-16">
          <p className="text-body font-bold text-ink">
            아직 {tab === "visited" ? "완식한" : "저장한"} 라멘집이 없어요
          </p>
          <p className="text-secondary text-gray-500">
            지도에서 {tab === "visited" ? "완식" : "저장"}을 찍으면 여기에
            모여요
          </p>
          <Link
            href="/"
            className="mt-3 rounded-pill bg-ink px-6 py-3 text-body font-bold text-white"
          >
            지도 보기
          </Link>
        </div>
      )}
      {viewerShopId && (
        <RecordViewerSheet
          shopId={viewerShopId}
          shopName={shopById.get(viewerShopId)?.name ?? ""}
          photos={photosByShop.get(viewerShopId) ?? []}
          onClose={() => setViewerShopId(null)}
        />
      )}
    </div>
  );
}

export function MePage({ shops }: { shops: Shop[] }) {
  return (
    <Suspense>
      <MeBody shops={shops} />
    </Suspense>
  );
}
