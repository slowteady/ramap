import type { Metadata } from "next";

/* 홈은 필터·시트 상태가 URL 쿼리로 실리므로 canonical로 변형을 흡수한다 */
export const metadata: Metadata = { alternates: { canonical: "/" } };

export { HomePage as default } from "@/views/home";
