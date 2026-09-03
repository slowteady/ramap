"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth, useProfile } from "@/features/auth";
import { cn } from "@/shared/lib/utils";
import {
  fetchPendingPhotos,
  fetchReports,
  reviewPhoto,
  setReportStatus,
  type AdminReport,
  type PendingPhoto,
} from "../model/admin-api";

const TABS = [
  { key: "photos", label: "사진 검수" },
  { key: "reports", label: "제보" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function PhotoCard({
  photo,
  onDone,
}: {
  photo: PendingPhoto;
  onDone: () => void;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const act = async (status: "approved" | "rejected") => {
    const ok = await reviewPhoto(photo.id, status, reason || undefined);
    if (!ok) {
      toast("처리에 실패했어요");
      return;
    }
    onDone();
  };

  return (
    <li className="flex flex-col gap-2 border-b border-gray-050 py-4">
      {photo.url ? (
        <img
          src={photo.url}
          alt=""
          loading="lazy"
          className="h-56 w-full rounded-card object-cover"
        />
      ) : (
        <div className="h-56 w-full rounded-card bg-gray-050" />
      )}
      <div className="flex items-baseline gap-2">
        <Link
          href={`/shop/${photo.shopId}`}
          className="text-body font-bold text-ink underline underline-offset-2"
        >
          {photo.shopId}
        </Link>
        <span className="text-caption text-gray-400">
          {photo.nickname} · {dayjs(photo.createdAt).format("M.D HH:mm")}
        </span>
      </div>
      {photo.comment && (
        <p className="text-secondary text-ink">{photo.comment}</p>
      )}
      {rejecting ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="반려 사유"
            className="h-11 flex-1 rounded-card border border-gray-100 px-3 text-body"
          />
          <button
            type="button"
            onClick={() => act("rejected")}
            className="h-11 rounded-card-lg bg-gray-500 px-4 text-body font-bold text-white"
          >
            반려 확정
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRejecting(true)}
            className="h-11 flex-1 rounded-card-lg bg-gray-050 text-body font-semibold text-gray-500"
          >
            반려
          </button>
          <button
            type="button"
            onClick={() => act("approved")}
            className="h-11 flex-1 rounded-card-lg bg-ramen text-body font-bold text-white"
          >
            승인
          </button>
        </div>
      )}
    </li>
  );
}

function ReportCard({
  report,
  onToggle,
}: {
  report: AdminReport;
  onToggle: () => void;
}) {
  const typeLabel =
    report.type === "new"
      ? "신규 등록"
      : report.type === "edit"
        ? "정보 수정"
        : "폐업";
  return (
    <li
      className={cn(
        "flex flex-col gap-1.5 border-b border-gray-050 py-4",
        report.status === "done" && "opacity-45",
      )}
    >
      <div className="flex items-baseline gap-2">
        <span className="rounded-chip bg-ramen-050 px-1.5 py-0.5 text-caption font-semibold text-ramen">
          {typeLabel}
        </span>
        <span className="text-body font-bold text-ink">{report.shopName}</span>
        <span className="text-caption text-gray-400">{report.location}</span>
        <span className="ml-auto text-caption text-gray-400">
          {dayjs(report.createdAt).format("M.D")}
        </span>
      </div>
      {report.message && (
        <p className="text-secondary text-ink">{report.message}</p>
      )}
      {report.photoUrls.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto">
          {report.photoUrls.map((url) => (
            <img
              key={url}
              src={url}
              alt=""
              loading="lazy"
              className="size-20 shrink-0 rounded-card object-cover"
            />
          ))}
        </div>
      )}
      <details className="text-caption text-gray-400">
        <summary>상세 페이로드</summary>
        <pre className="overflow-x-auto rounded-card bg-gray-050 p-2 text-caption">
          {JSON.stringify(report.details, null, 1)}
        </pre>
      </details>
      <button
        type="button"
        onClick={async () => {
          const next = report.status === "open" ? "done" : "open";
          if (await setReportStatus(report.id, next)) onToggle();
          else toast("처리에 실패했어요");
        }}
        className={cn(
          "h-10 self-start rounded-pill px-4 text-secondary font-semibold",
          report.status === "open"
            ? "bg-ink text-white"
            : "bg-gray-050 text-gray-500",
        )}
      >
        {report.status === "open" ? "처리 완료로" : "다시 열기"}
      </button>
    </li>
  );
}

function AdminBody() {
  const { ready } = useAuth();
  const { isAdmin, profileLoaded } = useProfile();
  const [tab, setTab] = useState<TabKey>("photos");
  const [photos, setPhotos] = useState<PendingPhoto[] | null>(null);
  const [reports, setReports] = useState<AdminReport[] | null>(null);

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

  const openReports = (reports ?? []).filter((r) => r.status === "open");

  return (
    <div className="flex min-h-dvh flex-col pb-10">
      <header className="flex items-center px-2 py-2">
        <Link
          href="/me"
          aria-label="마이로 돌아가기"
          className="flex size-10 items-center justify-center rounded-pill text-ink"
        >
          <ChevronLeft className="size-5" />
        </Link>
      </header>
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
            {t.key === "reports" && openReports.length > 0 && (
              <span className="pl-1 text-ramen">{openReports.length}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "photos" ? (
        <ul className="flex flex-col px-4">
          {(photos ?? []).map((p) => (
            <PhotoCard key={p.id} photo={p} onDone={() => void load()} />
          ))}
          {photos?.length === 0 && (
            <p className="py-16 text-center text-secondary text-gray-400">
              검수할 사진이 없어요
            </p>
          )}
        </ul>
      ) : (
        <ul className="flex flex-col px-4">
          {(reports ?? []).map((r) => (
            <ReportCard key={r.id} report={r} onToggle={() => void load()} />
          ))}
          {reports?.length === 0 && (
            <p className="py-16 text-center text-secondary text-gray-400">
              접수된 제보가 없어요
            </p>
          )}
        </ul>
      )}
    </div>
  );
}

export function AdminPage() {
  return (
    <Suspense>
      <AdminBody />
    </Suspense>
  );
}
