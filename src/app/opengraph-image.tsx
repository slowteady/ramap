import { ogCard, OG_SIZE } from "@/shared/lib/og-card";

export const alt = "라맵 — 한국 라멘을 장르로 찾는 지도";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    title: "한국 라멘, 장르로 찾다",
    subline: "돈코츠 · 쇼유 · 미소 · 니보시 · 츠케멘",
  });
}
