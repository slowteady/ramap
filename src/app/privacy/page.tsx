import type { Metadata } from "next";
import { PRIVACY_VERSION } from "@/shared/config/legal";
import { LegalPage, PRIVACY_SECTIONS } from "@/views/legal";

export const metadata: Metadata = { title: "개인정보 처리방침" };

export default function Page() {
  return (
    <LegalPage
      title="개인정보 처리방침"
      effective={PRIVACY_VERSION}
      sections={PRIVACY_SECTIONS}
    />
  );
}
