---
status: 유효
updated: 2026-10-28
---

# 지도 홈 설계

홈(`/`)의 구조·동작·화면 명세와 코드 포인터.

## 코드 포인터

| 파일 | 역할 |
|---|---|
| `src/app/page.tsx` | `views/home` 재수출 + canonical `/`(URL 쿼리 변형 흡수) |
| `src/views/home/ui/home-page.tsx` | 서버 컴포넌트. `getShops()` → `toMapManifest()`로 핀을 만들어 `ShopMap`에 전달. 헤더(로고·검색·프로필), WebSite·Organization JSON-LD |
| `src/views/home/ui/shop-map.tsx` | 클라이언트 섬 조립 — 필터 칩 행, 지도, 내주변 버튼, 필터 시트, 목록 시트, 등록 시트, 검색 오버레이 |
| `src/views/home/model/use-shop-map.ts` | 지도 view-model 훅 — 어댑터 마운트, 마커·클러스터 렌더, 목록 핀 계산, `panToPin`·`panToArea`·`locate` |
| `src/views/home/model/use-area-focus.ts` | `?area=`를 읽어 지도 준비 후 그 지역으로 이동하고 URL에서 지운다 |
| `src/views/home/model/locate.ts` | 현위치 실패 원인(`GeolocationPositionError.code`)별 토스트 문구 |
| `src/views/home/model/use-map-filters.ts` | 필터 ↔ URL 동기화 훅 |
| `src/views/home/model/use-selected-shop.ts` | 선택 매장 `?shop` 훅(선택 push, 해제 replace) |
| `src/views/home/model/use-search-query.ts` | 검색 오버레이 `?search=1` 훅 |
| `src/views/home/model/use-recent-searches.ts` | 최근 검색 localStorage 훅 |
| `src/views/home/model/filter.ts` | 필터 파싱·직렬화·적용·축별 개수(순수) |
| `src/views/home/model/filter-axes.ts` | 축 정의(종류·국물·스타일), 노출 값(`visibleItems`), 칩 개수 |
| `src/views/home/model/label-collision.ts` | 마커 라벨 겹침 계획(`planMarkers`), 범위·거리·정렬(순수) |
| `src/views/home/model/markers.ts` | 클러스터 → 지도 클러스터 마커 변환 |
| `src/views/home/model/search.ts`, `hangul.ts` | 검색 제안 생성·매칭·오타 폴백(순수) |
| `src/views/home/ui/filter-chips.tsx`, `filter-sheet.tsx` | 필터 칩 행, 값 선택 시트 |
| `src/views/home/ui/shop-sheet.tsx` | 상시 바텀시트(목록 모드·매장 카드 모드) |
| `src/views/home/ui/search-bar.tsx`, `search-overlay.tsx` | 헤더 검색 아이콘, 검색 오버레이 |
| `src/views/home/ui/map-fallback.tsx` | 지도 실패 시 동네별 목록 |
| `src/views/home/ui/auth-entry.tsx` | 헤더 프로필 아이콘(로그인 기능 켜졌을 때만, `/me` 링크) |
| `src/shared/map/types.ts` | `MapAdapter` 인터페이스, `MapMarker`·`MarkerState`·`MapView`, 카카오 전역 최소 타입 |
| `src/shared/map/kakao-loader.ts` | SDK 스크립트 로더(`autoload=false`, 키 없음·실패 reject, 중복 호출 공유) |
| `src/shared/map/kakao-adapter.ts` | `MapAdapter` 카카오 구현 — CustomOverlay 마커·클러스터 DOM, diff 렌더, 뷰포트 이벤트 |
| `src/shared/config/map.ts` | 기본 중심·줌, 클러스터 티어 레벨, 핀 확정 최대 레벨 |
| `src/entities/shop/api/get-shops.ts` | `data/shops.json` 읽기(server-only, `React.cache`) |
| `src/entities/shop/model/map-manifest.ts` | `ShopPin`, `toMapManifest` |
| `src/entities/shop/model/area-clusters.ts` | `buildAreaClusters`(티어별 묶기) |
| `src/entities/shop/model/derive.ts` | `isNewOpen`(오픈 90일) |
| `src/app/globals.css` | `.map-tone` 타일 톤다운 |
| `e2e/home.spec.ts`, `e2e/map-fallback.spec.ts` | 지도·클러스터·필터·검색 여정, 폴백 여정 |

환경변수: `NEXT_PUBLIC_KAKAO_MAP_KEY`. 없으면 폴백 경로로 간다.

## 화면 구성

