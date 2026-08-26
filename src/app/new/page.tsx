import type { Metadata } from "next";
import { getShops } from "@/entities/shop/api/get-shops";
import { NewOpensPage } from "@/views/new-opens";

export const metadata: Metadata = {
  title: "신규 오픈",
  description:
    "새로 문 연 라멘집 소식. 인허가 데이터와 제보로 확인된 신규 오픈을 라맵에서 확인하세요.",
};

export default async function Page() {
  return <NewOpensPage shops={await getShops()} />;
}
