import { isRamenCandidate, type LocalDataRow } from "./localdata";
import { normalizeShopName, sameRoadAddress } from "./merge-candidates";

export type KnownRow = {
  name: string;
  branch: string;
  roadAddress: string;
  published: boolean;
};

export type RefreshResult = {
  newCandidates: LocalDataRow[];
  closed: { known: KnownRow; fresh: LocalDataRow }[];
  unmatched: KnownRow[];
};

/* 체인 다지점·재인허가가 흔해 상호 단독 비교는 금지 — 같은 매장 = 상호 포함관계 + 같은 건물 */
export function namesMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
  return shorter.length >= 2 && longer.includes(shorter);
}

const ROAD_CORE = /(\S+(?:로|길)\s*\d+(?:-\d+)?)/;
const stripDetail = (addr: string) =>
  addr.replace(/\(.*$/, "").replace(/,.*$/, "").trim();

/* 도로명+건물번호 — 2026 행정구역 개편(화성시 구 신설·인천 영종구·전남광주통합특별시)으로
   접두부가 바뀐 주소를 같은 건물로 묶는 열쇠 */
export function roadCore(addr: string): string | null {
  const m = stripDetail(addr).match(ROAD_CORE);
  return m ? m[1].replace(/\s+/g, "") : null;
}

function localityTokens(addr: string): string[] {
  const parts = stripDetail(addr).split(/\s+/);
  const m = stripDetail(addr).match(ROAD_CORE);
  const roadIdx = m ? parts.indexOf(m[1].split(/\s+/)[0]) : -1;
  return parts.slice(1, roadIdx > 0 ? roadIdx : undefined);
}

const sido = (addr: string) => stripDetail(addr).split(/\s+/)[0] ?? "";

/* 전국에 흔한 "중앙로 100" 류 동명 도로 오매칭을 막기 위해 시군구·읍면동 토큰이 하나는 겹쳐야 한다.
   세종처럼 시군구가 없는 주소는 시도 비교로 대신한다 */
export function sameBuilding(a: string, b: string): boolean {
  if (sameRoadAddress(a, b)) return true;
  const ca = roadCore(a);
  const cb = roadCore(b);
  if (!ca || !cb || ca !== cb) return false;
  const ta = localityTokens(a);
  const tb = localityTokens(b);
  if (ta.length === 0 || tb.length === 0) return sido(a) === sido(b);
  const set = new Set(ta);
  return tb.some((t) => set.has(t));
}

function sameShop(known: KnownRow, row: LocalDataRow): boolean {
  return (
    namesMatch(
      normalizeShopName(known.name + known.branch),
      normalizeShopName(row.name),
    ) && sameBuilding(known.roadAddress, row.roadAddress)
  );
}

export function classifyRefresh(
  fresh: LocalDataRow[],
  known: KnownRow[],
): RefreshResult {
  const matchedFresh = new Set<LocalDataRow>();
  const closed: RefreshResult["closed"] = [];
  const unmatched: KnownRow[] = [];

  for (const k of known) {
    const matches = fresh.filter((row) => sameShop(k, row));
    for (const m of matches) matchedFresh.add(m);
    if (matches.length === 0) {
      if (k.published) unmatched.push(k);
      continue;
    }
    if (matches.every((m) => m.status === "closed"))
      closed.push({ known: k, fresh: matches[0] });
  }

  const newCandidates: LocalDataRow[] = [];
  for (const row of fresh) {
    if (matchedFresh.has(row) || !isRamenCandidate(row)) continue;
    const dup = newCandidates.some(
      (n) =>
        normalizeShopName(n.name) === normalizeShopName(row.name) &&
        sameBuilding(n.roadAddress, row.roadAddress),
    );
    if (!dup) newCandidates.push(row);
  }

  return { newCandidates, closed, unmatched };
}
