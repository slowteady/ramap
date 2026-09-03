export const MAP_DEFAULT_CENTER = { lat: 37.5544, lng: 126.9877 };
export const MAP_DEFAULT_LEVEL = 8;
/* 줌 스코프별 클러스터 입도 (호갱노노 실측 티어링): 6~8 상권 / 9 구 / 10+ 시·도
   구 티어가 1레벨뿐인 건 라맵 클러스터 마커가 커서 — 레벨 10부턴 구 25개가 겹침(실측) */
export const CLUSTER_LEVEL_THRESHOLD = 6;
export const DISTRICT_LEVEL_THRESHOLD = 9;
export const CITY_LEVEL_THRESHOLD = 10;
/* 핀 확정 허용 최대 레벨 — 축척 100m(레벨 4)부터 개별 건물 조준 가능, 내주변 이동 레벨과 동일 */
export const PIN_PICK_MAX_LEVEL = 4;