```
[로고]                         [검색][프로필]
[↺][종류▾][국물▾][스타일▾][새로 오픈][자가제면][본토직영][안 가본 집][저장한 곳] → [라멘집 등록]
┌──────────────── 풀맵 ────────────────┐
│ 마커·클러스터                [◎ 내주변] │
└──────────────────────────────────────┘
[상시 바텀시트 — 목록 모드 ↔ 매장 카드 모드]
```

- 홈은 `h-dvh` 고정, 페이지 스크롤 없음([결정](decisions/0001-full-map-nonmodal-sheet.md)). 지도 아래 SSR 관문 섹션·스크롤 푸터도 없다 — 몰입형 지도 홈에 맞지 않고 풀맵이 아래 콘텐츠를 가린다. 랜딩 발견은 `sitemap.xml`·`robots.txt`와 랜딩 간 교차 링크가 맡는다
- 그 위에 뜨는 것: 필터 값 시트(모달), 검색 오버레이(풀스크린), 등록 시트([라멘집 등록] 또는 검색 빈 결과)

## 데이터 흐름

1. 서버: `getShops()` → `toMapManifest()` — 좌표 없는 매장·폐업 매장 제외(휴업은 포함). 핀마다 `isNew`를 빌드 시점에 계산
2. 클라이언트 `ShopMap`: 내 기록(`useRecords`)에서 완식 id·저장 id 집합을 만든다
3. "안 가본 집"·"저장한 곳" 토글로 핀을 거른다(컴포넌트 로컬 상태 — URL에 없음)
4. URL 필터를 `applyFilters`로 적용 → 지도 마커·클러스터·목록이 같은 결과를 쓴다
5. 서버 재조회 없음 — 지도 이동이 멈추면 마커·목록이 바로 갱신된다. 전량이 SSG로 내려와 있어 "이 지역 재검색" 버튼(서버 조회 비용을 아끼는 장치)이 필요 없다

## URL 쿼리

| 키 | 값 | 기록 방식 | 비고 |
|---|---|---|---|
| `soup`, `form`, `lineage` | 슬러그 콤마 목록 | replace | 정렬 고정, 빈 축 생략, 모르는 슬러그 무시. 특성(자가제면·본토직영)은 `lineage`에 들어간다 |
| `new` | `1` | replace | 새로 오픈만 |
| `shop` | 매장 id | 선택 push / 해제 replace | 선택 시 `search` 제거. 필터 변경 시 유지 |
| `search` | `1` | 열기 push / 닫기 replace | 검색어는 URL에 없음 |
| `area` | 지역 이름(`areaLabel`) | 읽은 뒤 replace로 제거 | 지도 준비 후 그 지역 핀 중심으로 이동(`panToArea`, 검색의 지역 선택과 같음). 지역 페이지의 "지도로 보기"가 넘긴다 |
| `report`, `pick` | 등록 시트·핀 피커 | — | [report design](../report/design.md) |

원칙: 공유할 가치가 있는 지도 상태는 URL이 원천이다(뒤로가기·공유 해결). 선택·오버레이 열기는 push(뒤로가기로 닫힘), 해제·필터 변경은 replace(히스토리 스팸 방지). 검색어는 선택 즉시 닫히는 내비게이터라 공유 가치가 없어 싣지 않는다. "안 가본 집"·"저장한 곳"은 내 기록에 따른 개인 상태라 로컬 상태다.

## 필터

### 칩 행

| 칩 | 노출 조건 | 동작 |
|---|---|---|
| ↺ 초기화 | 축 칩 선택이 1개 이상 | 전체 필터 해제 |
| 종류 / 국물 / 스타일 | 항상 | 탭 → 값 시트(해당 축 탭). 선택 시 레드 테두리·틴트 + 선택 개수 |
| 새로 오픈 | 오픈 90일 내 매장이 1곳 이상 | `?new=1` 토글 |
| 자가제면, 본토직영 | 항상 | 특성 토글(`lineage`). 스타일 칩 개수에서는 제외 |
| 안 가본 집 | 완식 기록이 있을 때 | 완식 매장 숨김(로컬 상태) |
| 저장한 곳 | 저장 기록이 있거나 켜져 있을 때 | 저장 매장만(로컬 상태) |
| 라멘집 등록 | 항상(칩 행 오른쪽 고정, 레드 pill) | `?report=new` |

- 칩 행은 가로 스크롤 + 마우스 드래그 스크롤(`useDragScroll`) + 오른쪽 페이드 마스크
- 칩은 한 칩 = 한 축이다. 값 칩을 축과 섞으면 "돈코츠 칩과 이에케 칩이 배타인가 포함인가"를 정의할 수 없다(이에케 국물이 사실상 돈코츠쇼유)

