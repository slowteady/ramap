import { Suspense } from "react";
import { toMapManifest } from "@/entities/shop";
import { getShops } from "@/entities/shop/api/get-shops";
import { AuthEntry } from "./auth-entry";
import { SearchButton } from "./search-bar";
import { ShopMap } from "./shop-map";
import { LogoMark } from "@/shared/ui/logo-mark";

export async function HomePage() {
  const shops = await getShops();
  const pins = toMapManifest(shops);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="flex shrink-0 items-center px-4 py-3">
        <span className="flex flex-1 items-center gap-1.5 text-heading font-extrabold tracking-tight text-ink">
          <LogoMark className="size-6" />
          라맵
        </span>
        <div className="flex items-center gap-2.5">
          <SearchButton />
          <AuthEntry />
        </div>
      </header>
      <Suspense>
        <ShopMap pins={pins} />
      </Suspense>
    </div>
  );
}
