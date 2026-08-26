# 라맵 Plan 3: 지도 홈 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 지도 홈 코어 — 카카오맵 어댑터, 스프 색 마커, 동네 시맨틱 클러스터, 축 칩 필터(URL 동기화), peek/half 바텀시트, 지도 실패 폴백.

**Architecture:** 서버 컴포넌트(views/home)가 shops.json에서 지도용 슬림 매니페스트를 만들어 클라이언트 섬(ShopMap)에 props로 전달. 지도 렌더는 MapAdapter 인터페이스 뒤의 KakaoMapAdapter(이음새 — Plan B 교체 대비). 필터·클러스터·선택은 전부 순수 함수 + 얇은 view-model 훅. 공유 상태 원천은 URL 쿼리.

**Tech Stack:** 카카오맵 JS SDK(env `NEXT_PUBLIC_KAKAO_MAP_KEY`), vaul Drawer(스냅), 기존 스택. 신규 라이브러리 없음.

**Spec:** `docs/planning/17.페이지명세.md` §1·2·9·11, `13.UI설계원칙.md` B·C·D절, `09.기술타당성.md`(어댑터·쿼터), 목업 아트보드 1·2·9

## Global Constraints

- CLAUDE.md 전체(FSD·3분법·'use client' 잎 한정·토큰·주석 금지·ramap-ui 스킬)
- 마커·클러스터·필터 계산은 전부 `model/` 순수 함수 + Vitest. 훅은 바인딩만
- 지도 로드 실패 시 리스트 폴백 + 배너 필수 (망고플레이트 반면교사 — 17번 §11)
- 필터 상태는 URL 쿼리(`?soup=niboshi,shio&form=ramen&lineage=iekei`) — 공유·뒤로가기 대응
- 스프 마커 색: 도트로 표시하되 팔레트는 임시 6색(미결 1번 — 실기기 확정 전까지 `shared/config`에 격리)
- 브랜치 `feat/plan3-map-home`

---

### Task 1: MapAdapter 인터페이스 + 카카오 SDK 로더

**Files:**
- Create: `src/shared/map/types.ts`, `src/shared/map/kakao-loader.ts`, `src/shared/map/kakao-adapter.ts`, `src/shared/config/map.ts`
- Test: `src/shared/map/kakao-loader.test.ts`

**Interfaces:**
- Produces:
```ts
type LatLng = { lat: number; lng: number };
type MapMarker = { id: string; pos: LatLng; label: string; color: string; state: "default" | "selected" | "visited" };
type MapClusterMarker = { id: string; pos: LatLng; label: string };
interface MapAdapter {
  mount(el: HTMLElement, center: LatLng, level: number): void;
  destroy(): void;
  setMarkers(markers: MapMarker[], onTap: (id: string) => void): void;
  setClusters(clusters: MapClusterMarker[], onTap: (id: string) => void): void;
  onViewportChange(cb: (level: number) => void): void;
  panTo(pos: LatLng): void;
}
createKakaoAdapter(): Promise<MapAdapter>   // SDK 로드 실패 시 reject
buildSdkUrl(key: string): string            // 순수 — 테스트 대상
loadKakaoSdk(key: string | undefined): Promise<void>  // key 없음/로드 실패 reject, 중복 호출 멀티플렉스
```
- `shared/config/map.ts`: 서울 기본 중심, 기본 줌, 클러스터 전환 줌 임계, 임시 스프 색 6종

- [ ] **Step 1: 실패 테스트** — buildSdkUrl이 autoload=false·libraries 없이 key 포함 URL 생성 / loadKakaoSdk가 key undefined면 reject / 같은 key 재호출 시 script 태그 1개(멀티플렉스, jsdom)
- [ ] **Step 2:** FAIL → 구현(kakao 전역 타입은 최소 선언 `declare global`) → PASS, tsc 클린
- [ ] **Step 3:** kakao-adapter.ts 구현 — CustomOverlay로 라벨 필 마커(흰 배경·스프 색 도트·상호, 선택 시 ink 반전, visited 회색조 — 13번 C절), 클러스터는 알약형 CustomOverlay. jsdom 테스트 불가 영역이므로 어댑터는 Task 6 브라우저 검증으로
- [ ] **Step 4:** 커밋 `feat: MapAdapter·카카오 SDK 로더 (이음새 4)`

### Task 2: 지도 데이터 계층 (server + 순수 함수)

**Files:**
- Create: `src/entities/shop/api/get-shops.ts`, `src/entities/shop/model/map-manifest.ts`, `src/entities/shop/model/area-clusters.ts`, `src/entities/shop/index.server.ts`
- Test: `src/entities/shop/model/map-manifest.test.ts`, `src/entities/shop/model/area-clusters.test.ts`
- Modify: `src/entities/shop/index.ts`(순수 함수 export 추가)

**Interfaces:**
- Produces:
```ts
// api (server-only): getShops(): Promise<Shop[]>  — data/shops.json + React.cache
type ShopPin = { id: string; name: string; lat: number; lng: number; primarySoup: SoupSlug; soups: SoupSlug[]; forms: FormSlug[]; lineages: LineageSlug[]; areaLabel: string | null; status: ShopStatus };
toMapManifest(shops: Shop[]): ShopPin[]            // 좌표 없는·폐업 매장 제외
type AreaCluster = { area: string; count: number; lat: number; lng: number };
buildAreaClusters(pins: ShopPin[]): AreaCluster[]  // areaLabel별 count + centroid, 라벨 없는 핀 제외
```

