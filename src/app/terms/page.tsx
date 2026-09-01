import type { Metadata } from "next";
import { LegalPage, TERMS_SECTIONS, TERMS_VERSION } from "@/views/legal";

export const metadata: Metadata = { title: "이용약관" };

export default function Page() {
  return (
    <LegalPage
      title="이용약관"
      effective={TERMS_VERSION}
      sections={TERMS_SECTIONS}
    />
  );
}
