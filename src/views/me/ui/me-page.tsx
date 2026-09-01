"use client";

import { Suspense, useEffect, useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GenreChips, type Shop } from "@/entities/shop";
import { useAuth, useProfile } from "@/features/auth";
import { LoginPromptSheet, useRecords } from "@/features/records";
import { fetchMyRecordPhotos } from "@/features/records/index.client";
import { cn } from "@/shared/lib/utils";
import { recordTime, sortRecordsByRecent } from "../model/sort-records";
import { MeMenu } from "./me-menu";

const TABS = [
  { key: "visited", label: "완식" },
  { key: "saved", label: "저장" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function MeBody({ shops }: { shops: Shop[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const { user, ready, signOut } = useAuth();
  const { displayName, profileLoaded } = useProfile();
  const { records, exportDownload } = useRecords();
  const [loginOpen, setLoginOpen] = useState(false);
  const [thumbs, setThumbs] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (!user) return;
    void fetchMyRecordPhotos().then((photos) => {
      if (!photos) return;
      const byShop = new Map<string, string>();
      for (const p of photos) {
        if (p.url && !byShop.has(p.shopId)) byShop.set(p.shopId, p.url);
      }
      setThumbs(byShop);
    });
  }, [user]);

  const tab: TabKey = params.get("tab") === "saved" ? "saved" : "visited";
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
        <header className="flex items-center px-2 py-2">
          <Link
            href="/"
            aria-label="지도로 돌아가기"
            className="flex size-10 items-center justify-center rounded-pill text-ink"
          >
            <ChevronLeft className="size-5" />
          </Link>
        </header>
        <div className="flex flex-col gap-1 px-4 pt-1">
          <button
            type="button"
            onClick={() => setLoginOpen(true)}
            className="flex items-center gap-0.5 text-heading font-extrabold text-ink"
          >
            로그인하기
            <ChevronRight className="size-5 text-gray-400" />
          </button>
          <p className="text-secondary text-gray-500">
            로그인하면 완식·저장 기록이 여기에 모여요
          </p>
        </div>
        <div className="pt-8">
          <MeMenu authed={false} />
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
      <header className="flex items-center px-2 py-2">
        <Link
          href="/"
          aria-label="지도로 돌아가기"
          className="flex size-10 items-center justify-center rounded-pill text-ink"
        >
          <ChevronLeft className="size-5" />
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
        <p className="text-secondary text-gray-500">
          완식 {visitedCount} · 저장 {savedCount}
        </p>
      </div>

      <div className="flex gap-5 border-b border-gray-100 px-4 pt-5">
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
        <ul className="px-4">
          {listed.map((record) => {
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
                  {tab === "visited" && thumbs.has(shop.id) && (
                    <img
                      src={thumbs.get(shop.id)}
                      alt=""
                      className="size-14 shrink-0 rounded-card object-cover"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
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

      <div className="mt-auto pt-10">
        <MeMenu
          authed
          onExport={exportDownload}
          onSignOut={() => {
            signOut();
            router.push("/");
          }}
        />
      </div>
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
