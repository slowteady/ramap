# 라맵 (Ramap)

한국 라멘을 장르로 찾는 지도 — ramap.kr. Next.js(App Router) + TypeScript + Tailwind v4 + shadcn/ui + Vitest.

- **스펙 단일 원천: `docs/planning/` 01~17.** 코드와 충돌하면 문서 우선, 결정 변경은 문서 갱신과 함께. 구현 계획은 `docs/plans/` — **문서만 읽고 다른 에이전트가 이어받을 수 있어야 완성**: 설계 근거 외에 기존 코드 포인터(수정 대상 파일·역할), 재사용할 패턴의 위치, 검증 명령, 작업 절차(브랜치·로컬 검수 후 머지)를 반드시 포함. 아이디에이션 레포의 03.라맵은 동결 스냅샷 — 참조 금지
- 명령: `npm run dev` / `npm run build` / `npm test` / `npm run format`

## 아키텍처 — 축소형 FSD (4레이어 + 로직 3분법)

```
src/
├── app/        # Next 라우팅 전용 — page.tsx는 views 재수출 + generateStaticParams만
├── views/      # 코드의 기본 거주지 (FSD pages, v2.1 pages-first) — 슬라이스: ui/ + model/ + index.ts
├── features/   # (예약) 사용자 시나리오가 2개 페이지 이상에서 재사용될 때만 생성
├── entities/   # 도메인: shop, record — api/(서버 조회) + model/(순수 함수·타입) + ui/
└── shared/     # ui(shadcn) · lib(범용 유틸·훅) · config
data/           # 정적 데이터 (시트 동기화 산출물)
scripts/        # 파이프라인 (LOCALDATA 시딩·시트 동기화)
```

1. **import 방향: app → views → features → entities → shared 단방향만.** 역방향·동일 레이어 슬라이스 간 금지
2. **로직 3분법** — 컴포넌트 본문에 비즈니스 로직 금지, 형태는 종류에 따라:
   - 데이터 읽기(매장 조회·목록) → `entities/*/api/`의 plain async 함수 + `import 'server-only'` (+필요 시 `React.cache`)
   - 순수 계산(필터 술어·정렬·집계·통계) → `model/`·`lib/`의 순수 TS 함수 — 훅을 호출하지 않는 로직은 훅으로 감싸지 않는다
   - 상태·이펙트·브라우저 API → 클라이언트 섬 한정 **view-model 훅** (`use-*`, `{ 상태, 파생 불린, 핸들러 }` 객체 반환, 계산은 순수 함수에 위임하는 얇은 계층). 이 레포에서 view-model 훅이란 이 정의를 말한다
3. **기본은 Server Component.** `'use client'`는 인터랙션이 필요한 잎(leaf) 컴포넌트에만. 클라이언트 섬: 지도·필터 UI·바텀시트·완식 기록. localStorage 등 브라우저 전용 모듈엔 `import 'client-only'`
4. **public API:** 슬라이스는 `index.ts`로만 외부 노출. 서버 전용 export는 `index.server.ts`로 분리(클라이언트 모듈 그래프 오염 방지). `shared/ui`는 배럴 강제 제외(shadcn CLI 호환)
5. **추출 조건:** 코드는 views 슬라이스에서 시작, 2개 페이지 이상 재사용 확인 시에만 features/entities로 내린다. widgets 레이어는 필요가 증명되기 전까지 만들지 않는다
6. 뮤테이션(향후 서버 저장 전환 시): Server Action은 `features/*/api/`에 얇게, 로직은 함수 계층에 위임

## 코드 컨벤션

