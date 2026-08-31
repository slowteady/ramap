import { Suspense } from "react";
import { toMapManifest } from "@/entities/shop";
import { getShops } from "@/entities/shop/api/get-shops";
import { ReportSheet } from "@/features/report";
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
        <AuthEntry />
      </header>
      <Suspense>
        <ShopMap pins={pins} />
        <ReportSheet />
      </Suspense>
    </div>
  );
}
