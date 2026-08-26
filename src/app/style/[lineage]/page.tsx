import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LINEAGES } from "@/entities/shop";
import { getShops } from "@/entities/shop/api/get-shops";
import { StyleLandingPage } from "@/views/style-landing";

type Props = { params: Promise<{ lineage: string }> };

export function generateStaticParams() {
  return LINEAGES.map((l) => ({ lineage: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lineage: slug } = await params;
  const lineage = LINEAGES.find((l) => l.slug === slug);
  if (!lineage) return {};
  return {
    title: `${lineage.label} 라멘 지도`,
    description: `${lineage.label}${lineage.description ? ` — ${lineage.description}` : ""}. 서울의 ${lineage.label} 라멘집을 라맵에서 확인하세요.`,
  };
}

export default async function Page({ params }: Props) {
  const { lineage: slug } = await params;
  const lineage = LINEAGES.find((l) => l.slug === slug);
  if (!lineage) notFound();

  const shops = (await getShops()).filter(
    (s) => s.status !== "closed" && (s.lineages as string[]).includes(slug),
  );

  return <StyleLandingPage lineage={lineage} shops={shops} />;
}
