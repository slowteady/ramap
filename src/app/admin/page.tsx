import type { Metadata } from "next";
import { AdminPage } from "@/views/admin";

export const metadata: Metadata = {
  title: "운영",
  robots: { index: false },
};

export default function Page() {
  return <AdminPage />;
}
