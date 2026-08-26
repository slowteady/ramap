import Link from "next/link";
import {
  formBySlug,
  groupByOpenedMonth,
  soupBySlug,
  type Shop,
} from "@/entities/shop";

function tagLine(shop: Shop): string {
  return [
    ...shop.soups.map((s) => soupBySlug(s)?.label ?? s),
    ...shop.forms.filter((f) => f !== "ramen").map((f) => formBySlug(f)?.label ?? f),
    shop.areaLabel,
  ]
    .filter(Boolean)
    .join(" · ");
}

function monthTitle(month: string): string {
  const [year, m] = month.split("-");
  return `${year}년 ${Number(m)}월`;
}

function openDate(openedAt: string): string {
  const [, m, d] = openedAt.split("-");
  return `${Number(m)}/${Number(d)} 오픈`;
}

export function NewOpensPage({ shops }: { shops: Shop[] }) {
  const groups = groupByOpenedMonth(shops);

  return (
    <div className="flex min-h-dvh flex-col pb-10">
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-baseline gap-4">
          <Link
            href="/"
            className="text-heading font-extrabold tracking-tight text-ink"
          >
            라맵
          </Link>
          <nav className="flex gap-3 text-body font-semibold">
            <Link href="/" className="text-gray-300">
              지도
            </Link>
            <span className="text-ink">신규 오픈</span>
          </nav>
        </div>
        <Link
          href="/report"
          className="rounded-pill bg-ramen px-3.5 py-1.5 text-secondary font-bold text-white"
        >
          제보하기
        </Link>
      </header>

      <div className="flex flex-col gap-1 px-4">
        <h1 className="text-heading font-extrabold text-ink">새로 문 연 라멘집</h1>
        <p className="text-secondary text-gray-500">
          인허가 데이터와 제보로 확인된 신규 오픈입니다.
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="px-4 pt-8 text-body text-gray-400">
          이번 달 확인된 신규 오픈이 없어요.
        </p>
      ) : (
        groups.map((group) => (
          <section key={group.month} className="flex flex-col px-4 pt-6">
            <h2 className="text-title font-bold text-ink">
              {monthTitle(group.month)}
            </h2>
            <ul className="flex flex-col">
              {group.shops.map((shop) => (
                <li key={shop.id} className="border-b border-gray-050">
                  <Link
                    href={`/shop/${shop.id}`}
                    className="flex items-center gap-3 py-3"
                  >
                    <div className="relative size-18 shrink-0 rounded-card bg-gray-100">
                      <span className="absolute top-1 left-1 rounded-pill bg-ramen px-1.5 py-0.5 text-caption font-bold text-white">
                        NEW
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-body font-semibold text-ink">
                        {shop.name}
                      </span>
                      <span className="truncate text-secondary text-gray-400">
                        {tagLine(shop)}
                      </span>
                      <span className="text-secondary text-gray-500">
                        {openDate(shop.openedAt!)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      <Link
        href="/report"
        className="mx-4 mt-8 flex items-center justify-between rounded-card bg-gray-050 px-4 py-4"
      >
        <span className="text-body text-gray-500">새 라멘집을 발견하셨나요?</span>
        <span className="text-body font-bold text-ramen">제보하기 →</span>
      </Link>
    </div>
  );
}
