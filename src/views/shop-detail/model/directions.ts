export type DirectionTarget = {
  name: string;
  lat: number | null;
  lng: number | null;
  naverPlace: string | null;
};

export type DirectionLink = { label: string; href: string };

const EARTH_HALF_CIRCUMFERENCE_M = 20037508.34;

function webMercator(lat: number, lng: number): { x: number; y: number } {
  const x = (lng * EARTH_HALF_CIRCUMFERENCE_M) / 180;
  const y =
    (Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180)) *
    (EARTH_HALF_CIRCUMFERENCE_M / 180);
  return { x, y };
}

/* 네이버는 앱 없이 여는 좌표 길찾기 웹 주소가 없어(nmap:// 앱 전용) 이름 검색을 유지하되,
   지도 중심(c=Web Mercator)을 매장 좌표에 두면 동명 지점 중 가까운 순으로 정렬된다(2026-10-27 실측).
   비공식 파라미터라 무시돼도 기존 이름 검색과 같다 */
function naverSearchUrl(t: DirectionTarget): string {
  const query = encodeURIComponent(
    t.name.replace(/\s*\(.*?\)\s*/g, " ").trim(),
  );
  const base = `https://map.naver.com/p/search/${query}`;
  if (t.lat === null || t.lng === null) return base;
  const { x, y } = webMercator(t.lat, t.lng);
  return `${base}?c=${x.toFixed(4)},${y.toFixed(4)},15,0,0,0,dh`;
}

/* 카카오맵 URL 스킴은 공식 문서(apis.map.kakao.com/web/guide/#urlscheme), 티맵은 tmap://route 스킴 */
export function directionLinks(t: DirectionTarget): DirectionLink[] {
  const name = encodeURIComponent(t.name);
  const hasCoord = t.lat !== null && t.lng !== null;
  return [
    ...(hasCoord
      ? [
          {
            label: "카카오맵",
            href: `https://map.kakao.com/link/to/${name},${t.lat},${t.lng}`,
          },
        ]
      : []),
    {
      label: "네이버 지도",
      href: t.naverPlace ?? naverSearchUrl(t),
    },
    ...(hasCoord
      ? [
          {
            label: "티맵",
            href: `tmap://route?goalname=${name}&goalx=${t.lng}&goaly=${t.lat}`,
          },
        ]
      : []),
  ];
}
