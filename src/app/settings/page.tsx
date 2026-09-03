import type { Metadata } from "next";
import { SettingsPage } from "@/views/settings";

export const metadata: Metadata = {
  title: "설정",
  robots: { index: false },
};

export default function Page() {
  return <SettingsPage />;
}
