import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  listAreaPages,
  listAreaGenrePages,
  nearestAreas,
  shopsByArea,
  shouldNoindexArea,
} from "@/entities/shop";
import { getShops } from "@/entities/shop/api/get-shops";
import { getAreaPicks } from "@/entities/shop/index.server";
import {
  AreaListPage,
  areaMapHref,
  genreLabelOf,
  type CrossLink,
} from "@/views/area-list";

type Props = { params: Promise<{ area: string }> };

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const area = decodeURIComponent((await params).area);
  const count = shopsByArea(await getShops(), area).length;
  if (count === 0) return {};
  return {
    title: `${area} 라멘 맛집 ${count}곳`,
    description: `${area}의 라멘집 ${count}곳. 국물 종류·영업시간과 위치를 라맵 지도에서 확인하세요.`,
    alternates: { canonical: `/area/${encodeURIComponent(area)}` },
    ...(shouldNoindexArea(count) && { robots: { index: false } }),
  };
}

export default async function Page({ params }: Props) {
  const area = decodeURIComponent((await params).area);
  const shops = await getShops();
  const areaShops = shopsByArea(shops, area);
  if (areaShops.length === 0) notFound();
  const areaPicks = await getAreaPicks();

  const genrePages = listAreaGenrePages(shops);
  const crossLinks: CrossLink[] = [
    ...genrePages
      .filter((p) => p.area === area)
      .map((p) => ({
        label: `${area} ${genreLabelOf(p.genre) ?? p.genre}`,
        href: `/area/${encodeURIComponent(area)}/${p.genre}`,
      })),
    ...nearestAreas(listAreaPages(shops), area, 6).map((c) => ({
      label: `${c.area} 라멘 ${c.count}곳`,
      href: `/area/${encodeURIComponent(c.area)}`,
    })),
  ];

  return (
    <AreaListPage
      area={area}
      genreLabel={null}
      genreDescription={null}
      shops={areaShops}
      pickIds={areaPicks.areas[area] ?? []}
      michelin={areaPicks.michelinBibGourmand}
      mapHref={areaMapHref(area)}
      pageUrl={`https://ramap.kr/area/${encodeURIComponent(area)}`}
      crossLinks={crossLinks}
    />
  );
}
