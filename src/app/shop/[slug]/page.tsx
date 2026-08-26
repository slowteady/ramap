import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { shopById, soupBySlug } from "@/entities/shop";
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
  const soups = shop.soups.map((s) => soupBySlug(s)?.label ?? s).join(" · ");
  return {
    title: `${shop.name} — ${shop.areaLabel ?? shop.district ?? ""} 라멘`,
    description: `${shop.name} 정보. ${soups}. 영업시간·메뉴·위치를 라맵에서 확인하세요.`,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const shop = shopById(await getShops(), slug);
  if (!shop) notFound();
  return <ShopDetailPage shop={shop} />;
}
