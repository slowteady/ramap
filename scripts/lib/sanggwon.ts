import { parseCsv } from "./csv";
import { RAMEN_KEYWORDS } from "./localdata";

export type SanggwonRow = {
  name: string;
  branch: string;
  smallCode: string;
  district: string;
  dong: string;
  roadAddress: string;
  lat: number | null;
  lng: number | null;
};

/* I20303(일식 면 요리)은 우동·소바를 포괄 — 실측(2026-09-02) 기준 제외어로 34건까지 압축됨 */
export const NOODLE_CODE = "I20303";
export const EXCLUDE_KEYWORDS = [
  "우동",
  "소바",
  "돈가스",
  "돈까스",
  "초밥",
  "스시",
  "카레",
  "규동",
  "덮밥",
  "이자카야",
  "포차",
] as const;

const COLUMNS = {
  name: "상호명",
  branch: "지점명",
  smallCode: "상권업종소분류코드",
  district: "시군구명",
  dong: "행정동명",
  roadAddress: "도로명주소",
  lng: "경도",
  lat: "위도",
} as const;

function parseCoord(raw: string | undefined): number | null {
  const v = raw?.trim();
  if (!v) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

export function parseSanggwon(csv: string): SanggwonRow[] {
  const lines = parseCsv(csv);
  if (lines.length < 2) return [];
  const header = lines[0];
  const idx = Object.fromEntries(
    Object.entries(COLUMNS).map(([key, col]) => [key, header.indexOf(col)]),
  ) as Record<keyof typeof COLUMNS, number>;

  const rows: SanggwonRow[] = [];
  for (const cells of lines.slice(1)) {
    const name = cells[idx.name]?.trim();
    if (!name) continue;
    rows.push({
      name,
      branch: cells[idx.branch]?.trim() ?? "",
      smallCode: cells[idx.smallCode]?.trim() ?? "",
      district: cells[idx.district]?.trim() ?? "",
      dong: cells[idx.dong]?.trim() ?? "",
      roadAddress: cells[idx.roadAddress]?.trim() ?? "",
      lat: parseCoord(cells[idx.lat]),
      lng: parseCoord(cells[idx.lng]),
    });
  }
  return rows;
}

export function isRamenBySanggwon(row: SanggwonRow): boolean {
  const full = row.name + row.branch;
  if (RAMEN_KEYWORDS.some((k) => full.includes(k))) return true;
  if (row.smallCode !== NOODLE_CODE) return false;
  return !EXCLUDE_KEYWORDS.some((k) => full.includes(k));
}
