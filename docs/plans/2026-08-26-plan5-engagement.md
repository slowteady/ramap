# 라맵 Plan 5: 참여 기능 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 완식·저장 기록 UI(RecordStore 연결), 장르 가이드(`/guide/{장르}`), 계보 랜딩(`/style/{계보}`), 온보딩, 제보 폼(`/report`, Supabase 이음새), 현위치·기록 내보내기.

**Architecture:** 기록은 전 화면이 `use-records` 훅(RecordStore 경유 — CLAUDE.md 금지사항 4)으로만 접근. 가이드·계보 콘텐츠는 `entities/shop/model/guide-content.ts` as const(도메인 콘텐츠 단일 원천, 파트너 감수 표기). 제보 전송은 `ReportSink` 이음새 — env 없으면 안내 폴백, 있으면 Supabase REST fetch(supabase-js 미도입 유지).

**Spec:** `17.페이지명세.md` §5·6·8·10·11, `16.제보설계.md`, 목업 StyleLanding·GenreGuide·ReportForm·Onboarding·HalfSheet

## Global Constraints

- CLAUDE.md 전체. UI 폴리싱은 후순위(사용자 지시) — 구조·정보 배치만 목업 준수
- localStorage 접근은 전부 RecordStore·전용 스토리지 모듈 경유, SSR 안전(typeof window 가드)
- 신규 라이브러리 없음 (Supabase도 REST fetch)
- 브랜치 `feat/plan5-engagement`

---

### Task 1: 기록 코어 — use-records 훅 + peek/상세 버튼 + visited 마커

**Files:**
- Create: `src/features/records/model/use-records.ts`, `src/features/records/ui/record-buttons.tsx`, `src/features/records/index.ts`
- Modify: `src/views/home/ui/shop-peek-card.tsx`(버튼 행), `src/views/home/model/markers.ts`+`use-shop-map.ts`(visited 상태), `src/views/shop-detail/ui/shop-detail-page.tsx`(클라이언트 섬 버튼), `src/views/home/ui/shop-map.tsx`

**동작:** 완식 +1(count), 가고싶다 토글(want↔삭제, visited면 완식만). visited 핀 회색조(markers.ts에 visitedIds 인자). 첫 완식 1회 sonner 토스트 "기록은 기기에 저장돼요 · 백업하기"(exportJson 다운로드). features 레이어 첫 사용(2곳+ 재사용: 홈·상세·온보딩).

- [ ] Step 1: use-records(`{records, visitedIds, get, markVisited, markWant, remove, exportDownload}`) — 스토어 인스턴스 모듈 싱글턴, 변경 시 리렌더
- [ ] Step 2: RecordButtons(완식 N·가고싶다) — peek 카드·상세에 배치. 마커 visited 반영
- [ ] Step 3: 커밋 `feat: 완식·저장 기록 UI (RecordStore 연결)`

### Task 2: 장르 가이드 `/guide/{slug}`

**Files:**
- Create: `src/entities/shop/model/guide-content.ts`, `src/views/genre-guide/ui/genre-guide-page.tsx`, `src/views/genre-guide/index.ts`, `src/app/guide/[slug]/page.tsx`

**요소(§6, 목업 GenreGuide):** 가이드 헤더(계열명·labelJa·본문 2~3문단) / 특징 3칸(맛·농도·첫 주문 추천) / "비슷한 듯 다른 계열" 비교 1~2 / 대표 매장 카드(해당 장르 매장, 태그라인·note 활용) / "전체 지도에서 보기" CTA(필터 프리셋) / 감수 표기("이 가이드는 라오타 감수로 계속 다듬어집니다")

**콘텐츠:** 스프 8종(기타 제외)+계보 4종 초안 — 파트너 감수 전 초안임을 guide-content에 주석 아닌 검수 플래그로 표기

- [ ] Step 1: guide-content as const + 페이지, generateStaticParams(콘텐츠 있는 슬러그만)
- [ ] Step 2: 커밋 `feat: 장르 가이드 페이지`

### Task 3: 계보 랜딩 `/style/{계보}`

