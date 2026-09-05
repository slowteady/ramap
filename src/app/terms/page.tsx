import type { Metadata } from "next";
import { TERMS_VERSION } from "@/shared/config/legal";
import { LegalPage, TERMS_SECTIONS } from "@/views/legal";

export const metadata: Metadata = {
  title: "이용약관",
  alternates: { canonical: "/terms" },
};

export default function Page() {
  return (
    <LegalPage
      title="이용약관"
      effective={TERMS_VERSION}
      sections={TERMS_SECTIONS}
    />
  );
}
