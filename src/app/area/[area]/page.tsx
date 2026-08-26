import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  buildAreaClusters,
  listAreaGenrePages,
  shopsByArea,
  toMapManifest,
} from "@/entities/shop";
import { getShops } from "@/entities/shop/api/get-shops";
import { AreaListPage, genreLabelOf, type CrossLink } from "@/views/area-list";

type Props = { params: Promise<{ area: string }> };

export async function generateStaticParams() {
  const shops = await getShops();
  return buildAreaClusters(toMapManifest(shops)).map((c) => ({
    area: encodeURIComponent(c.area),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const area = decodeURIComponent((await params).area);
  const count = shopsByArea(await getShops(), area).length;
  if (count === 0) return {};
  return {
    title: `${area} 라멘 맛집 ${count}곳`,
    description: `${area}의 라멘집 ${count}곳. 스프 계열·영업 정보와 위치를 라맵 지도에서 확인하세요.`,
  };
}

export default async function Page({ params }: Props) {
  const area = decodeURIComponent((await params).area);
  const shops = await getShops();
  const areaShops = shopsByArea(shops, area);
  if (areaShops.length === 0) notFound();

  const genrePages = listAreaGenrePages(shops);
  const crossLinks: CrossLink[] = [
    ...genrePages
      .filter((p) => p.area === area)
      .map((p) => ({
        label: `${area} ${genreLabelOf(p.genre) ?? p.genre}`,
        href: `/area/${encodeURIComponent(area)}/${p.genre}`,
      })),
    ...buildAreaClusters(toMapManifest(shops))
      .filter((c) => c.area !== area)
      .slice(0, 4)
      .map((c) => ({
        label: `${c.area} 전체`,
        href: `/area/${encodeURIComponent(c.area)}`,
      })),
  ];

  return (
    <AreaListPage
      area={area}
      genreLabel={null}
      genreDescription={null}
      shops={areaShops}
      mapHref="/"
      pageUrl={`https://ramap.kr/area/${encodeURIComponent(area)}`}
      crossLinks={crossLinks}
    />
  );
}
