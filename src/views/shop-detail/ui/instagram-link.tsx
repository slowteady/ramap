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
      aria-label="인스타그램 계정 보기"
      onClick={() => track("instagram_clicked", { shop_id: shopId, shared })}
      className="-my-2.5 flex min-h-11 items-center font-semibold text-ink underline underline-offset-2"
    >
      계정 보기 ↗
    </a>
  );
}
