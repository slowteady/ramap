"use client";

import { instagramUrl } from "@/entities/shop";
import { track } from "@/shared/lib/analytics";

export function InstagramLink({
  shopId,
  handle,
  shared,
}: {
  shopId: string;
  handle: string;
  shared: boolean;
}) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-1.5">
      <a
        href={instagramUrl(handle)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("instagram_clicked", { shop_id: shopId, shared })}
        className="font-semibold text-ink underline underline-offset-2"
      >
        @{handle} ↗
      </a>
      {shared && <span className="text-gray-400">브랜드 계정</span>}
    </span>
  );
}
