"use client";

import Link from "next/link";
import { useReportForm, type ReportType } from "@/features/report";
import { cn } from "@/shared/lib/utils";

const TYPES: { value: ReportType; label: string }[] = [
  { value: "new", label: "새 라멘집" },
  { value: "edit", label: "정보 수정" },
  { value: "closed", label: "폐업·휴업" },
];

export function ReportPage() {
  const form = useReportForm();

  if (form.phase === "done") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4">
        <h1 className="text-heading font-extrabold text-ink">
          제보 감사합니다
        </h1>
        <p className="text-center text-body text-gray-500">
          확인 후 지도에 반영할게요.
          <br />
          모든 제보는 검수를 거쳐 게재됩니다.
        </p>
        <Link
          href="/"
          className="mt-4 rounded-pill bg-ink px-6 py-3 text-body font-bold text-white"
        >
          지도로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col pb-10">
      <header className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-heading font-extrabold tracking-tight text-ink">
          라맵
        </Link>
      </header>

      <div className="flex flex-col gap-1.5 px-4">
        <h1 className="text-heading font-extrabold text-ink">제보하기</h1>
        <p className="text-secondary text-gray-500">
          가게명과 링크만 주시면 나머지는 저희가 확인해서 올립니다. 로그인 없이
          제출됩니다.
        </p>
      </div>

      <div className="flex gap-2 px-4 pt-4">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => form.setType(t.value)}
            className={cn(
              "flex-1 rounded-pill py-2 text-secondary font-semibold",
              form.type === t.value
                ? "bg-ink text-white"
                : "bg-gray-050 text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 px-4 pt-6">
        <label className="flex flex-col gap-1.5">
          <span className="text-secondary font-semibold text-ink">가게 이름</span>
          <input
            value={form.shopName}
            onChange={(e) => form.setShopName(e.target.value)}
            placeholder="예) 라멘야 무구"
            className="rounded-card bg-gray-050 px-3 py-2.5 text-body text-ink outline-none placeholder:text-gray-300"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-secondary font-semibold text-ink">
            위치 또는 링크
          </span>
          <input
            value={form.location}
            onChange={(e) => form.setLocation(e.target.value)}
            placeholder='인스타그램 주소, 지도 링크, 또는 "성수역 근처"'
            className="rounded-card bg-gray-050 px-3 py-2.5 text-body text-ink outline-none placeholder:text-gray-300"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-secondary font-semibold text-ink">
            하고 싶은 말 <span className="font-normal text-gray-300">(선택)</span>
          </span>
          <textarea
            value={form.message}
            onChange={(e) => form.setMessage(e.target.value)}
            placeholder="예) 지로계인데 라맵에 없어요"
            rows={3}
            className="resize-none rounded-card bg-gray-050 px-3 py-2.5 text-body text-ink outline-none placeholder:text-gray-300"
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 px-4 pt-6">
        <button
          type="button"
          disabled={!form.canSubmit}
          onClick={form.submit}
          className="w-full rounded-pill bg-ramen py-3 text-body font-bold text-white disabled:opacity-40"
        >
          {form.phase === "submitting" ? "제출 중…" : "제출하기"}
        </button>
        <p className="text-caption text-gray-400">
          모든 제보는 검수 후 게재됩니다. 폐업·휴업 제보는 2차 확인을 거칩니다.
        </p>
      </div>
    </div>
  );
}
