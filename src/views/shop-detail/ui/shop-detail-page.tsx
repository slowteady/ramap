import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, Clock, Users } from "lucide-react";
import {
  AMENITIES,
  GenreChips,
  LINEAGES,
  restaurantJsonLd,
  type Shop,
} from "@/entities/shop";
import { RecordCtaBar } from "@/features/records";
import { ReportEntryRow, ReportSheet } from "@/features/report";

function amenityChips(shop: Shop): string[] {
  return [
    ...shop.lineages.flatMap((l) => {
      const item = LINEAGES.find((x) => x.slug === l);
      return item?.kind === "trait" ? [item.label] : [];
    }),
    ...shop.amenities.flatMap((a) => {
      const label = AMENITIES.find((x) => x.slug === a)?.label;
      return label ? [label] : [];
    }),
  ];
}

export function ShopDetailPage({ shop }: { shop: Shop }) {
  return (
    <div className="flex min-h-dvh flex-col pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(restaurantJsonLd(shop)),
        }}
      />
      <div className="relative h-48 bg-gray-100">
        <Link
          href="/"
          aria-label="지도로 돌아가기"
          className="absolute top-3 left-3 flex size-9 items-center justify-center rounded-pill bg-white shadow-[0_1px_5px_rgba(26,27,31,0.15)]"
        >
          <ChevronLeft className="size-5 text-ink" />
        </Link>
      </div>

      <div className="flex flex-col gap-1.5 px-4 pt-4">
        <h1 className="text-heading font-extrabold text-ink">{shop.name}</h1>
        {(shop.areaLabel || shop.status === "paused") && (
          <p className="flex items-baseline gap-1.5 text-secondary text-gray-400">
            {shop.areaLabel && <span>{shop.areaLabel}</span>}
            {shop.areaLabel && shop.status === "paused" && (
              <span className="text-gray-300">·</span>
            )}
            {shop.status === "paused" && (
              <span className="font-semibold">휴업 중</span>
            )}
          </p>
        )}
        <GenreChips
          soups={shop.soups}
          forms={shop.forms}
          lineages={shop.lineages}
          linkGuides
          className="pt-1"
        />
        {shop.tagline && (
          <p className="text-body text-gray-500">{shop.tagline}</p>
        )}
      </div>

      <section className="flex flex-col gap-2.5 px-4 pt-5">
        {(shop.hours || shop.breakTime || shop.closedDays) && (
          <div className="flex items-center gap-2 text-body text-ink">
            <Clock className="size-4 shrink-0 text-gray-400" />
            <span>
              {[
                shop.hours,
                shop.breakTime && `브레이크 ${shop.breakTime}`,
                shop.closedDays && `${shop.closedDays} 휴무`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </div>
        )}
        {shop.seats && (
          <div className="flex items-center gap-2 text-body text-ink">
            <Users className="size-4 shrink-0 text-gray-400" />
            <span>{shop.seats}</span>
          </div>
        )}
        {(amenityChips(shop).length > 0 || shop.waitingLink) && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {amenityChips(shop).map((label) => (
              <span
                key={label}
                className="rounded-chip bg-gray-100 px-1.5 py-0.5 text-caption font-semibold text-gray-500"
              >
                {label}
              </span>
            ))}
            {shop.waitingLink && (
              <a
                href={shop.waitingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-chip bg-gray-100 px-1.5 py-0.5 text-caption font-semibold text-ink underline underline-offset-2"
              >
                원격 줄서기
              </a>
            )}
          </div>
        )}
      </section>

      {shop.menus.length > 0 && (
        <section className="flex flex-col gap-2 px-4 pt-6">
          <h2 className="text-title font-bold text-ink">대표 메뉴</h2>
          <ul className="flex flex-col gap-1.5">
            {shop.menus.map((menu) => (
              <li
                key={menu.name}
                className="flex items-baseline justify-between rounded-card bg-gray-050 px-3 py-2.5"
              >
                <span className="text-body font-semibold text-ink">
                  {menu.name}
                </span>
                {menu.price !== null && (
                  <span className="text-secondary text-gray-500">
                    {menu.price.toLocaleString()}원
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-2 px-4 pt-6">
        <h2 className="text-title font-bold text-ink">오시는 길</h2>
        <Link
          href={`/?shop=${shop.id}`}
          className="flex h-28 items-center justify-center rounded-card bg-gray-100 text-body font-semibold text-ink"
        >
          지도에서 보기
        </Link>
        {shop.address && (
          <p className="text-secondary text-gray-500">{shop.address}</p>
        )}
        {shop.naverPlace && (
          <a
            href={shop.naverPlace}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary font-semibold text-ink underline underline-offset-2"
          >
            네이버 지도에서 열기
          </a>
        )}
      </section>

      <div className="mt-8 border-t border-gray-050">
        <ReportEntryRow shopId={shop.id} />
      </div>
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
