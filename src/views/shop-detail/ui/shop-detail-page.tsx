import { Suspense } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { ChevronLeft, Quote } from "lucide-react";
import {
  AMENITIES,
  breadcrumbJsonLd,
  faqJsonLd,
  formBySlug,
  LINEAGES,
  restaurantJsonLd,
  soupBySlug,
  type Shop,
} from "@/entities/shop";
import { RecordCtaBar } from "@/features/records";
import { ReportEntryRow, ReportSheet } from "@/features/report";
import { genreMeta } from "../model/genre-meta";
import { CopyAddress } from "./copy-address";
import { DetailActions } from "./detail-actions";
import { OpenStatusLine } from "./open-status-line";
import { PhotoGallery } from "./photo-gallery";
import { RecordLogSection } from "./record-log-section";

type ShopDetailPageProps = {
  shop: Shop;
  nearby: Shop[];
};

type InfoRow = { label: string; value: React.ReactNode };

function labelsOf(
  slugs: readonly string[],
  lookup: (slug: string) => string | undefined,
  skip: readonly string[] = [],
): string {
  return slugs
    .filter((s) => !skip.includes(s))
    .map((s) => lookup(s) ?? s)
    .join(", ");
}

function infoRows(shop: Shop): InfoRow[] {
  const rows: InfoRow[] = [];
  if (shop.hours) rows.push({ label: "영업시간", value: shop.hours });
  if (shop.breakTime) rows.push({ label: "브레이크", value: shop.breakTime });
  if (shop.closedDays) rows.push({ label: "휴무", value: shop.closedDays });

  const soups = labelsOf(shop.soups, (s) => soupBySlug(s)?.label, ["etc-soup"]);
  if (soups) rows.push({ label: "국물", value: soups });
  const forms = labelsOf(shop.forms, (f) => formBySlug(f)?.label, ["etc-form"]);
  if (forms) rows.push({ label: "종류", value: forms });
  const styles = shop.lineages
    .map((l) => LINEAGES.find((x) => x.slug === l))
    .filter((x) => x?.kind === "taste")
    .map((x) => x!.label)
    .join(", ");
  if (styles) rows.push({ label: "스타일", value: styles });

  if (shop.seats) rows.push({ label: "좌석", value: shop.seats });

  const amenities = [
    ...shop.lineages.flatMap((l) => {
      const item = LINEAGES.find((x) => x.slug === l);
      return item?.kind === "trait" ? [item.label] : [];
    }),
    ...shop.amenities.flatMap((a) => {
      const label = AMENITIES.find((x) => x.slug === a)?.label;
      return label ? [label] : [];
    }),
  ];
  if (amenities.length > 0 || shop.waitingLink) {
    rows.push({
      label: "편의",
      value: (
        <span className="flex flex-wrap items-baseline gap-x-1.5">
          {amenities.map((label, i) => (
            <span key={label} className="contents">
              {i > 0 && <span className="text-gray-300">·</span>}
              <span>{label}</span>
            </span>
          ))}
          {shop.waitingLink && (
            <a
              href={shop.waitingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ink underline underline-offset-2"
            >
              원격 줄서기 ↗
            </a>
          )}
        </span>
      ),
    });
  }

  if (shop.openedAt)
    rows.push({ label: "오픈", value: dayjs(shop.openedAt).format("YYYY.M") });
  if (shop.lastVerifiedAt)
    rows.push({
      label: "정보 확인",
      value: (
        <span className="flex items-baseline gap-1.5">
          {dayjs(shop.lastVerifiedAt).format("YYYY.M.D")}
          <span className="rounded-chip bg-gray-100 px-1.5 py-0.5 text-caption font-semibold text-gray-500">
            {shop.verification === "confirmed" ? "운영자 확인" : "확인 중"}
          </span>
        </span>
      ),
    });
  return rows;
}

/* 서브라인 장르 상한 2 — 실측(2026-09-01) 상한: 지도사 1, 다이닝코드 2, 3개 이상 없음 */
const SUBLINE_GENRE_MAX = 2;

function Subline({
  areaLabel,
  meta,
  withLinks,
}: {
  areaLabel: string | null;
  meta: ReturnType<typeof genreMeta>;
  withLinks: boolean;
}) {
  const genres = meta.slice(0, SUBLINE_GENRE_MAX);
  if (!areaLabel && genres.length === 0) return null;
  return (
    <span className="flex flex-wrap items-baseline gap-x-1.5">
      {areaLabel && <span>{areaLabel}</span>}
      {areaLabel && genres.length > 0 && (
        <span className="h-3 w-px self-center bg-gray-200" />
      )}
      {genres.map((item, i) => (
        <span key={item.key} className="flex items-baseline">
          {withLinks && item.href ? (
            <Link href={item.href} className="text-ink">
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
          {i < genres.length - 1 && ","}
        </span>
      ))}
    </span>
  );
}

export function ShopDetailPage({ shop, nearby }: ShopDetailPageProps) {
  const meta = genreMeta(shop);
  const rows = infoRows(shop);
  const breadcrumb = [
    { name: "라맵", url: "https://ramap.kr" },
    ...(shop.areaLabel
      ? [
          {
            name: shop.areaLabel,
            url: `https://ramap.kr/area/${encodeURIComponent(shop.areaLabel)}`,
          },
        ]
      : []),
    { name: shop.name, url: `https://ramap.kr/shop/${shop.id}` },
  ];
  const faqs = shop.hours
    ? [
        {
          q: `${shop.name} 영업시간은?`,
          a: [
            shop.hours,
            shop.breakTime && `브레이크 ${shop.breakTime}`,
            shop.closedDays && `${shop.closedDays} 휴무`,
          ]
            .filter(Boolean)
            .join(", "),
        },
      ]
    : [];

  return (
    <div className="flex min-h-dvh flex-col pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            restaurantJsonLd(shop),
            breadcrumbJsonLd(breadcrumb),
            ...(faqs.length > 0 ? [faqJsonLd(faqs)] : []),
          ]),
        }}
      />

      {shop.photos.length > 0 ? (
        <div className="relative">
          <Suspense>
            <PhotoGallery shopName={shop.name} photos={shop.photos} />
          </Suspense>
          <Link
            href="/"
            aria-label="지도로 돌아가기"
            className="absolute top-2 left-2 flex size-10 items-center justify-center rounded-pill bg-white/90 text-ink shadow-[0_1px_4px_rgba(26,27,31,0.15)]"
          >
            <ChevronLeft className="size-5" />
          </Link>
        </div>
      ) : (
        <header className="flex items-center px-2 py-2">
          <Link
            href="/"
            aria-label="지도로 돌아가기"
            className="flex size-10 items-center justify-center rounded-pill text-ink"
          >
            <ChevronLeft className="size-5" />
          </Link>
        </header>
      )}

      <div className="flex flex-col gap-1.5 px-4 pt-1">
        <h1 className="text-heading font-extrabold text-ink">{shop.name}</h1>
        {(shop.areaLabel || meta.length > 0) && (
          <p className="text-secondary text-gray-500">
            <Subline areaLabel={shop.areaLabel} meta={meta} withLinks />
          </p>
        )}
        {shop.status === "paused" ? (
          <p className="text-secondary font-semibold text-gray-500">휴업 중</p>
        ) : (
          <OpenStatusLine
            hours={shop.hours}
            breakTime={shop.breakTime}
            closedDays={shop.closedDays}
          />
        )}
        <div className="pt-3">
          <DetailActions
            shopId={shop.id}
            target={{
              name: shop.name,
              lat: shop.lat,
              lng: shop.lng,
              naverPlace: shop.naverPlace,
            }}
          />
        </div>
        {shop.tagline && (
          <div className="mt-4 flex items-start gap-2 rounded-card border border-gray-100 px-3.5 py-3">
            <Quote className="mt-0.5 size-3.5 shrink-0 fill-current text-ramen" />
            <p className="text-body font-medium text-ink">{shop.tagline}</p>
          </div>
        )}
      </div>

      {rows.length > 0 && (
        <section className="px-4 pt-7">
          <dl className="flex flex-col">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex gap-4 border-b border-gray-050 py-2.5"
              >
                <dt className="w-16 shrink-0 text-secondary font-semibold text-gray-400">
                  {row.label}
                </dt>
                <dd className="min-w-0 flex-1 text-body text-ink">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {shop.menus.length > 0 && (
        <section className="flex flex-col gap-2 px-4 pt-7">
          <h2 className="text-title font-bold text-ink">대표 메뉴</h2>
          <ul className="flex flex-col">
            {shop.menus.map((menu) => (
              <li
                key={menu.name}
                className="flex items-baseline justify-between border-b border-gray-050 py-2.5"
              >
                <span className="text-body text-ink">{menu.name}</span>
                {menu.price !== null && (
                  <span className="text-body font-semibold text-ink">
                    {menu.price.toLocaleString()}원
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {shop.address && (
        <section className="flex flex-col gap-1 px-4 pt-7">
          <h2 className="text-title font-bold text-ink">오시는 길</h2>
          <div className="flex items-center justify-between gap-3">
            <p className="text-body text-ink">{shop.address}</p>
            <CopyAddress address={shop.address} />
          </div>
        </section>
      )}

      <RecordLogSection shopId={shop.id} />

      <div className="mt-7 border-y border-gray-050">
        <ReportEntryRow shopId={shop.id} />
      </div>

      {nearby.length > 0 && (
        <section className="flex flex-col gap-1 px-4 pt-7">
          <h2 className="text-title font-bold text-ink">근처 라멘집</h2>
          <ul className="flex flex-col">
            {nearby.map((s) => (
              <li
                key={s.id}
                className="border-b border-gray-050 last:border-b-0"
              >
                <Link
                  href={`/shop/${s.id}`}
                  className="flex flex-col gap-0.5 py-3"
                >
                  <span className="text-body font-semibold text-ink">
                    {s.name}
                  </span>
                  <span className="text-secondary text-gray-400">
                    <Subline
                      areaLabel={s.areaLabel}
                      meta={genreMeta(s)}
                      withLinks={false}
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <RecordCtaBar shopId={shop.id} />
      <Suspense>
        <ReportSheet
          editTarget={{
            id: shop.id,
            name: shop.name,
            location: shop.address ?? shop.areaLabel,
          }}
        />
      </Suspense>
    </div>
  );
}
