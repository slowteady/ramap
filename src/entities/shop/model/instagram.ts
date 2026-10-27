import type { Shop } from "./types";

export function instagramUrl(handle: string): string {
  return `https://www.instagram.com/${handle}/`;
}

export function isSharedInstagram(
  shops: readonly Pick<Shop, "id" | "instagram" | "address">[],
  shop: Pick<Shop, "id" | "instagram" | "address">,
): boolean {
  if (!shop.instagram) return false;
  return shops.some(
    (o) =>
      o.id !== shop.id &&
      o.instagram === shop.instagram &&
      o.address !== shop.address,
  );
}