### 값 시트

- 상단 탭(종류·국물·스타일)으로 축 전환, 제목 옆 ? 버튼 → 값 설명 팝오버(설명이 있는 값만 — 스타일의 이에케·지로계)
- 3열 값 그리드, 값마다 결과 수. 결과 수 = 전체 핀에 **그 축을 뺀 나머지 필터**를 적용했을 때의 개수(지도 범위 무관)
- 결과 0이고 선택 안 된 값은 비활성
- 숨김 값: 기타(`etc-form`·`etc-soup`), 특성(칩 행이 담당)
- 적용된 값 전체(축 무관)를 X 칩으로 나열 → 개별 해제
- 하단: [초기화] + [매장 N곳 보기](닫기). 값 탭은 즉시 반영 — Apply 버튼 없음(탐색형 서비스 + 가벼운 데이터셋). 필터를 바꿔도 지도 뷰포트는 움직이지 않는다
- 의미: 축 간 AND, 축 내 OR, `new`는 AND

## 마커·클러스터

### 축척 티어

| 카카오 레벨 | 표시 | 클러스터 탭 |
|---|---|---|
| 1~5 | 개별 마커 | — |
| 6~8 | 상권 클러스터(동네라벨, 없으면 구) | 레벨 5로 줌인 + 중심 이동 |
| 9 | 구 클러스터 | 레벨 8 |
| 10+ | 시·도 클러스터 | 레벨 9 |

- 클러스터 = "이름 개수" 알약(흰 배경·레드 테두리·개수 레드). 필터 결과로 계산([결정](decisions/0005-area-clusters-zoom-tiers.md))
- 기본 뷰: 서울 중심, 레벨 8

### 개별 마커

- 화면 범위 + 30% 버퍼 안의 핀만 그린다
- 모든 마커는 라멘 레드 기반 단색. 마커가 드러내는 정보는 상호 라벨과 상태(선택·신규·저장·완식)이고, 스프는 필터와 목록·카드의 장르 칩으로 전달한다 — 스프 값 수가 색 구분 한계를 넘고 유채색 1색 예산([ui design](../ui/design.md))과도 맞지 않는다

| 상태 | 모양 |
|---|---|
| 기본 | 레드 도넛 22px |
| 선택 | 도넛 28px + 라벨 글자 레드, 항상 라벨 |
| 저장 | 근흑 원 + 흰 북마크 |
| 완식 | 흰 원 + 레드 테두리 + 레드 체크 |

- 라벨: 점 아래 흰 pill에 상호(굵기 800). 신규면 라벨 앞 레드 "NEW" 칩(완식 마커 제외). 텍스트 할로 대신 불투명 pill이라 타일 POI·도로색과 간섭하지 않는다. 타일 자체도 `.map-tone` 저채도 필터로 가라앉힌다 — SDK가 만드는 타일 `img`에 유틸 클래스를 붙일 수 없어 컨테이너 스코프 CSS 규칙을 쓴다
- 겹침(`planMarkers`): 우선순위 선택 > 신규 > 저장 > 기본 > 완식 순으로 배치. 겹치면 하위는 점으로 강등, 라벨을 가리는 기본·완식 점은 숨김(신규·저장 점은 유지). 위치는 옮기지 않는다(구글 지도 collision behavior). 완식 마커를 회색조로 두지 않는 것은 비활성처럼 읽히기 때문
- 그리기 순서: 선택 > 라벨 > 점
- 터치 타깃: 투명 패딩 10px로 44px 확보
- 지도 빈 곳 탭 → 선택 해제
- 어댑터는 마커 키별 diff 렌더(바뀐 것만 DOM 교체), 뷰포트 이벤트는 `idle` 후 150ms 디바운스
- 지도 렌더는 `MapAdapter` 인터페이스 뒤에 있다(지도사 교체 대비 이음새 → [platform 결정](../platform/decisions/0001-kakao-map-adapter.md)). 마커·클러스터·필터·선택 계산은 SDK와 무관한 순수 함수이고 어댑터는 그리기·이벤트만 맡는다. SDK 로드 실패(키 없음 포함)는 어댑터 생성 실패로 드러나 호출부가 폴백으로 전환한다
- 현위치 점: 파란 원(구글 내 위치 관례)

## 상시 바텀시트

vaul Drawer, 비모달·`dismissible=false`. 제스처 규율은 `ramap-ui` 스킬. 스냅 높이는 실기기 확정 전 임시값.

| 모드 | 스냅 |
|---|---|
| 목록 | 32px(핸들만) / 72px(접힘) / 45% / 88% |
| 매장 카드 | 72px / 280px |

