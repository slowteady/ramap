import proj4 from "proj4";

/* LOCALDATA 계열 인허가 데이터를 상가정보 스키마로 변환 — LOCALDATA 전면 장애(2026-09)
   대체로 부산·대구 지자체 포털에서 받은 원본이 EPSG:5174(중부원점 TM)를 쓴다.
   좌표계 변환은 순수 수학이라 지도사 지오코딩 저장 금지 조항과 무관하다. */
const EPSG5174 =
  "+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 " +
  "+ellps=bessel +units=m +no_defs " +
  "+towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43";

const KR_BOUNDS = { minLng: 124, maxLng: 132, minLat: 33, maxLat: 39 };

export function tmToWgs84(x: number, y: number): [number, number] | null {
  if (!Number.isFinite(x) || !Number.isFinite(y) || x === 0 || y === 0)
    return null;
  try {
    const [lng, lat] = proj4(EPSG5174, "EPSG:4326", [x, y]);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
    if (
      lng < KR_BOUNDS.minLng ||
      lng > KR_BOUNDS.maxLng ||
      lat < KR_BOUNDS.minLat ||
      lat > KR_BOUNDS.maxLat
    )
      return null;
    return [lng, lat];
  } catch {
    return null;
  }
}

export function isOpen(state: string): boolean {
  return state.startsWith("영업");
}

export type LicRow = {
  name: string;
  roadAddress: string;
  state: string;
  x: number;
  y: number;
};

/* 인허가 출처임을 후보 병합 단계에서 구분하기 위한 소분류 코드 자리표시자 */
export const LIC_CODE = "LIC";

const SANGGWON_HEADER = [
  "상호명",
  "지점명",
  "상권업종소분류코드",
  "시군구명",
  "행정동명",
  "도로명주소",
  "경도",
  "위도",
];

const quote = (v: string) => `"${v.replace(/"/g, '""')}"`;

function districtOf(roadAddress: string): string {
  return roadAddress.trim().split(/\s+/)[1] ?? "";
}

export function licToSanggwonCsv(rows: LicRow[]): string {
  const lines = [SANGGWON_HEADER.map(quote).join(",")];
  for (const row of rows) {
    if (!row.name || !isOpen(row.state)) continue;
    const coord = tmToWgs84(row.x, row.y);
    if (!coord) continue;
    lines.push(
      [
        row.name,
        "",
        LIC_CODE,
        districtOf(row.roadAddress),
        "",
        row.roadAddress.replace(/\s+/g, " ").trim(),
        String(coord[0]),
        String(coord[1]),
      ]
        .map(quote)
        .join(","),
    );
  }
  return lines.join("\n") + "\n";
}
