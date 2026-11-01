"use client";

import dayjs from "dayjs";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { MyReport } from "../model/my-reports";
import { reportResult } from "../model/report-result";

const TYPE_LABELS: Record<MyReport["type"], string> = {
  new: "새 라멘집",
  edit: "정보 수정",
};

export function ReportsTab({ reports }: { reports: MyReport[] }) {
  if (reports.length === 0)
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-16">
        <p className="text-body font-bold text-ink">
          라멘집을 알려 주면 결과가 여기에 모여요
        </p>
        <Link
          href="/?report=new"
          className="mt-3 rounded-pill bg-ink px-6 py-3 text-body font-bold text-white"
        >
          라멘집 등록하기
        </Link>
      </div>
    );

  return (
    <ul className="flex flex-col px-4">
      {reports.map((report) => {
        const result = reportResult(report);
        return (
          <li
            key={report.id}
            className="flex flex-col gap-1 border-b border-gray-100 py-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-secondary text-gray-400">
                {TYPE_LABELS[report.type]} ·{" "}
                {dayjs(report.createdAt).format("YYYY.M.D")}
              </span>
              <span
                className={cn(
                  "shrink-0 text-secondary font-semibold",
                  result.label === "반영됨" ? "text-open" : "text-gray-400",
                )}
              >
                {result.label}
              </span>
            </div>
            <p className="text-body font-semibold text-ink">
              {report.shopName}
            </p>
            {result.message && (
              <p className="text-secondary text-gray-500">{result.message}</p>
            )}
            {result.shopHref && (
              <Link
                href={result.shopHref}
                className="-my-2 flex min-h-11 items-center gap-0.5 self-start text-secondary font-semibold text-ink"
              >
                라멘집 보기
                <ChevronRight className="size-4 text-gray-400" />
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
