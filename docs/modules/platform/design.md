---
status: 유효
updated: 2026-10-28
---

# platform 설계

## 스택

| 레이어 | 사용 | 메모 |
|---|---|---|
| 웹 | Next.js 16 (App Router) · React 19 · TypeScript | SSG·SSR 혼합. 이 버전은 API가 바뀌어 있으니 `node_modules/next/dist/docs/`를 먼저 본다 |
| 스타일 | Tailwind CSS v4 | 토큰은 `src/app/globals.css`의 `@theme`가 유일한 원천 → [ui 설계](../ui/design.md) |
| 컴포넌트 | shadcn/ui (`src/shared/ui/`) · vaul(Drawer) · lucide | vaul 1.1.2는 `patches/`로 `modal` 전달 버그를 고쳐 쓴다 |
| 폰트 | Pretendard Variable 셀프호스팅 | |
| 지도 | 카카오맵 JS SDK, 어댑터 뒤에서만 사용 | 아래 "지도" 절 |
| 백엔드 | Supabase(무료 티어) — 카카오 Auth, `profiles`·`records`·`record_photos`·`reports` 테이블, 사진 스토리지 | 서버 없이 브라우저가 직접 호출하고 RLS가 권한을 강제. 스키마는 `supabase/schema.sql` |
| 매장 데이터 | 시트 → 동기화 스크립트 → `data/*.json` → 빌드 반영 | DB가 아니라 Git이 이력을 가진다 → [data 설계](../data/design.md) |
| 호스팅 | Vercel | main 머지가 곧 프로덕션 배포. `vercel.json`: main 외 브랜치(PR)는 자동 배포 안 함(`git.deploymentEnabled`) — 화면 검수는 로컬 3001 스크린샷으로 한다. main에서도 직전 커밋 대비 바뀐 파일이 문서·에이전트 설정(`*.md`, `docs/`, `.claude/`, `.github/`, `orca.yaml`)뿐이면 빌드를 건너뛴다(`ignoreCommand`). 무료 배포 저장소(10GB)를 배포 1회 약 200MB씩 쓰기 때문 |
| 이용 통계 | PostHog | 아래 "이용 통계" 절. GA4는 쓰지 않는다 — 기능별 이벤트·히트맵을 한 도구에서 보려고 |
| 검색 유입 | Google Search Console · 네이버 서치어드바이저 · IndexNow(`npm run indexnow`) | |

아키텍처(축소형 FSD, 로직 3분법, Server Component 기본)는 `.claude/rules/project.md`가 규칙의 원천 → [결정](../../decisions/0001-tech-stack-lite-fsd.md)

## 라이브러리

새 라이브러리는 미리 넣지 않고(쓰지 않는 추상화와 번들이 쌓인다), 아래 트리거가 실제로 생겼을 때 도입한다. 도입하거나 트리거를 바꾸면 이 표를 같은 PR에서 고친다.

