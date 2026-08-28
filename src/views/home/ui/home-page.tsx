import { Suspense } from "react";
import Link from "next/link";
import { toMapManifest } from "@/entities/shop";
import { getShops } from "@/entities/shop/api/get-shops";
import { AuthEntry } from "./auth-entry";
import { ShopMap } from "./shop-map";

export async function HomePage() {
  const shops = await getShops();
  const pins = toMapManifest(shops);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between px-4 py-3">
        <span className="text-heading font-extrabold tracking-tight text-ink">
          라맵
        </span>
        <div className="flex items-center gap-2">
          <AuthEntry />
          <Link
            href="/report"
            className="rounded-pill bg-ramen px-3.5 py-1.5 text-secondary font-bold text-white"
          >
            제보하기
          </Link>
        </div>
      </header>
      <Suspense>
        <ShopMap pins={pins} />
      </Suspense>
    </div>
  );
}
