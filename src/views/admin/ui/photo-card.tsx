"use client";

import { useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { resetPhoto, reviewPhoto, type PendingPhoto } from "../model/admin-api";
import {
  ageLabel,
  composeReason,
  PHOTO_REJECT_REASONS,
} from "../model/report-view";
import { RejectPanel } from "./reject-panel";
import { toastWithUndo } from "./undo-toast";

export function PhotoCard({
  photo,
  shopName,
  onChanged,
}: {
  photo: PendingPhoto;
  shopName: string | undefined;
  onChanged: () => void;
}) {
  const [rejecting, setRejecting] = useState(false);

  const act = async (status: "approved" | "rejected", reason?: string) => {
    if (!(await reviewPhoto(photo.id, status, reason))) {
      toast("처리하지 못했어요. 새로고침하고 다시 눌러 주세요.");
      return;
    }
    onChanged();
    toastWithUndo(
      status === "approved" ? "승인했어요" : "반려했어요",
      async () => {
        if (await resetPhoto(photo.id)) onChanged();
        else toast("처리하지 못했어요. 새로고침하고 다시 눌러 주세요.");
      },
    );
  };

  return (
    <li className="flex flex-col gap-3 border-b border-gray-100 py-5">
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
      <div className="flex items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Link
            href={`/shop/${photo.shopId}`}
            target="_blank"
            className="self-start text-body font-bold text-ink underline underline-offset-2 wrap-anywhere"
          >
            {shopName ?? photo.shopId}
          </Link>
          <span className="text-caption text-gray-400">
            {photo.nickname} · {dayjs(photo.createdAt).format("M.D HH:mm")}
          </span>
        </div>
        <span className="shrink-0 text-caption font-semibold text-gray-400">
          {ageLabel(photo.createdAt, dayjs())}
        </span>
      </div>
      {photo.comment && (
        <p className="border-l-2 border-gray-150 pl-3 text-secondary text-ink wrap-anywhere">
          {photo.comment}
        </p>
      )}
      {rejecting ? (
        <RejectPanel
          reasons={PHOTO_REJECT_REASONS}
          onCancel={() => setRejecting(false)}
          onConfirm={(chip, text) =>
            void act("rejected", composeReason(chip, text))
          }
        />
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void act("approved")}
            className="flex h-11 items-center gap-1 rounded-pill bg-ramen px-5 text-secondary font-bold text-white"
          >
            <Check className="size-4" />
            승인
          </button>
          <button
            type="button"
            onClick={() => setRejecting(true)}
            className="ml-auto h-11 rounded-pill bg-gray-100 px-4 text-secondary font-semibold text-gray-500"
          >
            반려
          </button>
        </div>
      )}
    </li>
  );
}
