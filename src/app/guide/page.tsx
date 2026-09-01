import type { Metadata } from "next";
import { GuideIndexPage } from "@/views/genre-guide";

export const metadata: Metadata = {
  title: "장르 가이드",
  description:
    "돈코츠, 니보시, 이에케까지 — 라멘 장르별 특징과 첫 주문 가이드를 한눈에 봅니다.",
};

export default function Page() {
  return <GuideIndexPage />;
}
