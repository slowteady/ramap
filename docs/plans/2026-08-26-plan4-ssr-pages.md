# 라맵 Plan 4: SSR 페이지 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 검색 유입 구조 — 매장 상세(`/shop/{slug}`), 지역·지역×장르 리스트(`/area/{area}`, `/area/{area}/{genre}`), 신규 오픈(`/new`), 홈 매장 포커스, sitemap.

**Architecture:** 전부 SSG(빌드 타임 shops.json). 파생 계산은 `entities/shop/model/` 순수 함수 + Vitest, 페이지는 `views/*` 서버 컴포넌트. 클라이언트 섬 추가 없음(상세의 "지도에서 보기"는 `/?focus={id}` 링크). JSON-LD는 순수 빌더 함수.

**Spec:** `docs/planning/17.페이지명세.md` §3·4·7·11, 목업 ShopDetail·SeoList·NewOpens 보드

## Global Constraints

- CLAUDE.md 전체(FSD·3분법·토큰·주석 금지·ramap-ui 스킬)
- UI 디테일 폴리싱은 미룸(사용자 지시) — 구조·정보 배치는 목업 준수, 사진 영역은 회색 placeholder
- 지역×장르 정식 URL 생성 규칙: **매장 3곳 이상 조합만** generateStaticParams 생성. 미달 조합은 생성하지 않음(지도 쿼리로 대체)
- 슬러그: 매장=`shop.id`, 지역=areaLabel(URL 인코딩), 장르=스프·계보 slug
- 브랜치 `feat/plan4-ssr-pages`

---

### Task 1: 파생 데이터 순수 함수

**Files:**
- Create: `src/entities/shop/model/derive.ts`, `derive.test.ts`, `src/entities/shop/model/structured-data.ts`, `structured-data.test.ts`
- Modify: `src/entities/shop/index.ts`

**Interfaces:**
```ts
shopById(shops, id): Shop | undefined
shopsByArea(shops, area): Shop[]                      // 폐업 제외
shopsByAreaGenre(shops, area, genre): Shop[]          // genre = SoupSlug | LineageSlug
listAreaGenrePages(shops, min = 3): {area, genre}[]   // 생성 규칙
groupByOpenedMonth(shops): {month: "2026-08", shops: Shop[]}[]  // openedAt 있는 open 매장, 최신 월부터
isNewOpen(shop, now): boolean                          // openedAt 90일 이내
restaurantJsonLd(shop): object                         // schema.org Restaurant
itemListJsonLd(shops, url): object / breadcrumbJsonLd(items): object / faqJsonLd(qas): object
```

- [ ] Step 1: 실패 테스트 — 3곳 미만 조합 제외, 월 그룹 정렬, 폐업 제외, JSON-LD 필수 필드
- [ ] Step 2: 구현 → PASS, tsc 클린
- [ ] Step 3: 커밋 `feat: SSR 파생 데이터·JSON-LD 순수 함수`

### Task 2: 매장 상세 `/shop/[slug]`

**Files:**
- Create: `src/views/shop-detail/ui/shop-detail-page.tsx`, `src/views/shop-detail/index.ts`, `src/app/shop/[slug]/page.tsx`

**요소(17번 §3, 목업 ShopDetail):** 히어로 placeholder + 뒤로가기 / 상호 + 대표 스프 배지 / 태그 라인 / 영업상태 라인(hours 문자열) / 정보 테이블(주문 방식·카에다마·웨이팅 아웃링크·좌석 — 값 있는 행만) / 대표 메뉴 / "{대표스프}가 뭔가요?" 링크 자리(가이드는 Plan 5 — href만) / 주소 + 네이버플레이스 아웃링크 / "지도에서 보기" → `/?focus={id}` / 정보 수정 제안 → `/report` href / Restaurant JSON-LD + generateMetadata

- [ ] Step 1: 구현, generateStaticParams(전 매장)
- [ ] Step 2: 커밋 `feat: 매장 상세 페이지`

### Task 3: 지역·지역×장르 리스트

**Files:**
- Create: `src/views/area-list/ui/area-list-page.tsx`, `src/views/area-list/index.ts`, `src/app/area/[area]/page.tsx`, `src/app/area/[area]/[genre]/page.tsx`

**요소(17번 §4, 목업 SeoList):** 간소 헤더 / 브레드크럼(서울 › 성수 › 니보시) / H1 "성수 (니보시) 라멘 맛집 N곳 (2026)" / 인트로 1문장 / 매장 카드 리스트(상호·태그·상태·편의, 상세 링크) / "지도에서 보기"(필터 프리셋 `/?soup=...`) / FAQ(택소노미 description 활용, FAQPage 마크업) / 교차 링크 칩(같은 지역 다른 생성 조합·같은 장르 다른 지역) / ItemList + BreadcrumbList JSON-LD

- [ ] Step 1: `/area/[area]` — generateStaticParams(전 지역), 지역 전체 리스트
- [ ] Step 2: `/area/[area]/[genre]` — listAreaGenrePages 통과 조합만 생성, 미달 조합 notFound
- [ ] Step 3: 커밋 `feat: 지역·지역×장르 리스트 페이지`

### Task 4: 신규 오픈 `/new`

**Files:**
- Create: `src/views/new-opens/ui/new-opens-page.tsx`, `src/views/new-opens/index.ts`, `src/app/new/page.tsx`
- Modify: 홈 헤더 "신규 오픈" 링크 활성화

**요소(17번 §7, 목업 NewOpens):** 헤더(신규 오픈 활성 탭) / 타이틀 + "인허가 데이터와 제보로 확인" 설명 / 월별 그룹(NEW 뱃지 + 상호·태그·오픈일, 상세 링크) / 빈 상태("이번 달 확인된 신규 오픈이 없어요") / 하단 제보 유도 배너

- [ ] Step 1: 구현 (groupByOpenedMonth 재사용)
- [ ] Step 2: 커밋 `feat: 신규 오픈 페이지`

### Task 5: 홈 포커스·sitemap·검증

**Files:**
- Modify: `src/views/home/model/use-shop-map.ts`(`?focus={id}` 초기 선택+panTo), `src/views/home/ui/shop-map.tsx`
- Create: `src/app/sitemap.ts`(홈·상세·지역·조합·new)

- [ ] Step 1: focus 파라미터 — 초기 마운트 시 해당 핀 panTo+선택(줌 5)
- [ ] Step 2: `npm run build && npm test && tsc` 클린 + 브라우저 검증(상세·지역·new·focus 동작)
- [ ] Step 3: 커밋·푸시, main 머지는 사용자 확인

## Self-Review 결과

- §3 중 미포함(의도): 사진 탭·저장 아이콘(Plan 5 RecordStore UI), 정적 지도 facade(사진·지도 리소스 없음 — placeholder), 라멘투데이 연동(후보 단계)
- §4 생성 규칙 중 "검색 수요" 조건은 실측 전이라 3곳+ 규칙만 적용
- §5 계보 랜딩·§6 장르 가이드는 Plan 5로 이월(localStorage 진행률이 RecordStore UI와 결합)
- 도보 거리("서울숲역 도보 6분")는 시트에 필드 없음 — 파트너 태깅 확장 미결로 기록
