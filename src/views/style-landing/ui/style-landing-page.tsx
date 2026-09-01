import Link from "next/link";
import { PageHeader } from "@/shared/ui/page-header";
import {
  formBySlug,
  LINEAGES,
  soupBySlug,
  type Shop,
  type TaxonomyItem,
  guideBySlug,
} from "@/entities/shop";
import { StyleProgress, VisitedCheck } from "./style-progress";

type StyleLandingPageProps = {
  lineage: TaxonomyItem;
  shops: Shop[];
};

function dominantSoups(shops: Shop[]): string {
  const counts = new Map<string, number>();
  for (const s of shops)
    for (const soup of s.soups) counts.set(soup, (counts.get(soup) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([slug]) => soupBySlug(slug)?.label ?? slug)
    .join(" · ");
}

function cardTags(shop: Shop): string {
  return [
    ...shop.lineages.map((l) => LINEAGES.find((x) => x.slug === l)?.label ?? l),
    ...shop.forms
      .filter((f) => f !== "ramen")
      .map((f) => formBySlug(f)?.label ?? f),
    shop.areaLabel,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function StyleLandingPage({ lineage, shops }: StyleLandingPageProps) {
  const related = LINEAGES.filter(
    (l) => l.slug !== lineage.slug && l.kind === "taste",
  );

  return (
    <div className="flex min-h-dvh flex-col pb-10">
      <div className="bg-ink pb-6 text-white">
        <PageHeader
          dark
          action={
            <Link
              href={`/?lineage=${lineage.slug}`}
              className="text-secondary font-semibold text-white/80"
            >
              지도로 보기
            </Link>
          }
        />
        <div className="flex flex-col gap-2 px-4 pt-2">
          <span className="text-caption font-semibold tracking-wide text-white/50">
            스타일
          </span>
          <div className="flex items-baseline gap-2">
            <h1 className="text-display font-extrabold">{lineage.label}</h1>
            {lineage.labelJa && (
              <span className="text-title text-white/40">
                {lineage.labelJa}
              </span>
            )}
          </div>
          {lineage.description && (
            <p className="text-body leading-relaxed text-white/70">
              {lineage.description}
            </p>
          )}
          <div className="flex gap-5 pt-2">
            <div className="flex flex-col">
              <span className="text-caption text-white/50">등록</span>
              <span className="text-title font-bold">{shops.length}곳</span>
            </div>
            {shops.length > 0 && (
              <div className="flex flex-col">
                <span className="text-caption text-white/50">스프</span>
                <span className="text-title font-bold">
                  {dominantSoups(shops)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <StyleProgress label={lineage.label} shopIds={shops.map((s) => s.id)} />

      {shops.length === 0 && (
        <p className="px-4 pt-6 text-body text-gray-400">
          아직 등록된 {lineage.label} 매장이 없어요. 알고 계신 곳이 있다면
          제보해 주세요.
        </p>
      )}
      <ul className="flex flex-col px-4 pt-2">
        {shops.map((shop) => (
          <li key={shop.id} className="border-b border-gray-050">
            <Link
              href={`/shop/${shop.id}`}
              className="flex flex-col gap-0.5 py-3"
            >
              <span className="flex items-center gap-2">
                <span className="text-body font-semibold text-ink">
                  {shop.name}
                </span>
                <VisitedCheck shopId={shop.id} />
              </span>
              <span className="text-secondary text-gray-400">
                {cardTags(shop)}
              </span>
              <span
                className={`text-secondary font-semibold ${shop.status === "open" ? "text-open" : "text-gray-400"}`}
              >
                {shop.status === "open" ? "영업중" : "휴업 중"}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="flex flex-col gap-2 px-4 pt-8">
        <h2 className="text-title font-bold text-ink">더 알아보기</h2>
        <div className="flex flex-wrap gap-2">
          {guideBySlug(lineage.slug) && (
            <Link
              href={`/guide/${lineage.slug}`}
              className="rounded-pill bg-gray-050 px-3.5 py-1.5 text-secondary font-semibold text-ink"
            >
              {lineage.label}란? 가이드
            </Link>
          )}
          {related.map((l) => (
            <Link
              key={l.slug}
              href={`/style/${l.slug}`}
              className="rounded-pill bg-gray-050 px-3.5 py-1.5 text-secondary font-semibold text-ink"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
