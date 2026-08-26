import type { SoupSlug } from "@/entities/shop";

export const MAP_DEFAULT_CENTER = { lat: 37.5544, lng: 126.9877 };
export const MAP_DEFAULT_LEVEL = 8;
export const CLUSTER_LEVEL_THRESHOLD = 6;

/* 임시 팔레트 — 미결 1번(실기기 가독성 확정 전). 확정 시 이 파일만 교체 */
export const SOUP_COLORS: Record<SoupSlug, string> = {
  tonkotsu: "#c99235",
  shoyu: "#8a5a33",
  shio: "#7a9cc6",
  miso: "#b0662e",
  "tonkotsu-shoyu": "#a3652c",
  niboshi: "#2f8f83",
  toripaitan: "#d1a56a",
  tantanmen: "#c05a4b",
  "etc-soup": "#9aa0a8",
};
