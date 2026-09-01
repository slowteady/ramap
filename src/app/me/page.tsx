import type { Metadata } from "next";
import { getShops } from "@/entities/shop/api/get-shops";
import { MePage } from "@/views/me";

export const metadata: Metadata = {
  title: "마이 | 라맵",
  robots: { index: false },
};

export default async function Page() {
  const shops = await getShops();
  return <MePage shops={shops} />;
}
