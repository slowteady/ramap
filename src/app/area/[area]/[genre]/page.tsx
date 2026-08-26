import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  LINEAGES,
  listAreaGenrePages,
  shopsByAreaGenre,
  soupBySlug,
  type GenreSlug,
} from "@/entities/shop";
import { getShops } from "@/entities/shop/api/get-shops";
import { AreaListPage, genreLabelOf, type CrossLink } from "@/views/area-list";

type Props = { params: Promise<{ area: string; genre: string }> };

export async function generateStaticParams() {
  const shops = await getShops();
  return listAreaGenrePages(shops).map((p) => ({
    area: encodeURIComponent(p.area),
    genre: p.genre,
  }));
}

function genreDescriptionOf(genre: GenreSlug): string | null {
  return (
    soupBySlug(genre)?.description ??
    LINEAGES.find((l) => l.slug === genre)?.description ??
    null
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area: rawArea, genre } = await params;
  const area = decodeURIComponent(rawArea);
  const label = genreLabelOf(genre as GenreSlug);
  if (!label) return {};
  const count = shopsByAreaGenre(await getShops(), area, genre as GenreSlug).length;
  return {
    title: `${area} ${label} 라멘 맛집 ${count}곳`,
    description: `${area}의 ${label} 라멘집 ${count}곳. 영업 정보와 위치를 라맵 지도에서 확인하세요.`,
  };
}

export default async function Page({ params }: Props) {
  const { area: rawArea, genre: rawGenre } = await params;
  const area = decodeURIComponent(rawArea);
  const genre = rawGenre as GenreSlug;
  const shops = await getShops();

  const pages = listAreaGenrePages(shops);
  if (!pages.some((p) => p.area === area && p.genre === genre)) notFound();

  const genreShops = shopsByAreaGenre(shops, area, genre);
  const isSoup = Boolean(soupBySlug(genre));
  const mapHref = isSoup ? `/?soup=${genre}` : `/?lineage=${genre}`;

  const crossLinks: CrossLink[] = [
    { label: `${area} 전체`, href: `/area/${encodeURIComponent(area)}` },
    ...pages
      .filter((p) => !(p.area === area && p.genre === genre))
      .slice(0, 5)
      .map((p) => ({
        label: `${p.area} ${genreLabelOf(p.genre) ?? p.genre}`,
        href: `/area/${encodeURIComponent(p.area)}/${p.genre}`,
      })),
  ];

  return (
    <AreaListPage
      area={area}
      genreLabel={genreLabelOf(genre)}
      genreDescription={genreDescriptionOf(genre)}
      shops={genreShops}
      mapHref={mapHref}
      pageUrl={`https://ramap.kr/area/${encodeURIComponent(area)}/${genre}`}
      crossLinks={crossLinks}
    />
  );
}
