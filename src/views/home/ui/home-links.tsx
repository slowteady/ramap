import Link from "next/link";
import {
  buildAreaClusters,
  GUIDES,
  LINEAGES,
  soupBySlug,
  type ShopPin,
} from "@/entities/shop";

const AREA_LINK_MAX = 16;

/* 지도 아래 SSR 링크 섹션 (기획 12 — 홈이 순수 SPA면 크롤러에 콘텐츠가 없다).
   첫 화면은 지도 100dvh 그대로, 스크롤 아래가 크롤러의 진입 링크 그래프다 */
export function HomeLinks({ pins }: { pins: ShopPin[] }) {
  const areas = [...buildAreaClusters(pins)]
    .sort((a, b) => b.count - a.count)
    .slice(0, AREA_LINK_MAX);

  return (
    <footer className="flex flex-col gap-7 border-t border-gray-100 bg-white px-4 pt-8 pb-32">
      <p className="text-secondary text-gray-500">
        라맵은 한국의 라멘집 {pins.length.toLocaleString()}곳을 돈코츠·니보시
        같은 장르로 찾는 지도입니다. 영업시간과 신규 오픈 소식까지 한 번에
        확인하세요.
      </p>
      <section className="flex flex-col gap-2.5">
        <h2 className="text-secondary font-bold text-ink">지역별 라멘 지도</h2>
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
          {areas.map((a) => (
            <li key={a.area}>
              <Link
                href={`/area/${encodeURIComponent(a.area)}`}
                className="text-secondary text-gray-500"
              >
                {a.area} 라멘 {a.count}곳
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-2.5">
        <h2 className="text-secondary font-bold text-ink">장르 가이드</h2>
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guide/${g.slug}`}
                className="text-secondary text-gray-500"
              >
                {soupBySlug(g.slug)?.label ??
                  LINEAGES.find((l) => l.slug === g.slug)?.label ??
                  g.slug}
              </Link>
            </li>
          ))}
          {LINEAGES.filter((l) => l.kind === "taste").map((l) => (
            <li key={l.slug}>
              <Link
                href={`/style/${l.slug}`}
                className="text-secondary text-gray-500"
              >
                {l.label} 지도
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </footer>
  );
}
