/* 다지역 확장(2026-09-03, 경기부터) — 주소에서 시도·행정 단위 추출.
   클러스터 단위: 서울=구, 경기 등 도 지역=시·군 (구가 있는 시도 시 단위가 통용 스코프) */

const SIDO_MAP: Record<string, string> = {
  서울특별시: "서울",
  경기도: "경기",
  인천광역시: "인천",
  부산광역시: "부산",
  대구광역시: "대구",
  대전광역시: "대전",
  광주광역시: "광주",
  울산광역시: "울산",
  세종특별자치시: "세종",
  강원특별자치도: "강원",
  충청남도: "충남",
  충청북도: "충북",
  경상남도: "경남",
  경상북도: "경북",
  전북특별자치도: "전북",
  전남광주통합특별시: "전남광주",
  제주특별자치도: "제주",
};

export function sidoOf(address: string): string | null {
  const first = address.trim().split(/\s+/)[0] ?? "";
  return SIDO_MAP[first] ?? null;
}

const GU_SIDO = new Set([
  "서울",
  "인천",
  "부산",
  "대구",
  "대전",
  "광주",
  "울산",
  "전남광주",
]);

export function regionDistrictOf(address: string): string | null {
  const sido = sidoOf(address);
  if (!sido) return null;
  const tokens = address.trim().split(/\s+/);
  /* 특별시·광역시=구·군, 도=시·군 (구가 있는 시도 시 단위가 통용 스코프) */
  if (GU_SIDO.has(sido))
    return tokens[1]?.match(/^[가-힣]+(구|군)$/)?.[0] ?? null;
  return tokens[1]?.match(/^[가-힣]+(시|군)$/)?.[0] ?? null;
}