### 목록 모드

- 제목 "이 지역 매장 N곳" — 버퍼 없는 실제 화면 범위의 필터 결과, 화면 중심 가까운 순
- 행: [NEW] 상호 [완식 배지] [북마크] / 메타(거리·동네·"M/D 오픈"·영업시간) / 장르 칩
- 목록 스크롤은 88% 스냅에서만 열린다(제스처 충돌 회피). 세로 8px 넘게 움직인 탭은 무시
- 행 탭 → 선택 + 레벨 5로 이동
- 0건: "이 지역에 조건에 맞는 매장이 없어요. 지도를 움직이거나 필터를 풀어보세요."

### 매장 카드 모드

마커·목록·검색으로 선택하면 카드로 전환(280px). 선택 매장이 필터 결과에 없으면 카드를 띄우지 않는다.

| 순서 | 요소 |
|---|---|
| 1 | [‹ 목록으로] [NEW] 상호(상세 링크) · [길찾기 ›](카카오맵 길찾기 링크) |
| 2 | 메타 한 줄: 거리 · 동네 · "M/D 오픈" · 영업 정보(영업시간·브레이크·휴무 또는 "휴업 중") |
| 3 | 완식 횟수 상태 줄 `VisitSummaryLine` — [records design](../records/design.md) |
| 4 | 장르 칩 |
| 5 | 특성·편의 태그(자가제면·식권기 등) |
| 6 | 대표 메뉴 1개(이름·가격) |
| 7 | 기록 버튼 `RecordButtons`(저장·완식) — [records design](../records/design.md) |

- 2~6 영역 전체가 `/shop/{slug}` 링크. 시트 full 확장은 없다 — 상세는 고유 URL을 가진 SSR 페이지(SEO 단위)라 페이지로 이동한다
- 실시간 "영업중"은 표시하지 않는다(`OpenStatusBadge` — 시간 정보만)([공통 결정](../../decisions/0009-no-live-open-status.md))
- 닫기: ‹ 버튼·지도 빈 곳 탭·뒤로가기 → 목록 모드 45% 스냅 / 카드를 72px로 끌어내림 → 목록 모드 접힘

### 선택 진입

| 진입 | 동작 |
|---|---|
| 마커 탭 | `?shop` push. 지도 이동 없음 |
| 목록 행·검색 매장 | `?shop` push + 레벨 5로 그 매장 이동 |
| `?shop` 딥링크 | 지도 준비 직후 1회 레벨 5로 그 매장 이동 |

## 현위치

- 지도 준비 후 오른쪽 아래 [◎ 내주변] pill
- 탭 → 브라우저 위치 권한 요청 → 성공 시 현위치 점 + 레벨 4로 이동. 실패하면 원인별 토스트 — 권한 거부: "위치 접근을 허용하면 내 주변 라멘집을 볼 수 있어요" / 위치 못 찾음·시간 초과: "내 위치를 찾지 못했어요. 잠시 뒤에 다시 눌러 주세요" / 브라우저 미지원: "이 브라우저에서는 내 위치를 찾을 수 없어요"
- 진입 시에는 권한을 요청하지 않는다 — 버튼을 누른 맥락에서 요청해야 수락률이 높다
- 거리(목록·카드)는 현위치를 얻은 뒤에만 표시

## 검색

헤더 검색 아이콘 → `?search=1` 풀스크린 오버레이, 아래→위 전환, 뒤로가기 = 닫기. 진입이 풀폭 검색바가 아니라 아이콘인 것은 1차 탐색이 장르 필터이고 검색은 보조 동선이라서다.

서버·API·디바운스 없이 클라이언트 전량에서 1글자부터 즉시 제안한다. 결과 리스트 화면은 없고 제안 선택이 곧 필터 적용·지도 이동이다(지도 + 시트를 유지하는 캐치테이블 패턴). 인기 검색어 섹션은 없다.

| 상태 | 화면 |
|---|---|
| 헤더 | [‹ 닫기] [검색 아이콘 + input(자동 포커스, 플레이스홀더 "라멘집·장르·동네 검색") + X 지우기] |
| 입력 전 | "장르로 찾기" — 매장 있는 국물 값 칩 / "최근 검색" — 최대 10개, 시계 아이콘, 개별 X, 전체 삭제. 최근 검색 탭 = 입력란에 채움 |
| 입력 중 | 장르(레드 검색 아이콘 + "N곳", 최대 3) → 동네(핀 아이콘 + "N곳", 최대 2) → 매장(상호 + 동네, 최대 10) |
| 빈 결과 | "검색 결과가 없어요" / "찾는 라멘집이 라맵에 없다면 알려주세요" / [라멘집 등록하기] → 등록 시트 |

