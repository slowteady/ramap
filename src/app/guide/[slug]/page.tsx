import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  GUIDES,
  guideBySlug,
  LINEAGES,
  shopsByGenre,
  soupBySlug,
  type GenreSlug,
} from "@/entities/shop";
import { getShops } from "@/entities/shop/api/get-shops";
import { GenreGuidePage } from "@/views/genre-guide";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) return {};
  const label =
    soupBySlug(slug)?.label ??
    LINEAGES.find((l) => l.slug === slug)?.label ??
    slug;
  return {
    title: `${label} 가이드`,
    description: guide.intro[0],
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) notFound();

  const shops = shopsByGenre(await getShops(), slug as GenreSlug);

  return <GenreGuidePage guide={guide} shops={shops} />;
}
