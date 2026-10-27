"use client";

import { useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import {
  reopenReports,
  resolveReports,
  type AdminReport,
  type ReportResolution,
} from "../model/admin-api";
import {
  editRows,
  linkLabel,
  parseDetails,
  type AdminShop,
  type ReportGroup,
} from "../model/report-view";

const TYPE_LABELS: Record<AdminReport["type"], string> = {
  new: "신규",
  edit: "수정",
  closed: "폐업",
};

const RESOLUTION_LABELS: Record<ReportResolution, string> = {
  applied: "반영함",
  duplicate: "중복",
  rejected: "반려",
};

const chip =
  "inline-flex items-center gap-1 rounded-chip bg-gray-050 px-2 py-1 text-secondary text-gray-500";

function isUrl(raw: string): boolean {
  return /^https?:\/\//.test(raw);
}

export function ReportCard({
  group,
  shop,
  onChanged,
}: {
  group: ReportGroup;
  shop: AdminShop | undefined;
  onChanged: () => void;
}) {
  const { primary: r, duplicates } = group;
  const ids = [r.id, ...duplicates.map((d) => d.id)];
  const d = parseDetails(r.details);
  const rows = r.type === "new" ? [] : editRows(d, shop);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const reopen = async () => {
    if (await reopenReports(ids)) onChanged();
    else toast("처리에 실패했어요");
  };

  const resolve = async (resolution: ReportResolution, note?: string) => {
    if (!(await resolveReports(ids, resolution, note))) {
      toast("처리에 실패했어요");
      return;
    }
    onChanged();
    toast(`${RESOLUTION_LABELS[resolution]}으로 처리했어요`, {
      action: { label: "되돌리기", onClick: () => void reopen() },
    });
  };

  return (
    <li className="flex flex-col gap-3 border-b border-gray-100 py-5">
      <div className="flex items-start gap-2">
        <span
          className={cn(
            "mt-0.5 shrink-0 rounded-chip px-1.5 py-0.5 text-caption font-semibold whitespace-nowrap",
            r.type === "new"
              ? "bg-ramen-050 text-ramen"
              : "bg-gray-100 text-gray-500",
          )}
        >
          {TYPE_LABELS[r.type]}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-body font-bold text-ink wrap-anywhere">
            {r.shopName}
            {d.branch && !r.shopName.includes(d.branch) && (
              <span className="pl-1 font-normal text-gray-400">{d.branch}</span>
            )}
          </p>
          <p className="text-caption text-gray-400">
            {dayjs(r.createdAt).format("M.D HH:mm")} · #{r.id}
            {duplicates.length > 0 && ` · 같은 제보 ${duplicates.length}건 더`}
          </p>
        </div>
      </div>

      {r.type === "new" ? (
        <div className="flex flex-wrap gap-1.5">
          {d.links.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={chip}
            >
              {linkLabel(url)}
              <ExternalLink className="size-3" />
            </a>
          ))}
          {d.pin && (
            <a
              href={`https://map.kakao.com/link/map/${encodeURIComponent(r.shopName)},${d.pin.lat},${d.pin.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className={chip}
            >
              핀 위치
              <ExternalLink className="size-3" />
            </a>
          )}
          {r.location && !isUrl(r.location) && (
            <span className="text-secondary text-gray-500 wrap-anywhere">
              {r.location}
            </span>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {d.shopId && (
            <Link
              href={`/shop/${d.shopId}`}
              target="_blank"
              className="self-start text-secondary text-gray-500 underline underline-offset-2 wrap-anywhere"
            >
              {shop?.address ?? r.location}
            </Link>
          )}
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-1 rounded-card bg-gray-050 px-3 py-2.5 text-secondary"
            >
              <span className="font-semibold text-ink">{row.label}</span>
              <span className="text-gray-400 wrap-anywhere">
                현재 {row.current ?? "정보 없음"}
              </span>
              {row.proposed && (
                <span className="text-ink wrap-anywhere">
                  제보 {row.proposed}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {r.message && (
        <p className="border-l-2 border-gray-150 pl-3 text-secondary whitespace-pre-line text-ink wrap-anywhere">
          {r.message}
        </p>
      )}

      {r.photoUrls.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto">
          {r.photoUrls.map((url) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer">
              <img
                src={url}
                alt=""
                loading="lazy"
                className="size-20 shrink-0 rounded-card object-cover"
              />
            </a>
          ))}
        </div>
      )}

      {r.status === "done" ? (
        <div className="flex items-center gap-2 text-secondary">
          <span className="min-w-0 flex-1 text-gray-500 wrap-anywhere">
            {r.resolution ? RESOLUTION_LABELS[r.resolution] : "처리됨"}
            {r.note && ` — ${r.note}`}
            {r.resolvedAt && ` · ${dayjs(r.resolvedAt).format("M.D")}`}
          </span>
          <button
            type="button"
            onClick={() => void reopen()}
            className="shrink-0 font-semibold text-gray-400 underline underline-offset-2"
          >
            다시 열기
          </button>
        </div>
      ) : rejecting ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="반려 사유"
            className="h-10 min-w-0 flex-1 rounded-card border border-gray-150 px-3 text-secondary"
          />
          <button
            type="button"
            onClick={() => void resolve("rejected", reason)}
            className="h-10 shrink-0 rounded-pill bg-gray-500 px-4 text-secondary font-bold text-white"
          >
            반려 확정
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void resolve("applied")}
            className="h-10 flex-1 rounded-pill bg-ramen text-secondary font-bold text-white"
          >
            반영함
          </button>
          <button
            type="button"
            onClick={() => void resolve("duplicate")}
            className="h-10 rounded-pill bg-gray-100 px-4 text-secondary font-semibold text-gray-500"
          >
            중복
          </button>
          <button
            type="button"
            onClick={() => setRejecting(true)}
            className="h-10 rounded-pill bg-gray-100 px-4 text-secondary font-semibold text-gray-500"
          >
            반려
          </button>
        </div>
      )}
    </li>
  );
}
