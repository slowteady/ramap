import { shopById } from "@/entities/shop";
import { getShops } from "@/entities/shop/api/get-shops";
import { ogCard, OG_SIZE } from "@/shared/lib/og-card";

export const alt = "라맵 매장 정보";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const shop = shopById(await getShops(), slug);
  return ogCard({ photo: shop?.photos[0] ?? null });
}
