import type { Metadata } from "next";
import { ReportPage } from "@/views/report";

export const metadata: Metadata = {
  title: "제보하기",
  description:
    "새 라멘집, 정보 수정, 폐업 소식을 알려주세요. 로그인 없이 제출되고 검수 후 반영됩니다.",
};

export default function Page() {
  return <ReportPage />;
}
