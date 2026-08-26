import type { Metadata } from "next";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "라맵 — 라멘 맛집 지도",
    template: "%s | 라맵",
  },
  description:
    "라멘집 찾을 때 필요한 모든 정보. 진한 돈코츠부터 개운한 시오까지 취향대로 고르고, 영업시간과 신규 오픈 소식까지 지도에서 한 번에 확인하세요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="h-full">{children}</body>
    </html>
  );
}
