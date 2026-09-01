export type DirectionTarget = {
  name: string;
  lat: number | null;
  lng: number | null;
  naverPlace: string | null;
};

export type DirectionLink = { label: string; href: string };

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
      href: t.naverPlace ?? `https://map.naver.com/p/search/${name}`,
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
