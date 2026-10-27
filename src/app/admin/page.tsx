import type { Metadata } from "next";
import { getShops } from "@/entities/shop/api/get-shops";
import { AdminPage, toAdminShops } from "@/views/admin";

export const metadata: Metadata = {
  title: "운영",
  robots: { index: false },
};

export default async function Page() {
  return <AdminPage shops={toAdminShops(await getShops())} />;
}