- [ ] **Step 1: 실패 테스트** — manifest가 좌표 없는 매장·폐업 제외 / 클러스터가 동네별 개수·중심좌표 계산 / 빈 입력 빈 배열
- [ ] **Step 2:** FAIL → 구현 → PASS. `index.server.ts`에 getShops, `index.ts`에 순수 함수·타입 (CLAUDE.md 4번 이중 진입점)
- [ ] **Step 3:** 커밋 `feat: 지도 데이터 계층 — 매니페스트·동네 클러스터`

### Task 3: 필터 모델 + URL 동기화 훅

**Files:**
- Create: `src/views/home/model/filter.ts`, `src/views/home/model/use-map-filters.ts`
- Test: `src/views/home/model/filter.test.ts`

**Interfaces:**
- Produces:
```ts
type MapFilters = { soups: SoupSlug[]; forms: FormSlug[]; lineages: LineageSlug[] };
parseFilters(params: URLSearchParams): MapFilters          // 미지 슬러그 무시
serializeFilters(f: MapFilters): string                    // 빈 축 생략, 정렬 고정
applyFilters(pins: ShopPin[], f: MapFilters): ShopPin[]    // 축 간 AND, 축 내 OR
countBySoup(pins: ShopPin[], f: MapFilters): Record<SoupSlug, number>  // 해당 축 제외한 필터 기준 — 값 시트의 결과 수
// use-map-filters: { filters, apply(next), clear(), isActive } — router.replace(scroll:false)로 URL 반영
```

- [ ] **Step 1: 실패 테스트** — parse/serialize 왕복, 미지 슬러그 무시, AND/OR 조합, countBySoup가 자기 축 제외 계산
- [ ] **Step 2:** FAIL → 구현 → PASS
- [ ] **Step 3:** 커밋 `feat: 필터 모델·URL 동기화 훅`

### Task 4: 지도 섬 (ShopMap) + 실패 폴백

**Files:**
- Create: `src/views/home/ui/shop-map.tsx`('use client'), `src/views/home/ui/map-fallback.tsx`, `src/views/home/model/use-shop-map.ts`

**동작 (17번 §1):**
- use-shop-map 훅: 어댑터 마운트, 줌 임계 기준 개별 마커↔동네 클러스터 전환(필터 반영), 마커 탭→선택 id, 클러스터 탭→panTo+줌인, 로드 실패→`failed` 상태
- 실패 시 map-fallback: "지도를 불러오지 못했어요" 배너 + 동네별 매장 리스트(ShopCard 재사용) — env 키 없음도 이 경로
- [ ] **Step 1:** 구현 (계산은 Task 2·3 순수 함수 재사용, 훅은 바인딩만)
- [ ] **Step 2:** 키 없는 상태에서 dev 서버 → 폴백 렌더 브라우저 확인
- [ ] **Step 3:** 커밋 `feat: 지도 섬 + 실패 폴백`

### Task 5: 필터 칩 바 + 값 선택 시트 + peek 카드

**Files:**
- Create: `src/views/home/ui/filter-chips.tsx`, `src/views/home/ui/filter-sheet.tsx`, `src/views/home/ui/shop-peek-card.tsx`

**동작 (17번 §1·2·9, 목업 1·2·9):**
- 칩 3개(형태/스프/계보, 선택 시 라벨 반영 "스프 · 니보시" + ink 반전) — 탭 시 해당 축 값 시트(Drawer): 값 그리드 + 현재 결과 수 + 0건 비활성, 즉시 반영, "매장 N곳 보기" 닫기 CTA. 계보 값엔 한 줄 설명
- peek 카드(vaul 스냅 [0.22, 0.66]): 영업상태 우선 → 상호 → 태그 스탯로우 → 동네. 선택 마커와 동기화, X·지도 탭 닫기. half엔 상세 필드 추가(대표 메뉴). 좌우 스와이프 순회는 pointer 이벤트 기반 최소 구현(±1 매장)
- [ ] **Step 1:** 구현 (ramap-ui 스킬 준수 — 토큰·pill·금지 시그니처)
- [ ] **Step 2:** 커밋 `feat: 필터 UI·peek 카드`

### Task 6: 홈 조립 + 검증

**Files:**
- Create: `src/views/home/ui/home-page.tsx`, `src/views/home/index.ts`
- Modify: `src/app/page.tsx`(재수출), 삭제: `src/app/dev/sheet/`(데모), 스모크 화면 제거
- Create: `.env.local.example`(`NEXT_PUBLIC_KAKAO_MAP_KEY=`)

- [ ] **Step 1:** home-page: 헤더(라맵 텍스트 로고 임시 + 지도/신규 오픈 + 제보하기 버튼) + 칩 바 + ShopMap + 하단 SSR 관문 섹션(동네 바로가기 링크 — href만, Plan 4 대상)
- [ ] **Step 2:** `npm run build && npm test && tsc` 클린 + 브라우저 검증: 폴백 상태 스크린샷, (키 있으면) 실지도 마커·필터·시트 동작 스크린샷
- [ ] **Step 3:** 커밋·푸시, main 머지는 사용자 확인

## Self-Review 결과

- 17번 §1 커버: 마커 상태·시맨틱 클러스터·즉시 필터·URL화·0건 처리·폴백. 미포함(의도): "이 지역 재검색"(SSG 전체 로드라 재검색 개념 없음 — 전량 표시), 현위치 버튼(권한 UX 포함 Plan 5), 저장·완식 연동(Plan 5), 온보딩(Plan 5)
- 스프 색 팔레트는 config 격리로 미결 1번 존중. 시트 스냅 값은 임시(미결 5번)
- 타입 일관성: ShopPin·MapFilters·MapAdapter 시그니처는 본 문서 Interfaces가 유일 정의
