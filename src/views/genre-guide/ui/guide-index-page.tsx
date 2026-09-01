import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { GUIDES, LINEAGES, soupBySlug } from "@/entities/shop";
import { PageHeader } from "@/shared/ui/page-header";

function guideLabel(slug: string) {
  return (
    soupBySlug(slug)?.label ??
    LINEAGES.find((l) => l.slug === slug)?.label ??
    slug
  );
}

function guideDescription(slug: string) {
  return (
    soupBySlug(slug)?.description ??
    LINEAGES.find((l) => l.slug === slug)?.description ??
    null
  );
}

export function GuideIndexPage() {
  return (
    <div className="flex min-h-dvh flex-col pb-16">
      <PageHeader
        action={
          <Link href="/" className="text-secondary font-semibold text-gray-500">
            지도로 보기
          </Link>
        }
      />

      <div className="flex flex-col gap-1.5 px-4 pt-1">
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
