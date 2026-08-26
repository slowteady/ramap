import proj4 from "proj4";
import { SHEET_HEADER } from "./sheet-parser";

export type LocalDataRow = {
  name: string;
  roadAddress: string;
  status: "open" | "closed";
  category: string;
  x: number | null;
  y: number | null;
};

export const RAMEN_KEYWORDS = [
  "라멘",
  "라-멘",
  "멘야",
  "라멘야",
  "츠케멘",
  "마제소바",
  "라면집",
] as const;

/* EPSG:5174 — LOCALDATA 좌표계 (중부원점 Bessel) */
const EPSG_5174 =
  "+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43";

const COLUMNS = {
  name: "사업장명",
  roadAddress: "도로명전체주소",
  status: "영업상태명",
  category: "업태구분명",
  x: "좌표정보(X)",
  y: "좌표정보(Y)",
} as const;

function parseCoord(raw: string | undefined): number | null {
  const v = raw?.trim();
  if (!v) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

export function parseLocalData(csv: string): LocalDataRow[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) return [];
  const header = lines[0].split(",");
  const idx = Object.fromEntries(
    Object.entries(COLUMNS).map(([key, col]) => [key, header.indexOf(col)]),
  ) as Record<keyof typeof COLUMNS, number>;

  const rows: LocalDataRow[] = [];
  for (const line of lines.slice(1)) {
    const cells = line.split(",");
    const name = cells[idx.name]?.trim();
    if (!name) continue;
    rows.push({
      name,
      roadAddress: cells[idx.roadAddress]?.trim() ?? "",
      status: cells[idx.status]?.trim() === "폐업" ? "closed" : "open",
      category: cells[idx.category]?.trim() ?? "",
      x: parseCoord(cells[idx.x]),
      y: parseCoord(cells[idx.y]),
    });
  }
  return rows;
}

export function isRamenCandidate(row: LocalDataRow): boolean {
  if (row.status !== "open") return false;
  return RAMEN_KEYWORDS.some((k) => row.name.includes(k));
}

export function tmToWgs84(x: number, y: number): { lat: number; lng: number } {
  const [lng, lat] = proj4(EPSG_5174, proj4.WGS84, [x, y]);
  return { lat, lng };
}

export function toSheetTsv(rows: LocalDataRow[]): string {
  const lines = [SHEET_HEADER.join("\t")];
  for (const row of rows) {
    const coords =
      row.x !== null && row.y !== null ? tmToWgs84(row.x, row.y) : null;
    const cells: Record<string, string> = {
      id: "",
      상호: row.name,
      주소: row.roadAddress,
      lat: coords ? coords.lat.toFixed(6) : "",
      lng: coords ? coords.lng.toFixed(6) : "",
      좌표출처: coords ? "LOCALDATA" : "",
      상태: "영업",
      태깅확신도: "추정",
      검증상태: "제보검토중",
      정보출처: "LOCALDATA 시딩",
    };
    lines.push(SHEET_HEADER.map((h) => cells[h] ?? "").join("\t"));
  }
  return `${lines.join("\n")}\n`;
}
