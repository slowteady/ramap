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
};

export function sidoOf(address: string): string | null {
  const first = address.trim().split(/\s+/)[0] ?? "";
  return SIDO_MAP[first] ?? null;
}

export function regionDistrictOf(address: string): string | null {
  const sido = sidoOf(address);
  if (!sido) return null;
  const tokens = address.trim().split(/\s+/);
  if (sido === "서울") return tokens[1]?.match(/^[가-힣]+구$/)?.[0] ?? null;
  return tokens[1]?.match(/^[가-힣]+(시|군)$/)?.[0] ?? null;
}
