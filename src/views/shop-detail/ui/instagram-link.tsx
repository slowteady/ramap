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
    <a
      href={instagramUrl(handle)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("instagram_clicked", { shop_id: shopId, shared })}
      className="font-semibold text-ink underline underline-offset-2"
    >
      @{handle} ↗
    </a>
  );
}
