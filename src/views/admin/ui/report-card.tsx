"use client";

import { useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { Check, ExternalLink, MoreHorizontal } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import {
  resolveReports,
  setReportsStatus,
  type AdminReport,
  type ReportResolution,
} from "../model/admin-api";
import {
  ageLabel,
  editRows,
  linkLabel,
  parseDetails,
  REPORT_REJECT_REASONS,
  resolvedMessage,
  type AdminShop,
  type ReportGroup,
} from "../model/report-view";
import { RejectPanel } from "./reject-panel";
import { toastWithUndo } from "./undo-toast";

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

const linkChip =
  "inline-flex h-8 items-center gap-1 rounded-chip bg-gray-050 px-2 text-secondary text-gray-500";

function isUrl(raw: string): boolean {
  return /^https?:\/\//.test(raw);
}

function DoneMenu({ onReopen }: { onReopen: () => void }) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        aria-label="더보기"
        className="-mt-2 -mr-2 flex size-11 shrink-0 items-center justify-center rounded-pill text-gray-400"
      >
        <MoreHorizontal className="size-5" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="z-50 min-w-32 rounded-card border border-gray-150 bg-white py-1"
        >
          <DropdownMenu.Item
            onSelect={onReopen}
            className="flex h-11 items-center px-4 text-secondary text-ink outline-none data-highlighted:bg-gray-050"
          >
            다시 열기
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
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
  const done = r.status === "done";
  const [rejecting, setRejecting] = useState(false);
  const [memoOpen, setMemoOpen] = useState(false);
  const [memo, setMemo] = useState("");

  const setStatus = async (status: AdminReport["status"]) => {
    if (await setReportsStatus(ids, status)) onChanged();
    else toast("처리하지 못했어요. 새로고침하고 다시 눌러 주세요.");
  };

  const resolve = async (resolution: ReportResolution, note?: string) => {
    if (!(await resolveReports(ids, resolution, note))) {
      toast("처리하지 못했어요. 새로고침하고 다시 눌러 주세요.");
      return;
    }
    onChanged();
    toastWithUndo(resolvedMessage(resolution), () => void setStatus("open"));
  };

  const reopen = async () => {
    if (!(await setReportsStatus(ids, "open"))) {
      toast("처리하지 못했어요. 새로고침하고 다시 눌러 주세요.");
      return;
    }
    onChanged();
    toastWithUndo("다시 열었어요", () => void setStatus("done"));
  };

  const message = r.message && (
    <p className="border-l-2 border-gray-150 pl-3 text-secondary whitespace-pre-line text-ink wrap-anywhere">
      {r.message}
    </p>
  );

  return (
    <li className="flex flex-col gap-3 border-b border-gray-100 py-5">
      <div className="flex items-start gap-2">
        {done && r.resolution && (
          <span
            className={cn(
              "mt-0.5 shrink-0 rounded-chip px-1.5 py-0.5 text-caption font-semibold whitespace-nowrap",
              r.resolution === "applied"
                ? "bg-gray-050 text-open"
                : "bg-gray-100 text-gray-500",
            )}
          >
            {RESOLUTION_LABELS[r.resolution]}
          </span>
        )}
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
            {done && r.resolvedAt
              ? `${dayjs(r.resolvedAt).format("M.D")} 처리 · 접수 ${dayjs(r.createdAt).format("M.D")}`
              : dayjs(r.createdAt).format("M.D HH:mm")}
            {` · #${r.id}`}
            {duplicates.length > 0 &&
              (done
                ? ` · 같은 제보 ${duplicates.length}건`
                : ` · 같은 제보 ${duplicates.length}건`)}
          </p>
        </div>
        {done ? (
          <DoneMenu onReopen={() => void reopen()} />
        ) : (
          <span className="shrink-0 text-caption font-semibold text-gray-400">
            {ageLabel(r.createdAt, dayjs())}
          </span>
        )}
      </div>

      {done && r.note && (
        <p className="text-secondary text-gray-500 wrap-anywhere">
          메모: {r.note}
        </p>
      )}

      {r.type === "new" ? (
        <>
          <div className="flex flex-wrap gap-1.5">
            {d.links.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={linkChip}
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
                className={linkChip}
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
          {message}
        </>
      ) : (
        <div className="flex flex-col gap-2">
          {d.shopId && (
            <Link
              href={`/shop/${d.shopId}`}
              target="_blank"
              className="inline-flex items-center gap-1 self-start text-secondary text-gray-500 underline underline-offset-2 wrap-anywhere"
            >
              {shop?.address ?? r.location}
              <ExternalLink className="size-3 shrink-0" />
            </Link>
          )}
          {message}
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-1 rounded-card bg-gray-050 px-3 py-2.5 text-secondary"
            >
              <span className="font-semibold text-ink">{row.label}</span>
              <span className="text-gray-400 wrap-anywhere">
                현재{" "}
                <span className={cn(row.proposed && "line-through")}>
                  {row.current ?? "정보 없음"}
                </span>
              </span>
              {row.proposed && (
                <span className="font-semibold text-ink wrap-anywhere">
                  제보 {row.proposed}
                </span>
              )}
            </div>
          ))}
        </div>
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

      {!done &&
        (rejecting ? (
          <RejectPanel
            reasons={REPORT_REJECT_REASONS}
            onCancel={() => setRejecting(false)}
            onConfirm={(reason) => void resolve("rejected", reason)}
          />
        ) : (
          <>
            {memoOpen ? (
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="메모"
                className="h-11 min-w-0 rounded-card border border-gray-150 px-3 text-secondary"
              />
            ) : (
              <button
                type="button"
                onClick={() => setMemoOpen(true)}
                className="h-8 self-start text-secondary font-semibold text-gray-400"
              >
                + 메모 추가
              </button>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  void resolve("applied", memo.trim() || undefined)
                }
                className="flex h-11 items-center gap-1 rounded-pill bg-ramen px-5 text-secondary font-bold text-white"
              >
                <Check className="size-4" />
                반영하기
              </button>
              <button
                type="button"
                onClick={() =>
                  void resolve("duplicate", memo.trim() || undefined)
                }
                className="h-11 rounded-pill bg-gray-100 px-4 text-secondary font-semibold text-gray-500"
              >
                중복
              </button>
              <button
                type="button"
                onClick={() => setRejecting(true)}
                className="ml-auto h-11 rounded-pill bg-gray-100 px-4 text-secondary font-semibold text-gray-500"
              >
                반려
              </button>
            </div>
          </>
        ))}
    </li>
  );
}