| 라이브러리 | 상태 | 쓰는 곳·도입 트리거 |
|---|---|---|
| @supabase/supabase-js | 도입 | Auth(카카오)·기록·제보. 브라우저 직호출 + RLS |
| dayjs | 도입 | 날짜 파싱·포맷·차이 계산 단일 창구. `new Date` 직접 연산 금지 |
| es-hangul | 도입 | 검색 초성 추출(`getChoseong`)·영타 변환(`convertQwertyToHangul`). 편집거리 폴백만 자체(`src/views/home/model/hangul.ts`) |
| posthog-js | 도입 | 이용 통계. `src/instrumentation-client.ts` 단일 초기화 |
| patch-package | 도입 | vaul `modal={false}` 시트가 앱 셸 전체에 aria-hidden·포커스 트랩을 거는 버그(vaul #582·#497·#519) 한 줄 패치. 업스트림이 고치면 `patches/` 제거 |
| @testing-library/react (+user-event·jest-dom) | 도입(dev) | 렌더링 테스트. @vitejs/plugin-react는 babel peer 충돌로 쓰지 않고 vitest `esbuild.jsx: "automatic"`로 JSX 처리 |
| @playwright/test | 도입(dev) | 시나리오 테스트. chromium 단일 |
| csv-parse | 도입(dev, `scripts/` 전용) | 공공데이터 CSV 파싱 |
| proj4 | 도입(dev, `scripts/` 전용) | EPSG:5174 → WGS84 좌표 변환(순수 수학이라 지오코딩 저장 금지와 무관) |
| TanStack Query | 미도입 | 지도 뷰포트 런타임 API 전환, 또는 기록 외 server state가 늘 때. 기록은 1회 로드 + write-through라 불필요 |
| zod | 미도입 | 서버 응답 런타임 파싱 경계가 3곳 이상일 때. 현재 records·record_photos는 수동 내로잉. 폼 검증용으로는 도입 안 함(강제는 DB 제약) |
| react-hook-form | 미도입 | 필드 5개 이상 폼 또는 필드 배열이 생길 때 |
| 전역 스토어(zustand 등) | 미도입 | URL + useState로 부족한 공유 상태가 실증될 때 |
| framer-motion | 미도입 | CSS + vaul로 부족한 모션이 실증될 때 |
| @use-gesture | 미도입 | 관성 스크롤·핀치 줌·복합 제스처가 필요할 때. 단순 드래그는 `src/shared/lib/use-drag-scroll.ts` |
| steiger(FSD 린터) | 미도입 | 베타 안정화 + 팀 확장 시 |

## 지도

- 인터페이스: `src/shared/map/types.ts`의 `MapAdapter`. 구현체 `src/shared/map/kakao-adapter.ts`, SDK 로더 `kakao-loader.ts`. 화면은 어댑터만 호출한다.
- 키: `NEXT_PUBLIC_KAKAO_MAP_KEY`는 Keeper 앱의 JS 키를 공유한다. 키 도메인에 ramap.kr·Vercel·localhost:3001이 등록돼 있다 → [결정](decisions/0002-kakao-key-shared-keeper.md)
- 로컬 개발은 3001 포트(카카오 허용 도메인, 3000은 다른 프로젝트가 쓴다).
- SDK 로드 실패 시 폴백 리스트 + 안내 배너, `map_load_failed` 이벤트.
- 교체 경로(Plan B): B-1 네이버 지도(월 600만 무료, 카드 필수, 콘솔 한도 캡) → B-2 MapLibre GL + OpenFreeMap(무제한·무가입·상업 허용, SLA 없음, 자체 호스팅 이전 가능). 전환 트리거: 일 로드 70%가 2주 연속이면 B-1 검토, 무료 정책 변경 공지 시 30일 안에 B-2 프로토타입, 분기 1회 양사 약관 점검 → [결정](decisions/0001-kakao-map-adapter.md)

## 모듈 이음새

로그인을 나중에 붙여도 화면을 고치지 않도록 처음부터 분리한 4개. 카카오 로그인 도입 때 화면 수정 없이 저장소 구현체만 바꿔 붙였다.

1. 기록 저장소 — 화면은 `RecordStore` 인터페이스(`src/entities/record/`)만 호출. 비로그인은 localStorage 구현체, 로그인은 Supabase 동기화 구현체. 기록 스키마 = JSON 내보내기 포맷 = Supabase 테이블 형태
2. 사용자 식별 — "현재 사용자"는 비로그인(null)에서 시작해 카카오 세션으로 채운다
3. 제보 제출 — 로그인 없이도 제출된다
4. 지도 어댑터 — 위 "지도" 절

## 테스트

| 계층 | 도구 | 위치 | 대상 |
|---|---|---|---|
| 단위 | Vitest + jsdom | `*.test.ts` co-location (`src/**`, `scripts/**`) | `model/`·`lib/`·`api/` 순수 함수 |
| 렌더링 | Vitest + Testing Library | `*.test.tsx` co-location | 훅(renderHook)·leaf 컴포넌트 |
| 시나리오 | Playwright | `e2e/*.spec.ts` | 비로그인 핵심 여정(로그인 여정은 카카오 OAuth라 자동화 불가) |

- 설정: `vitest.config.ts`(jsdom, `.test.ts`·`.test.tsx`, setup `vitest.setup.ts`), `playwright.config.ts`(chromium 단일 — 카카오 SDK가 WebKit 헤드리스에서 불안정, dev 서버 3001 자동 기동).
- `next/navigation`은 `src/shared/testing/next-navigation.ts` 스텁, 지도는 `MapAdapter` 페이크, 기록은 로컬 스토어 페이크를 쓴다.
- 지도 오버레이 클릭은 `dispatchEvent("click")`(오버레이 재배치로 Playwright 안정성 검사가 실패한다).
- 명령: `npm test`(단위+렌더링), `npm run test:e2e`(시나리오).

## 이용 통계

- PostHog 조직 `ramap`(Keeper와 분리), 프로젝트 690709, US 리전. 대시보드 "라맵 핵심 지표"(유입 / 핵심 행동 / 참여·상태), 시간대 Asia/Seoul.
- 초기화는 `src/instrumentation-client.ts` 한 곳. `api_host: "/ingest"`(next.config rewrites로 프록시, `skipTrailingSlashRedirect`), `ui_host: NEXT_PUBLIC_POSTHOG_HOST`.
- 토큰 `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`은 Vercel Production에만 둔다. 로컬·프리뷰는 초기화하지 않는다(확인하려면 셸에서 일시 주입 후 `npm run build && npx next start`).
- 켬: 자동 클릭, 페이지뷰·이탈, 히트맵, 데드 클릭, 예외, 웹바이탈. 끔: 세션 녹화(`disable_session_recording`) — 켜려면 이 옵션을 false로 하고 처리방침에 녹화 고지를 추가한다.
- 공통 속성: `page_type`(`src/shared/lib/analytics-context.ts`의 `pageTypeOf`), `in_app`(카카오톡·인스타·네이버·페이스북·라인 인앱 브라우저).
- 로그인 사용자는 Supabase user id로만 `identify`, 로그아웃·탈퇴 시 `reset`. 운영자(`role=admin`)는 `opt_out_capturing`.
- 커스텀 이벤트는 `src/shared/lib/analytics.ts`의 `EventMap`이 단일 원천이다. 새 이벤트는 타입을 먼저 추가하고 `track()`으로만 보낸다(posthog 직접 호출 금지). 현재 이벤트: `filter_changed`, `hide_visited_toggled`, `saved_only_toggled`, `search_result_selected`, `shop_selected`, `locate_clicked`, `map_load_failed`, `record_toggled`, `record_log_submitted`(실패 시 `failed_step`), `report_opened`, `report_submitted`, `my_reports_viewed`, `directions_clicked`, `instagram_clicked`, `share_clicked`, `address_copied`, `login_started`, `account_deleted`.
- 유입: `$referring_domain`·utm은 SDK 기본 수집. 인앱 브라우저는 referrer가 비어 `in_app`으로 보완하고, 직접 배포하는 링크에는 `?utm_source=`를 붙인다. 검색어는 Search Console·서치어드바이저에서 본다.

## 환경 변수

`NEXT_PUBLIC_KAKAO_MAP_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`(Production만), `NEXT_PUBLIC_POSTHOG_HOST`. 로컬 값은 `.env.local`.
