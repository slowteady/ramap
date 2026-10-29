# 프로젝트 규칙: 라맵 (Ramap)

한국 라멘을 장르로 찾는 지도 — ramap.kr. 결정 이유는 `docs/decisions/`와 각 모듈 `decisions/`에 있고, 여기에는 지금 지켜야 할 것만 쓴다. 문서 색인은 `docs/README.md`.

## 구조

| 위치 | 기술 |
|---|---|
| `src/app/` | Next.js 16 App Router 라우팅 전용 — `page.tsx`는 views 재수출 + `generateStaticParams`만 |
| `src/views/` | 코드의 기본 거주지(페이지 슬라이스: `ui/` + `model/` + `index.ts`) |
| `src/features/` | 2개 페이지 이상에서 재사용되는 사용자 시나리오만 |
| `src/entities/` | 도메인(shop, record): `api/`(서버 조회) + `model/`(순수 함수·타입) + `ui/` |
| `src/shared/` | `ui`(shadcn) · `lib`(범용 유틸·훅) · `config` · `map`(지도 어댑터) · `api`(Supabase 클라이언트) |
| `data/` · `scripts/` | 매장 데이터(시트 동기화 산출물) · 데이터 파이프라인 |
| `supabase/schema.sql` | DB 스키마·RLS 원천 |

- import 방향: app → views → features → entities → shared 단방향만. 역방향·같은 레이어 슬라이스 간 금지. 슬라이스는 `index.ts`로만 노출(서버 전용은 `index.server.ts`, 클라이언트 전용 비컴포넌트는 `index.client.ts`). `shared/ui`는 배럴 없음 → [결정](../../docs/decisions/0001-tech-stack-lite-fsd.md)
- 로직 3분법: 데이터 읽기 → `entities/*/api/` async 함수 + `import 'server-only'`(필요 시 `React.cache`) / 순수 계산 → `model/`·`lib/` 순수 함수(훅으로 감싸지 않음) / 상태·이펙트·브라우저 API → 클라이언트 섬의 view-model 훅(`use-*`, `{ 상태, 파생 불린, 핸들러 }` 반환, 계산은 순수 함수에 위임).
- 기본은 Server Component. `'use client'`는 인터랙션이 필요한 잎에만. 브라우저 전용 모듈엔 `import 'client-only'`.
- 코드는 views 슬라이스에서 시작하고, 2개 페이지 이상 재사용이 확인될 때만 features·entities로 내린다. widgets 레이어는 만들지 않는다.
- 이 Next.js는 학습 데이터와 API가 다르다. 코드를 쓰기 전에 `node_modules/next/dist/docs/`의 해당 가이드를 읽는다.

## 스키마와 API

- 백엔드 서버 없음: 브라우저가 Supabase를 직접 호출하고 RLS가 권한을 강제한다. 스키마 변경은 `supabase/schema.sql`에 반영한다.
- 서버 응답은 수동 내로잉(`unknown` → 타입 가드). zod 미도입.
- 데이터 없음은 `null` 반환 + 호출부 분기. 외부 SDK(카카오맵) 실패는 반드시 폴백 UI(리스트 + 안내 배너). 기록 저장 실패는 무음 폴백.
- 날짜는 dayjs로만 다룬다(`new Date` 직접 연산 금지).
- 공유 상태의 원천은 URL 쿼리(필터·시트·선택 매장). 컴포넌트 로컬은 `useState`. 기록은 `RecordStore` 인터페이스 경유만(localStorage 직접 호출 금지).
- 타입: `type` 기본, `interface`는 다중 구현 계약(RecordStore 등)만. enum 금지(`as const` + 유니온). `any` 금지(`unknown` + 내로잉). export는 named 기본, default는 Next가 요구하는 곳만.
- 도메인 용어는 코드에서 영어(soup·form·lineage), 화면 문자열만 한국어. 서버 조회 함수는 `get*`.

## DB

- 테이블·컬럼은 snake_case. 앱 타입은 camelCase로 매핑(`row-mapping`).

## 화면

- UI 작업은 `ramap-ui` 스킬 필수(`.claude/skills/ramap-ui`). 토큰은 `src/app/globals.css`의 `@theme`만, 임의값(`w-[13px]`) 금지, 클래스 조합은 `shared/lib/utils`의 `cn()`, CSS 파일 추가 금지.
- 라이트 모드 고정 — `.dark` 블록 금지(카카오맵에 다크 타일이 없어 지도가 주인공인 화면에서 UI만 어둡게 할 수 없다)
- 화면 문구와 배치: 공통 규칙은 `ui.md`. 라맵에서 더하는 것: 회색 보조 설명 줄과, 결과가 화면에 바로 보이는 확인 토스트는 넣지 않는다.
- 라이브러리는 트리거가 생길 때만 도입 — 현황은 `docs/modules/platform/design.md`의 라이브러리 표.

