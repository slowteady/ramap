import type { Metadata } from "next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "라맵 — 한국 라멘을 장르로 찾는 지도",
  description:
    "돈코츠·이에케·츠케멘·니보시. 라멘 덕후가 실제로 고르는 기준으로 전국 라멘집을 찾는 검증된 라멘 전문 지도.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="h-full">{children}</body>
    </html>
  );
}