- 매칭 대상: 장르 = 축 3개의 노출 값 라벨(매장 0곳 값 제외) / 동네 = `areaLabel` / 매장 = 상호, 상호+지점명, 지점명, 동네, 세부 국물, 대표 메뉴
- 순위: 접두 > 부분 > 초성 접두 > 초성 부분, 그다음 영타→한글 변환 후 같은 순서. 장르·동네는 같은 순위면 매장 수 많은 순, 매장은 상호순
- 장르·동네·매장 모두 없으면 매장에 한해 편집거리 1 이내 오타 폴백(2글자 이상)
- 하이라이트: 일치 부분은 보통 굵기 회색, 나머지(완성부)는 볼드. 초성·영타 변환으로 찾은 제안은 하이라이트 없음
- 선택 결과

| 선택 | 동작 | 최근 검색 저장 |
|---|---|---|
| 장르 | 그 축을 해당 값 하나로 교체해 필터 적용 + 닫기 | 라벨 |
| 동네 | 그 동네 핀 평균 좌표로 레벨 5 이동 + 닫기 | 동네명 |
| 매장 | `?shop` 선택(같은 내비게이션에서 `search` 제거) + 그 매장으로 이동 | 상호 |

- 최근 검색 저장 키 `ramap.recent-searches.v1`. 저장 불가 환경에서는 세션 내 상태만

## 신규 오픈 표시

기준: 오픈일(인허가일) 90일 이내, 빌드 시 계산(`isNewOpen`). 90일은 네이버·배민·Google 신규 배지와 같은 기준이다. 오픈일은 절대일로 표기한다(상대 표기 "3일 전"을 쓰는 서비스가 없다). 전용 페이지는 없다 → [shop-pages 요구사항](../shop-pages/requirements.md). 매장 상세의 NEW 칩·"오픈 YYYY.M" 행은 [shop-pages 설계](../shop-pages/design.md).

| 위치 | 표시 |
|---|---|
| 지도 마커 | 라벨 앞 레드 "NEW" 칩, 라벨 충돌 시 일반보다 우선 |
| 목록 행 | 상호 앞 NEW 칩 + 메타 "M/D 오픈"(절대일) |
| 매장 카드 | 상호 앞 NEW 칩 + 메타 "M/D 오픈" |
| 필터 칩 | "새로 오픈"(`?new=1`) — 해당 매장 1곳 이상일 때만 |

## 지도 실패 폴백

- SDK 로드 실패 또는 키 없음 → 상태 `failed`. 로딩 중에는 "지도를 불러오는 중"
- 실패 시 지도 자리에 `MapFallback`: 안내 "지도를 불러오지 못했어요. 목록으로 보여드릴게요." + 필터 결과를 동네(동네라벨 → 구 → "서울")별로 묶은 매장 카드 목록(장르·영업 정보)
- 필터 칩 행은 그대로 동작. 목록 바텀시트와 내주변 버튼은 지도 준비 후에만 뜬다
- 원칙: [ui design](../ui/design.md#지도-실패-폴백)

## 등록 핀 피커 연결

지도가 준비되면 등록 시트에 지도 제어(`containerRef`·`view`·`setLevel`·`panTo`·`coordsAt`)를 넘긴다. 핀 피커 모드(`pick`) 동안 목록 시트는 숨긴다. 핀 확정 허용 최대 레벨 4(`PIN_PICK_MAX_LEVEL`). 등록 흐름 자체는 [report design](../report/design.md).

## 분석 이벤트

`shared/lib/analytics`의 `track`: `filter_changed`, `shop_selected`(source: map·list·search), `hide_visited_toggled`, `saved_only_toggled`, `locate_clicked`(granted), `map_load_failed`, `search_result_selected`(kind: shop·genre·area).

## 테스트

- 순수 함수: `filter.test.ts`, `filter-axes.test.ts`, `label-collision.test.ts`, `markers.test.ts`, `search.test.ts`, `hangul.test.ts`, `shared/map/kakao-loader.test.ts`, `entities/shop/model/map-manifest.test.ts`·`area-clusters.test.ts`
- 훅·컴포넌트: `use-map-filters.test.tsx`, `use-selected-shop.test.tsx`, `use-recent-searches.test.tsx`, `filter-chips.test.tsx`
- e2e: `e2e/home.spec.ts`, `e2e/map-fallback.spec.ts`. 지도 오버레이 클릭은 `dispatchEvent("click")`
- 어댑터(카카오 DOM)는 jsdom 테스트 불가 — 브라우저·e2e로 검증
