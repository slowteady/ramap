import Link from "next/link";
import {
  GUIDES,
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

export function GenreGuidePage({ guide, shops }: GenreGuidePageProps) {
  const { label, labelJa } = labelOf(guide.slug);
  const isSoup = Boolean(soupBySlug(guide.slug));
  const mapHref = isSoup ? `/?soup=${guide.slug}` : `/?lineage=${guide.slug}`;
  const others = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 4);

  return (
    <div className="flex min-h-dvh flex-col pb-10">
      <header className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-heading font-extrabold tracking-tight text-ink">
          라맵
        </Link>
        <span className="text-secondary text-gray-400">
          {isSoup ? "국물 가이드" : "스타일 가이드"}
        </span>
      </header>

      <div className="flex flex-col gap-3 px-4 pt-2">
        <div className="flex items-baseline gap-2">
          <h1 className="text-display font-extrabold text-ink">{label}</h1>
          {labelJa && (
            <span className="text-title text-gray-300">{labelJa}</span>
          )}
        </div>
        {guide.intro.map((paragraph) => (
          <p key={paragraph.slice(0, 20)} className="text-body leading-relaxed text-gray-500">
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
            ["첫 주문", guide.traits.firstOrder],
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

      {guide.comparisons.length > 0 && (
        <section className="flex flex-col gap-2 px-4 pt-8">
          <h2 className="text-title font-bold text-ink">비슷한 듯 다른 계열</h2>
          {guide.comparisons.map((comparison) => (
            <div
              key={comparison.name}
              className="flex flex-col gap-1 rounded-card bg-gray-050 px-3 py-3"
            >
              <span className="text-body font-semibold text-ink">
                {comparison.name}
              </span>
              <p className="text-secondary text-gray-500">{comparison.text}</p>
            </div>
          ))}
        </section>
      )}

      {shops.length > 0 && (
        <section className="flex flex-col gap-1 px-4 pt-8">
          <h2 className="text-title font-bold text-ink">지금 가볼 수 있는 곳</h2>
          <ul className="flex flex-col">
            {shops.slice(0, 3).map((shop) => (
              <li key={shop.id} className="border-b border-gray-050">
                <Link href={`/shop/${shop.id}`} className="flex flex-col gap-0.5 py-3">
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
        </section>
      )}

      <div className="px-4 pt-6">
        <Link
          href={mapHref}
          className="flex w-full items-center justify-center rounded-pill bg-ink py-3 text-body font-bold text-white"
        >
          {label} 전체 지도에서 보기
        </Link>
      </div>

      <p className="px-4 pt-6 text-caption text-gray-300">
        {guide.reviewed
          ? "이 가이드는 라오타 감수를 거쳤습니다."
          : "이 가이드는 초안이며 라오타 감수로 계속 다듬어집니다."}
      </p>

      <section className="flex flex-col gap-2 px-4 pt-8">
        <h2 className="text-title font-bold text-ink">다른 계열 보기</h2>
        <div className="flex flex-wrap gap-2">
          {others.map((other) => (
            <Link
              key={other.slug}
              href={`/guide/${other.slug}`}
              className="rounded-pill bg-gray-050 px-3.5 py-1.5 text-secondary font-semibold text-ink"
            >
              {labelOf(other.slug).label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
