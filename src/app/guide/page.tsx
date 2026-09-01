import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { GUIDES, LINEAGES, soupBySlug } from "@/entities/shop";

export const metadata: Metadata = {
  title: "장르 가이드",
  description:
    "돈코츠, 니보시, 이에케까지 — 라멘 장르별 특징과 첫 주문 가이드를 한눈에 봅니다.",
};

function guideLabel(slug: string) {
  return (
    soupBySlug(slug)?.label ?? LINEAGES.find((l) => l.slug === slug)?.label ?? slug
  );
}

function guideDescription(slug: string) {
  return (
    soupBySlug(slug)?.description ??
    LINEAGES.find((l) => l.slug === slug)?.description ??
    null
  );
}

export default function Page() {
  return (
    <div className="flex min-h-dvh flex-col pb-16">
      <header className="flex items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-heading font-extrabold tracking-tight text-ink"
        >
          라맵
        </Link>
        <Link href="/" className="text-secondary font-semibold text-gray-500">
          지도로 보기
        </Link>
      </header>

      <div className="flex flex-col gap-1.5 px-4 pt-2">
        <h1 className="text-heading font-extrabold text-ink">장르 가이드</h1>
        <p className="text-secondary text-gray-500">
          처음이라면 여기서 취향을 찾아보세요.
        </p>
      </div>

      <ul className="flex flex-col px-4 pt-4">
        {GUIDES.map((guide) => (
          <li key={guide.slug} className="border-b border-gray-050">
            <Link
              href={`/guide/${guide.slug}`}
              className="flex items-center gap-3 py-4"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-body font-bold text-ink">
                  {guideLabel(guide.slug)}
                </span>
                {guideDescription(guide.slug) && (
                  <span className="truncate text-secondary text-gray-500">
                    {guideDescription(guide.slug)}
                  </span>
                )}
              </span>
              <ChevronRight className="size-4 shrink-0 text-gray-300" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
