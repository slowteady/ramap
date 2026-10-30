import type { Metadata } from "next";
import { GuideIndexPage } from "@/views/genre-guide";

export const metadata: Metadata = {
  title: "장르 가이드",
  description:
    "돈코츠, 니보시, 이에케까지 — 라멘 장르별 특징과 기원을 한눈에 볼 수 있어요.",
  alternates: { canonical: "/guide" },
};

export default function Page() {
  return <GuideIndexPage />;
}
