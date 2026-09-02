import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { nearbyShops, shopById, soupBySlug } from "@/entities/shop";
import { getShops } from "@/entities/shop/api/get-shops";
import { ShopDetailPage } from "@/views/shop-detail";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const shops = await getShops();
  return shops.map((s) => ({ slug: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const shop = shopById(await getShops(), slug);
  if (!shop) return {};
  const soups = shop.soups
    .filter((s) => s !== "etc-soup")
    .map((s) => soupBySlug(s)?.label ?? s)
    .join(" · ");
  const topMenu = shop.menus[0];
  /* 공유 카드 설명 = 위치·장르·대표메뉴 정보 신호 (네이버=리뷰 수·카카오=주소 실측 문법) */
  const description =
    [
      shop.areaLabel ?? shop.district,
      soups,
      topMenu &&
        `${topMenu.name}${topMenu.price ? ` ${topMenu.price.toLocaleString()}원` : ""}`,
    ]
      .filter(Boolean)
      .join(" · ") || `${shop.name} 정보를 라맵에서 확인하세요.`;
  return {
    title: `${shop.name} — ${shop.areaLabel ?? shop.district ?? ""} 라멘`,
    description,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const shops = await getShops();
  const shop = shopById(shops, slug);
  if (!shop) notFound();
  return <ShopDetailPage shop={shop} nearby={nearbyShops(shops, shop, 3)} />;
}