## 브랜치

- 기본 브랜치: `main` (머지 = Vercel 프로덕션 배포)
- 이름 규칙: `타입/짧은-영어-설명` — 타입은 소문자 `feat`·`fix`·`docs`·`refactor`·`test`·`style`·`chore` (예: `feat/contribution-feedback`, `fix/record-upload-timeout`)

## 금지 (약관·정책)

`docs/decisions/0002-third-party-data-boundary.md` 요약:
- 지도사 지오코딩 결과 저장 금지 — 좌표는 공공데이터·수동 핀만
- 네이버·카카오 플랫폼 데이터 크롤링 금지, 인스타그램 직접 조회·스크래핑 금지
- 타인 사진 사용 금지, 타사 로고 사용 금지
- 폐업 표시는 확실히 검증된 매장만(오표시는 법적 분쟁 위험) — `closure-verification` 스킬

## 작업 흐름

- 할지 말지 정할 후보는 `docs/backlog.md`에만 둔다(상태: 대기·채택·보류·기각·완료). 백로그 행으로 이슈를 만들면 그 행을 "채택"으로 바꾸고 비고에 `#이슈번호`를 적는다(docs 1파일 수정이라 main 직접 커밋 허용).
- 이슈 본문 끝에 `## 작업 유형`(UI / 데이터 / 파이프라인 / 문서)을 붙인다. UI면 `ramap-ui`, 매장 데이터면 `data-integrity`·`closure-verification` 스킬을 따른다.
- main 직접 커밋 금지(docs·설정 1파일 예외). main 머지가 곧 Vercel 프로덕션 배포라 PO가 한다 → [결정](../../docs/decisions/0005-issue-based-workflow.md)
- 머지 후 IndexNow(`npm run indexnow`)는 PO가 요청할 때 실행한다.
- PR 자동 리뷰(GitHub Actions `claude-review.yml`)는 쓰지 않는다. 보일러플레이트를 복사할 때 그 파일은 빼고, 리뷰는 PR 전에 로컬 `pr-review`로 한다 (Claude 앱·토큰 없이 두면 PR마다 실패로 표시된다)

## 검증

- 테스트 3계층: 순수 함수 `*.test.ts`, 훅·leaf 컴포넌트 `*.test.tsx`(Testing Library, `next/navigation`은 `shared/testing/next-navigation` 스텁), 비로그인 핵심 여정 `e2e/*.spec.ts`(Playwright). 모두 대상 옆에 둔다. 지도 오버레이 클릭은 `dispatchEvent("click")`.
- 공통: `npm test`, `npm run build`. 핵심 여정을 건드렸으면 `npm run test:e2e`. 포맷은 `npm run format`(Prettier 기본).
- 매장 데이터: `npm run enrich-candidates -- data/out/candidates.tsv data/enrichment/*.json` → `npm run sync-sheet -- data/out/seed.tsv` → `npm run audit-integrity`. 리포트 첫 줄과 소실·계보 변경 표를 PR 본문에 붙인다.
- UI 변경: 로컬 서버는 3001 포트(카카오맵 허용 도메인, 3000은 다른 프로젝트가 쓴다). 모바일 폭 430px 스크린샷을 PR 본문에 넣는다. 로그인이 필요한 상태는 임시 코드로 찍고 커밋 전에 반드시 원복한다.

## 리뷰 기준 (pr-review에 더함)

- 🔴 FSD 경계 위반: import 역방향, 같은 레이어 슬라이스 간 import, 슬라이스 `index.ts` 우회, 서버 전용 코드가 클라이언트 번들에 섞임
- 🔴 위 "금지(약관·정책)" 위반
- 🔴 서버 응답(Supabase 행)을 내로잉 없이 `as`로 단언, `any`
- 🔴 토큰·키·개인정보가 URL 쿼리에 들어감
- 🟡 `@theme`에 없는 색·임의값 유틸, `shared/lib/utils`가 아닌 `cn()`·`tailwind-merge` 직접 import, `.dark` 추가
- 🟡 클릭 요소가 `<button>`/`<a>`가 아님, 터치 영역 44px 미만, 회색 보조 설명 줄
