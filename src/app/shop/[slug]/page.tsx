import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  closurePublicState,
  isSharedInstagram,
  nearbyShops,
  shopById,
  shouldNoindexShop,
  soupBySlug,
} from "@/entities/shop";
import { getClosureLedger } from "@/entities/shop/api/get-closure-ledger";
import { getShops } from "@/entities/shop/api/get-shops";
import { goneDescription, ShopDetailPage } from "@/views/shop-detail";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const shops = await getShops();
  const ledger = await getClosureLedger();
  return shops
    .filter((s) => closurePublicState(s, ledger) !== "hidden")
    .map((s) => ({ slug: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const shop = shopById(await getShops(), slug);
  if (!shop) return {};
  const state = closurePublicState(shop, await getClosureLedger());
  if (state === "hidden") return {};
  const gone = state === "closed" || state === "moved";
  const goneLabel = state === "moved" ? "이전" : "폐업";
  const soups = shop.soups
    .filter((s) => s !== "etc-soup")
    .map((s) => soupBySlug(s)?.label ?? s)
    .join(" · ");
  const topMenu = shop.menus[0];
  /* 공유 카드 설명 = 위치·장르·대표메뉴 정보 신호 (네이버=리뷰 수·카카오=주소 실측 문법) */
  const description =
    (gone ? goneDescription(goneLabel, shop.statusChangedAt) : "") +
    ([
      shop.areaLabel ?? shop.district,
      soups,
      topMenu &&
        `${topMenu.name}${topMenu.price ? ` ${topMenu.price.toLocaleString()}원` : ""}`,
    ]
      .filter(Boolean)
      .join(" · ") || `${shop.name} 정보를 라맵에서 확인하세요`);
  return {
    title: `${gone ? `[${goneLabel}] ` : ""}${shop.name} — ${[shop.areaLabel ?? shop.district, "라멘"].filter(Boolean).join(" ")}`,
    description,
    alternates: { canonical: `/shop/${shop.id}` },
    ...(shouldNoindexShop(shop) && { robots: { index: false } }),
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const shops = await getShops();
  const shop = shopById(shops, slug);
  if (!shop) notFound();
  const state = closurePublicState(shop, await getClosureLedger());
  if (state === "hidden") notFound();
  return (
    <ShopDetailPage
      shop={shop}
      nearby={nearbyShops(shops, shop, 3)}
      goneLabel={state === "moved" ? "이전" : "폐업"}
      instagramShared={isSharedInstagram(shops, shop)}
    />
  );
}
