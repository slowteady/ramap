"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth, useProfile } from "@/features/auth";
import { cn } from "@/shared/lib/utils";
import { PageHeader } from "@/shared/ui/page-header";
import {
  fetchPendingPhotos,
  fetchReports,
  type AdminReport,
  type PendingPhoto,
} from "../model/admin-api";
import {
  groupReports,
  parseDetails,
  sortGroups,
  type AdminShop,
} from "../model/report-view";
import { PhotoCard } from "./photo-card";
import { ReportCard } from "./report-card";

const TABS = [
  { key: "photos", label: "사진 검수" },
  { key: "reports", label: "제보" },
] as const;

type TabKey = (typeof TABS)[number]["key"];
type ReportFilter = AdminReport["status"];

function AdminBody({ shops }: { shops: AdminShop[] }) {
  const { ready } = useAuth();
  const { isAdmin, profileLoaded } = useProfile();
  const [tab, setTab] = useState<TabKey>("photos");
  const [photos, setPhotos] = useState<PendingPhoto[] | null>(null);
  const [reports, setReports] = useState<AdminReport[] | null>(null);
  const [filter, setFilter] = useState<ReportFilter>("open");
  const shopById = useMemo(() => new Map(shops.map((s) => [s.id, s])), [shops]);

  const load = useCallback(async () => {
    const [p, r] = await Promise.all([fetchPendingPhotos(), fetchReports()]);
    setPhotos(p);
    setReports(r);
  }, []);

  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin, load]);

  if (!ready || !profileLoaded) return <div className="min-h-dvh" />;

  if (!isAdmin) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4">
        <p className="text-body font-bold text-ink">운영자만 볼 수 있어요</p>
        <Link
          href="/"
          className="rounded-pill bg-ink px-6 py-3 text-body font-bold text-white"
        >
          지도로 가기
        </Link>
      </div>
    );
  }

  const groups = groupReports(reports ?? []);
  const openCount = groups.filter((g) => g.primary.status === "open").length;
  const doneCount = groups.length - openCount;
  const visible = sortGroups(
    groups.filter((g) => g.primary.status === filter),
    filter,
  );

  return (
    <div className="flex min-h-dvh flex-col pb-10">
      <PageHeader />
      <h1 className="px-4 pt-1 text-heading font-extrabold text-ink">운영</h1>

      <div className="flex gap-5 border-b border-gray-100 px-4 pt-5">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "-mb-px border-b-2 pb-2.5 text-body",
              tab === t.key
                ? "border-ink font-bold text-ink"
                : "border-transparent text-gray-400",
            )}
          >
            {t.label}
            {t.key === "photos" && photos && photos.length > 0 && (
              <span className="pl-1 text-ramen">{photos.length}</span>
            )}
            {t.key === "reports" && openCount > 0 && (
              <span className="pl-1 text-ramen">{openCount}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "photos" ? (
        <ul className="flex flex-col px-4">
          {(photos ?? []).map((p) => (
            <PhotoCard
              key={p.id}
              photo={p}
              shopName={shopById.get(p.shopId)?.name}
              onChanged={() => void load()}
            />
          ))}
          {photos?.length === 0 && (
            <p className="py-16 text-center text-secondary text-gray-400">
              검수할 사진이 없어요
            </p>
          )}
        </ul>
      ) : (
        <>
          <div className="flex gap-2 px-4 pt-4">
            {(
              [
                { key: "open", label: `대기 ${openCount}` },
                { key: "done", label: `처리됨 ${doneCount}` },
              ] as const
            ).map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-pill border px-3.5 py-1.5 text-secondary font-semibold",
                  filter === f.key
                    ? "border-ramen bg-ramen-050 text-ramen"
                    : "border-gray-100 bg-white text-ink",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <ul className="flex flex-col px-4">
            {visible.map((g) => (
              <ReportCard
                key={g.primary.id}
                group={g}
                shop={shopById.get(
                  parseDetails(g.primary.details).shopId ?? "",
                )}
                onChanged={() => void load()}
              />
            ))}
            {reports && visible.length === 0 && (
              <p className="py-16 text-center text-secondary text-gray-400">
                {filter === "open"
                  ? "대기 중인 제보가 없어요"
                  : "처리한 제보가 없어요"}
              </p>
            )}
          </ul>
        </>
      )}
    </div>
  );
}

export function AdminPage({ shops }: { shops: AdminShop[] }) {
  return (
    <Suspense>
      <AdminBody shops={shops} />
    </Suspense>
  );
}
