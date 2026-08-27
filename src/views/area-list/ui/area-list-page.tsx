import dayjs from "dayjs";
import Link from "next/link";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  formBySlug,
  itemListJsonLd,
  LINEAGES,
  soupBySlug,
  type GenreSlug,
  type Shop,
} from "@/entities/shop";

export type CrossLink = { label: string; href: string };

type AreaListPageProps = {
  area: string;
  genreLabel: string | null;
  genreDescription: string | null;
  shops: Shop[];
  mapHref: string;
  pageUrl: string;
  crossLinks: CrossLink[];
};

function cardTags(shop: Shop): string {
  return [
    ...shop.soups.map((s) => soupBySlug(s)?.label ?? s),
    ...shop.forms.filter((f) => f !== "ramen").map((f) => formBySlug(f)?.label ?? f),
    ...shop.lineages.map((l) => LINEAGES.find((x) => x.slug === l)?.label ?? l),
  ].join(" · ");
}

function cardMeta(shop: Shop): string {
  const parts: string[] = [];
  if (shop.status === "open") parts.push("영업중");
  if (shop.status === "paused") parts.push("휴업 중");
  if (shop.amenities.includes("ticket-machine")) parts.push("식권기");
  if (shop.amenities.includes("kaedama")) parts.push("카에다마");
  if (shop.amenities.includes("remote-waiting")) parts.push("원격 웨이팅");
  return parts.join(" · ");
}

export function genreLabelOf(genre: GenreSlug): string | null {
  return (
    soupBySlug(genre)?.label ??
    LINEAGES.find((l) => l.slug === genre)?.label ??
    null
  );
}

export function AreaListPage({
  area,
  genreLabel,
  genreDescription,
  shops,
  mapHref,
  pageUrl,
  crossLinks,
}: AreaListPageProps) {
  const year = dayjs().year();
  const h1 = genreLabel
    ? `${area} ${genreLabel} 라멘 맛집 ${shops.length}곳 (${year})`
    : `${area} 라멘 맛집 ${shops.length}곳 (${year})`;
  const faqs =
    genreLabel && genreDescription
      ? [{ q: `${genreLabel} 라멘이란?`, a: `${genreDescription}입니다.` }]
      : [];
  const breadcrumb = [
    { name: "서울", url: "https://ramap.kr" },
    { name: area, url: `https://ramap.kr/area/${encodeURIComponent(area)}` },
    ...(genreLabel ? [{ name: genreLabel, url: pageUrl }] : []),
  ];

  return (
    <div className="flex min-h-dvh flex-col pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            itemListJsonLd(shops, pageUrl),
            breadcrumbJsonLd(breadcrumb),
            ...(faqs.length > 0 ? [faqJsonLd(faqs)] : []),
          ]),
        }}
      />
      <header className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-heading font-extrabold tracking-tight text-ink">
          라맵
        </Link>
        <Link href={mapHref} className="text-secondary font-semibold text-ink">
          지도로 보기
        </Link>
      </header>

      <div className="flex flex-col gap-1.5 px-4">
        <nav className="text-caption text-gray-400">
          {breadcrumb.map((b) => b.name).join(" › ")}
        </nav>
        <h1 className="text-heading font-extrabold text-ink">{h1}</h1>
        <p className="text-secondary text-gray-500">
          {genreLabel
            ? `${area}에서 ${genreLabel} 국물을 내는 집만 모았습니다.`
            : `${area}의 라멘집을 한 곳에 모았습니다.`}
        </p>
      </div>

      <ul className="flex flex-col px-4 pt-4">
        {shops.map((shop) => (
          <li key={shop.id} className="border-b border-gray-050">
            <Link href={`/shop/${shop.id}`} className="flex items-center gap-3 py-3">
              <div className="size-18 shrink-0 rounded-card bg-gray-100" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-body font-semibold text-ink">
                  {shop.name}
                </span>
                <span className="truncate text-secondary text-gray-400">
                  {cardTags(shop)}
                </span>
                <span className="truncate text-secondary text-gray-500">
                  {cardMeta(shop)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="px-4 pt-4">
        <Link
          href={mapHref}
          className="flex w-full items-center justify-center rounded-pill bg-ink py-3 text-body font-bold text-white"
        >
          지도에서 보기
        </Link>
      </div>

      {faqs.length > 0 && (
        <section className="flex flex-col gap-3 px-4 pt-8">
          <h2 className="text-title font-bold text-ink">자주 묻는 질문</h2>
          {faqs.map((faq) => (
            <div key={faq.q} className="flex flex-col gap-1">
              <h3 className="text-body font-semibold text-ink">{faq.q}</h3>
              <p className="text-secondary text-gray-500">{faq.a}</p>
            </div>
          ))}
        </section>
      )}

      {crossLinks.length > 0 && (
        <section className="flex flex-col gap-2 px-4 pt-8">
          <h2 className="text-title font-bold text-ink">함께 찾는 지역·장르</h2>
          <div className="flex flex-wrap gap-2">
            {crossLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-pill bg-gray-050 px-3.5 py-1.5 text-secondary font-semibold text-ink"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
