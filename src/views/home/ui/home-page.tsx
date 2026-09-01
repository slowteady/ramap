import { Suspense } from "react";
import { toMapManifest } from "@/entities/shop";
import { getShops } from "@/entities/shop/api/get-shops";
import { AuthEntry } from "./auth-entry";
import { SearchBar } from "./search-bar";
import { ShopMap } from "./shop-map";

export async function HomePage() {
  const shops = await getShops();
  const pins = toMapManifest(shops);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="flex shrink-0 items-center gap-3 px-4 py-3">
        <span className="shrink-0 text-heading font-extrabold tracking-tight text-ink">
          라맵
        </span>
        <SearchBar />
        <AuthEntry />
      </header>
      <Suspense>
        <ShopMap pins={pins} />
      </Suspense>
    </div>
  );
}
