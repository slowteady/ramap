import { tmToWgs84, type LocalDataRow } from "./localdata";
import { SHEET_HEADER } from "./sheet-parser";
import type { SanggwonRow } from "./sanggwon";

export type Candidate = {
  name: string;
  branch: string;
  roadAddress: string;
  lat: number | null;
  lng: number | null;
  sources: string[];
  coordMismatch: boolean;
};

/* 표기 차이 흡수 — "쇼부일본라멘 강남점" vs "쇼부" 류는 부분 포함으로 매칭 */
export function normalizeShopName(name: string): string {
  return name
    .replace(/\(주\)|주식회사|\(유\)/g, "")
    .replace(/[\s()\-·.,&'"!?~]/g, "")
    .toLowerCase();
}

const COORD_MISMATCH_METERS = 150;

function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const dLat = (a.lat - b.lat) * 111_320;
  const dLng = (a.lng - b.lng) * 111_320 * Math.cos((a.lat * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

function localCoord(row: LocalDataRow): { lat: number; lng: number } | null {
  if (row.x === null || row.y === null) return null;
  return tmToWgs84(row.x, row.y);
}

/* 한글 2자 상호("쇼부"·"킨카")가 흔해 부분 매칭 하한은 2자 — 1자는 오매칭 위험으로 배제 */
function namesMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
  return shorter.length >= 2 && longer.includes(shorter);
}

/* 체인 다지점 붕괴 방지 — 같은 이름이라도 위치가 다르면 별도 매장.
   매칭 허용 반경 500m(인허가 필지 대표점 오차 흡수), 좌표 없으면 주소의 구 단위 비교 */
const SAME_SHOP_METERS = 500;

function districtOf(address: string): string | null {
  return address.match(/\S+구(?=\s)/)?.[0] ?? null;
}

function locationCompatible(
  c: Candidate,
  sang: { lat: number | null; lng: number | null; roadAddress: string },
): boolean {
  if (
    c.lat !== null &&
    c.lng !== null &&
    sang.lat !== null &&
    sang.lng !== null
  )
    return (
      distanceMeters(
        { lat: c.lat, lng: c.lng },
        { lat: sang.lat, lng: sang.lng },
      ) <= SAME_SHOP_METERS
    );
  const a = districtOf(c.roadAddress);
  const b = districtOf(sang.roadAddress);
  if (a && b) return a === b;
  return true;
}

export function mergeCandidates(
  localRows: LocalDataRow[],
  sangRows: SanggwonRow[],
): Candidate[] {
  const candidates: Candidate[] = localRows.map((row) => {
    const coords = localCoord(row);
    return {
      name: row.name,
      branch: "",
      roadAddress: row.roadAddress,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      sources: ["인허가"],
      coordMismatch: false,
    };
  });

  for (const sang of sangRows) {
    const norm = normalizeShopName(sang.name + sang.branch);
    const match = candidates.find(
      (c) =>
        namesMatch(normalizeShopName(c.name + c.branch), norm) &&
        locationCompatible(c, sang),
    );
    if (match) {
      match.sources.push(sang.smallCode === "I20303" ? "상가I20303" : "상가");
      if (
        match.lat !== null &&
        match.lng !== null &&
        sang.lat !== null &&
        sang.lng !== null
      ) {
        const dist = distanceMeters(
          { lat: match.lat, lng: match.lng },
          { lat: sang.lat, lng: sang.lng },
        );
        if (dist > COORD_MISMATCH_METERS) match.coordMismatch = true;
      }
      if (match.lat === null && sang.lat !== null) {
        match.lat = sang.lat;
        match.lng = sang.lng;
      }
    } else {
      candidates.push({
        name: sang.name,
        branch: sang.branch,
        roadAddress: sang.roadAddress,
        lat: sang.lat,
        lng: sang.lng,
        sources: [sang.smallCode === "I20303" ? "상가I20303" : "상가"],
        coordMismatch: false,
      });
    }
  }
  return candidates;
}

export function candidatesToSheetTsv(candidates: Candidate[]): string {
  const lines = [SHEET_HEADER.join("\t")];
  for (const c of candidates) {
    const notes = [
      c.sources.includes("상가I20303") && !c.sources.includes("인허가")
        ? "I20303 발굴 — 라멘 여부 확인 필요"
        : "",
      c.coordMismatch ? "좌표 불일치(150m+) — 위치 확인 필요" : "",
    ]
      .filter(Boolean)
      .join(" / ");
    const cells: Record<string, string> = {
      id: "",
      상호: c.name,
      지점명: c.branch,
      주소: c.roadAddress,
      lat: c.lat !== null ? c.lat.toFixed(6) : "",
      lng: c.lng !== null ? c.lng.toFixed(6) : "",
      좌표출처: c.sources.includes("인허가") ? "LOCALDATA" : "상가정보",
      상태: "영업",
      태깅확신도: "추정",
      검증상태: "제보검토중",
      정보출처: `시딩v2(${c.sources.join("+")})`,
      메모: notes,
    };
    lines.push(SHEET_HEADER.map((h) => cells[h] ?? "").join("\t"));
  }
  return `${lines.join("\n")}\n`;
}