**Files:**
- Create: `src/views/style-landing/ui/style-landing-page.tsx`, `src/views/style-landing/ui/style-progress.tsx`('use client'), `src/views/style-landing/index.ts`, `src/app/style/[lineage]/page.tsx`

**요소(§5, 목업 StyleLanding):** 다크 에디토리얼 헤더(ink 배경 — 계보명·labelJa·설명·통계: 전국 N곳·스프 구성) / 진행률 바 "서울 이에케 N/M"(클라이언트 섬 — use-records, 기록 없으면 숨김) / 매장 리스트(완식 ✓ 표시 — 클라이언트 뱃지) / "가이드 →"·관련 계보 링크

- [ ] Step 1: 구현, generateStaticParams(매장 1곳+ 계보만)
- [ ] Step 2: 커밋 `feat: 계보 랜딩 페이지`

### Task 4: 온보딩 (첫 방문 1회)

**Files:**
- Create: `src/views/home/ui/onboarding.tsx`('use client'), `src/views/home/model/use-onboarding.ts`
- Modify: `src/views/home/ui/shop-map.tsx`(조건 노출)

**요소(§10, 목업 Onboarding):** 전체 오버레이 / 건너뛰기(우상단) / 타이틀 "가본 라멘집을 먼저 찍어보세요" + "기록은 이 기기에만 저장돼요" / 이름 검색(로컬 필터) / 매장 체크 그리드 / 하단 카운트 "지금까지 N곳 완식" + "내 라멘 지도 시작하기"

**동작:** 체크 = markVisited(날짜 미상 — at 없이 count만: firstAt null 유지 불가하므로 기록 시점 저장, 미상 플래그는 스코프 아웃), 완료·건너뛰기 시 localStorage 플래그, 재노출 안 함

- [ ] Step 1: 구현
- [ ] Step 2: 커밋 `feat: 온보딩`

### Task 5: 제보 폼 `/report`

**Files:**
- Create: `src/features/report/model/report-sink.ts`, `src/features/report/model/use-report-form.ts`, `src/views/report/ui/report-page.tsx`, `src/views/report/index.ts`, `src/app/report/page.tsx`
- Modify: `.env.local.example`(SUPABASE URL·ANON KEY 추가)

**요소(§8, 목업 ReportForm):** 유형 3버튼(새 라멘집/정보 수정/폐업·휴업) / 필드 3(가게 이름*, 위치·링크*, 하고 싶은 말) / 제출 / 안내 "전건 검수 후 게재" · "폐업은 2차 확인"

**ReportSink:** env `NEXT_PUBLIC_SUPABASE_URL`+`NEXT_PUBLIC_SUPABASE_ANON_KEY` 있으면 `POST {url}/rest/v1/reports`(fetch), 없으면 제출 시 "준비 중 — 인스타 DM 안내" 폴백. 성공 시 감사 화면

- [ ] Step 1: 구현 (제출 뒤 상태 전환, 실패 토스트)
- [ ] Step 2: 커밋 `feat: 제보 폼 (Supabase 이음새)`

### Task 6: 현위치 + 검증

**Files:**
- Modify: `src/views/home/ui/shop-map.tsx`(현위치 버튼), `src/views/home/model/use-shop-map.ts`(locate)

- [ ] Step 1: 현위치 버튼(지도 우하단) — geolocation 성공 시 panTo+마커 점, 거부 시 토스트 1회
- [ ] Step 2: `build && test && tsc` 클린 + 브라우저 검증(기록 왕복·온보딩·가이드·계보·제보 폴백·현위치)
- [ ] Step 3: 커밋·푸시, main 머지는 사용자 확인

## Self-Review 결과

- Supabase 실연동은 외부 의존(사용자가 프로젝트 생성 + env) — 이음새까지만 이번 스코프
- 기록 가져오기(import) UI는 명세상 배치 없음 — 내보내기 토스트만, import는 미결로 기록
- 온보딩 "날짜 미상 플래그"는 RecordStore 스키마 변경이 필요해 스코프 아웃(미결)
- 로그인(카카오·Supabase Auth)은 계획대로 Plan 5 이후 별도
