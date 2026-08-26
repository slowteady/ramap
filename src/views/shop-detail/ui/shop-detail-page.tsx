import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  formBySlug,
  LINEAGES,
  restaurantJsonLd,
  soupBySlug,
  type Shop,
} from "@/entities/shop";
import { RecordButtons } from "@/features/records";

function tagLine(shop: Shop): string {
  const labels = [
    ...shop.soups.map((s) => soupBySlug(s)?.label ?? s),
    ...shop.forms.filter((f) => f !== "ramen").map((f) => formBySlug(f)?.label ?? f),
    ...shop.lineages.map((l) => LINEAGES.find((x) => x.slug === l)?.label ?? l),
  ];
  if (shop.areaLabel) labels.push(shop.areaLabel);
  return labels.join(" · ");
}

function statusLine(shop: Shop): { label: string; open: boolean } {
  if (shop.status === "paused") return { label: "휴업 중", open: false };
  const parts = ["영업중"];
  if (shop.hours) parts.push(shop.hours);
  if (shop.closedDays) parts.push(`${shop.closedDays} 휴무`);
  return { label: parts.join(" · "), open: true };
}

function infoRows(shop: Shop): { label: string; value: React.ReactNode }[] {
  const rows: { label: string; value: React.ReactNode }[] = [];
  if (shop.amenities.includes("ticket-machine"))
    rows.push({ label: "주문 방식", value: "식권기" });
  if (shop.amenities.includes("kaedama"))
    rows.push({ label: "카에다마", value: "가능" });
  if (shop.waitingLink)
    rows.push({
      label: "웨이팅",
      value: (
        <a
          href={shop.waitingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-ink underline underline-offset-2"
        >
          원격 줄서기
        </a>
      ),
    });
  else if (shop.amenities.includes("remote-waiting"))
    rows.push({ label: "웨이팅", value: "원격 웨이팅 지원" });
  if (shop.seats) rows.push({ label: "좌석", value: shop.seats });
  if (shop.breakTime) rows.push({ label: "브레이크", value: shop.breakTime });
  return rows;
}

export function ShopDetailPage({ shop }: { shop: Shop }) {
  const status = statusLine(shop);
  const rows = infoRows(shop);
  const primarySoupLabel = soupBySlug(shop.primarySoup)?.label;

  return (
    <div className="flex min-h-dvh flex-col pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd(shop)) }}
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
        <div className="flex items-center gap-2">
          <h1 className="text-heading font-extrabold text-ink">{shop.name}</h1>
          {primarySoupLabel && (
            <span className="rounded-pill bg-gray-050 px-2.5 py-1 text-caption font-bold text-gray-500">
              {primarySoupLabel}
            </span>
          )}
        </div>
        <p className="text-secondary text-gray-400">{tagLine(shop)}</p>
        <p
          className={`text-secondary font-semibold ${status.open ? "text-open" : "text-gray-400"}`}
        >
          {status.label}
        </p>
        {shop.tagline && <p className="text-body text-gray-500">{shop.tagline}</p>}
        <div className="pt-2">
          <RecordButtons shopId={shop.id} />
        </div>
      </div>

      {rows.length > 0 && (
        <section className="flex flex-col gap-2 px-4 pt-6">
          <h2 className="text-title font-bold text-ink">정보</h2>
          <dl className="flex flex-col">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between border-b border-gray-050 py-2.5"
              >
                <dt className="text-secondary text-gray-400">{row.label}</dt>
                <dd className="text-body text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {shop.menus.length > 0 && (
        <section className="flex flex-col gap-2 px-4 pt-6">
          <h2 className="text-title font-bold text-ink">대표 메뉴</h2>
          <ul className="flex flex-col gap-1.5">
            {shop.menus.map((menu) => (
              <li
                key={menu.name}
                className="flex items-baseline justify-between rounded-card bg-gray-050 px-3 py-2.5"
              >
                <span className="text-body font-semibold text-ink">{menu.name}</span>
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

      {primarySoupLabel && (
        <Link
          href={`/guide/${shop.primarySoup}`}
          className="mx-4 mt-6 flex items-center justify-between rounded-card bg-gray-050 px-3 py-3"
        >
          <span className="text-body text-gray-500">
            {primarySoupLabel}가 뭔가요?
          </span>
          <span className="text-secondary font-semibold text-ink">장르 가이드 →</span>
        </Link>
      )}

      <section className="flex flex-col gap-2 px-4 pt-6">
        <h2 className="text-title font-bold text-ink">오시는 길</h2>
        <Link
          href={`/?focus=${shop.id}`}
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

      <div className="px-4 pt-8">
        <Link href="/report" className="text-secondary text-gray-400 underline underline-offset-2">
          정보가 다른가요? 수정 제안하기
        </Link>
      </div>
    </div>
  );
}