- **네이밍:** 파일·폴더 kebab-case / 컴포넌트 PascalCase / 훅 `use-*` / 서버 조회 함수 `get*` / 상수 UPPER_SNAKE / 도메인 용어는 코드에서 영어(soup·form·lineage), UI 문자열만 한국어
- **타입:** `type` 기본, `interface`는 다중 구현 계약(RecordStore 등 이음새)만 / enum 금지 — `as const` + 유니온 / `any` 금지, 불가피하면 `unknown` + 내로잉
- **export:** named 기본, default는 Next가 요구하는 곳(page·layout)만
- **상태:** 공유 상태의 원천은 URL 쿼리(필터·시트·선택 매장 — 공유·뒤로가기·SEO 겸용) / 컴포넌트 로컬은 useState / 기록은 RecordStore 인터페이스 경유만 — localStorage 직접 호출 금지
- **테스트:** `model/`·`api/`의 순수 함수는 Vitest 테스트 필수, `*.test.ts` co-location / 훅·컴포넌트는 로직을 순수 함수로 분리하는 것으로 갈음
- **에러:** 데이터 없음은 null 반환 + 호출부 분기 / 외부 SDK(카카오맵) 실패는 반드시 폴백 UI(리스트 + 안내 배너 — 지도 결함은 치명 결함) / 기록 저장 실패는 무음 폴백
- **스타일링:** Tailwind만, 임의값(`w-[13px]`) 금지 — globals.css `@theme` 토큰 유틸만 / 클래스 조합은 `cn()` / CSS 파일 추가 금지 / **UI 작업 시 ramap-ui 스킬 필수** (.claude/skills/ramap-ui)
- **주석 금지:** 코드가 표현 못 하는 제약(약관 금지, 비자명한 수치 근거)만 허용. 서사형·자명·출처 주석 전부 금지
- **포맷:** Prettier 기본 설정, 스타일 논쟁 금지

## 미도입 라이브러리 — 선탑재 금지, 트리거 명시

| 라이브러리              | v1     | 도입 트리거                                                                                                                                                                                                             |
| ----------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TanStack Query          | 미도입 | 지도 뷰포트 런타임 API 전환, 또는 기록 외 server state가 늘어날 때. 로그인 도입(2026-08-27) 시 재검토했으나 기록은 1회 로드+write-through(캐시·리페치 없음)라 보류                                                      |
| @supabase/supabase-js   | 도입   | 2026-08-27 도입 — Auth(카카오)·기록·제보. 백엔드 서버 없이 브라우저 직호출 + RLS. 스키마는 `supabase/schema.sql`                                                                                                        |
| dayjs                   | 도입   | 2026-08-27 도입 — 날짜 파싱·포맷·차이 계산 단일 창구. `new Date` 직접 연산 금지                                                                                                                                         |
| es-hangul               | 도입   | 2026-09-01 도입 — 검색 초성 추출(getChoseong)·영타 변환(convertQwertyToHangul). 토스 유지보수·의존성 0·트리셰이커블. 편집거리 폴백만 자체(`views/home/model/hangul.ts`) |
| 전역 스토어(zustand 등) | 미도입 | URL+useState로 부족한 공유 상태가 실증될 때                                                                                                                                                                             |
| framer-motion           | 미도입 | CSS+vaul로 부족한 모션이 실증될 때                                                                                                                                                                                      |
| @use-gesture            | 미도입 | 관성(플릭) 스크롤·핀치 줌·복합 제스처가 필요할 때 — 단순 드래그는 `shared/lib/use-drag-scroll` (2026-09-01) |
| steiger(FSD 린터)       | 미도입 | 베타 안정화 + 팀 확장 시                                                                                                                                                                                                |
| patch-package           | 도입   | 2026-08-31 도입 — vaul 1.1.2가 radix Dialog에 `modal`을 전달하지 않아 `modal={false}` 시트가 앱 셸 전체에 aria-hidden·포커스 트랩을 거는 버그(vaul #582·#497·#519, 미수정) 한 줄 패치. 업스트림 수정 시 `patches/` 제거 |

## 도메인 금지사항 (약관·정책)

- 지도사(카카오·네이버) 지오코딩 API 결과의 저장·DB화 금지 — 서비스 중단 사유. 좌표는 공공데이터·수동 핀만
- 네이버·카카오 플랫폼 데이터 크롤링 금지. 타사 연동은 아웃바운드 링크·사실 기록까지 (docs/planning/09 경계선)
- 다크모드 금지 — 라이트 고정 (카카오맵 다크 타일 부재). `.dark` 블록 추가 금지

## 커밋·브랜치

- 브랜치: 작업 단위마다 `feat/`·`fix/`·`chore/` → 완료 시 main 머지 후 삭제. main 직접 커밋 금지(docs·설정 1파일 예외)
- 커밋: 한국어 컨벤셔널(`feat:`·`chore:`·`docs:`·`refactor:`), 푸터 `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
