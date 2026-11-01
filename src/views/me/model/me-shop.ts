import type { Shop } from "@/entities/shop";

export type MeShop = Pick<
  Shop,
  "id" | "name" | "areaLabel" | "soups" | "forms" | "lineages"
>;

export function toMeShops(shops: Shop[]): MeShop[] {
  return shops.map(({ id, name, areaLabel, soups, forms, lineages }) => ({
    id,
    name,
    areaLabel,
    soups,
    forms,
    lineages,
  }));
}
