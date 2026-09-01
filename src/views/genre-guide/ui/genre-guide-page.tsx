import Link from "next/link";
import { PageHeader } from "@/shared/ui/page-header";
import {
  LINEAGES,
  soupBySlug,
  type GuideContent,
  type Shop,
} from "@/entities/shop";

type GenreGuidePageProps = {
  guide: GuideContent;
  shops: Shop[];
};

function labelOf(slug: string): { label: string; labelJa?: string } {
  const item =
    soupBySlug(slug) ?? LINEAGES.find((l) => l.slug === slug) ?? null;
  return item ?? { label: slug };
}

const GUIDE_SHOP_MAX = 5;

export function GenreGuidePage({ guide, shops }: GenreGuidePageProps) {
  const { label, labelJa } = labelOf(guide.slug);
  const isSoup = Boolean(soupBySlug(guide.slug));
  const mapHref = isSoup ? `/?soup=${guide.slug}` : `/?lineage=${guide.slug}`;

  return (
    <div className="flex min-h-dvh flex-col pb-10">
      <PageHeader
        action={
          <Link
            href={mapHref}
            className="text-secondary font-semibold text-ink"
          >
            지도로 보기
          </Link>
        }
      />

      <div className="flex flex-col gap-3 px-4 pt-2">
        <div className="flex items-baseline gap-2">
          <h1 className="text-display font-extrabold text-ink">{label}</h1>
          {labelJa && (
            <span className="text-title text-gray-300">{labelJa}</span>
          )}
        </div>
        {[...guide.intro, guide.boundary].map((paragraph) => (
          <p
            key={paragraph.slice(0, 20)}
            className="text-body leading-relaxed text-gray-500"
          >
            {paragraph}
          </p>
        ))}
      </div>

      <section className="flex flex-col gap-2 px-4 pt-8">
        <h2 className="text-title font-bold text-ink">한눈에</h2>
        <dl className="flex flex-col">
          {[
            ["맛", guide.traits.taste],
            ["농도", guide.traits.body],
            ["기원", guide.origin],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex gap-4 border-b border-gray-050 py-2.5"
            >
              <dt className="w-14 shrink-0 text-secondary font-semibold text-gray-400">
                {label}
              </dt>
              <dd className="text-body text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {shops.length > 0 && (
        <section className="flex flex-col gap-1 px-4 pt-8">
          <h2 className="text-title font-bold text-ink">대표 {label} 매장</h2>
          <ul className="flex flex-col">
            {shops.slice(0, GUIDE_SHOP_MAX).map((shop) => (
              <li key={shop.id} className="border-b border-gray-050">
                <Link
                  href={`/shop/${shop.id}`}
                  className="flex flex-col gap-0.5 py-3"
                >
                  <span className="text-body font-semibold text-ink">
                    {shop.name}
                  </span>
                  <span className="text-secondary text-gray-400">
                    {[shop.areaLabel, shop.tagline].filter(Boolean).join(" · ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {shops.length > GUIDE_SHOP_MAX && (
            <Link
              href={mapHref}
              className="pt-2 text-secondary font-semibold text-gray-500 underline underline-offset-2"
            >
              지도에서 {shops.length}곳 모두 보기
            </Link>
          )}
        </section>
      )}

      <section className="flex flex-col gap-1.5 px-4 pt-8">
        <h2 className="text-secondary font-semibold text-gray-400">참고</h2>
        <ul className="flex flex-col gap-1">
          {guide.sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary text-gray-500 underline underline-offset-2"
              >
                {source.name}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
