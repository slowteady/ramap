# 라맵 Plan 2: 데이터 파이프라인 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 시트→JSON 동기화, LOCALDATA 라멘 후보 추출, 신규·폐업 diff — 태깅·운영의 기계 파트를 완성한다.

**Architecture:** `scripts/`(src 밖, CLAUDE.md 구조)에 CLI 3개. 파싱·검증·변환 로직은 `scripts/lib/`의 순수 함수(TDD), CLI는 얇은 입출력 래퍼. 실데이터 확보 전이므로 픽스처로 완성하고 실행 인터페이스만 노출.

**Tech Stack:** tsx(스크립트 실행), proj4(TM→WGS84), Vitest(node 환경).

**Spec:** `docs/planning/15.태깅시트스키마.md`(시트 헤더·규칙), `16.제보운영플로우.md`(diff 루프), `09.기술타당성.md`(좌표 정책), `src/entities/shop/model/`(타입·택소노미)

## Global Constraints

- CLAUDE.md 전체 적용: 주석 금지, 순수 함수 테스트 필수, enum 금지, kebab-case
- 시트 컬럼 = 15번 문서 헤더 35개와 1:1. 검증 실패는 행 단위로 수집해 리포트 (첫 에러에서 죽지 않음)
- 지도사 지오코딩 호출 금지 — 좌표는 LOCALDATA 값 변환 또는 시트의 수동 핀 값만
- 브랜치 `feat/plan2-data-pipeline`

---

### Task 1: 스크립트 실행 환경

**Files:**
- Modify: `package.json`(scripts, devDeps), `vitest.config.ts`(include에 scripts 추가)

- [ ] **Step 1:** `npm i -D tsx && npm i proj4 && npm i -D @types/proj4`
- [ ] **Step 2:** vitest include를 `["src/**/*.test.ts", "scripts/**/*.test.ts"]`로 확장
- [ ] **Step 3:** `npm test` 기존 12개 통과 확인, 커밋 `chore: 스크립트 실행 환경(tsx·proj4)`

### Task 2: 시트 TSV 파서·검증기 (핵심 — TDD)

**Files:**
- Create: `scripts/lib/sheet-parser.ts`, Test: `scripts/lib/sheet-parser.test.ts`

**Interfaces:**
- Produces:
```ts
type RowIssue = { row: number; field: string; message: string };
type ParseResult = { shops: Shop[]; issues: RowIssue[] };
parseSheetTsv(tsv: string): ParseResult
```
- 규칙: 15번 헤더 순서 고정. 복수값은 콤마 분리 → 슬러그 배열(라벨→슬러그 매핑: "돈코츠"→"tonkotsu"). 검증: id 슬러그 형식·유일성, 대표값이 복수값에 포함, 라벨이 택소노미에 존재, 상태·확신도·검증상태 enum, 대표메뉴 `이름|가격` 형식, lat/lng 숫자. 이슈 있는 행은 shops에서 제외하되 나머지 행은 계속 처리

- [ ] **Step 1: 실패 테스트** — 케이스: 정상 2행 파싱(복수 스프 "돈코츠, 니보시"→slugs), 미지 라벨 이슈, id 중복 이슈, 대표값 불포함 이슈, 가격 형식 이슈, 빈 선택 필드는 null
- [ ] **Step 2:** FAIL 확인 → 구현 → PASS → `tsc --noEmit` 클린
- [ ] **Step 3:** 커밋 `feat: 시트 TSV 파서·검증기`

### Task 3: sync-sheet CLI

**Files:**
- Create: `scripts/sync-sheet.ts`, `data/fixtures/sheet.sample.tsv`(실측 매장 5곳 — shops.sample.json과 동일 내용)

- [ ] **Step 1:** CLI: `tsx scripts/sync-sheet.ts <입력.tsv>` → 성공 시 `data/shops.json` 원자적 쓰기 + 요약 출력(총·성공·이슈), 이슈 존재 시 행 단위 리포트 출력 후 exit 1 (파일 미변경)
- [ ] **Step 2:** 픽스처로 실행해 `data/shops.json` 생성 확인, 깨진 픽스처로 exit 1 확인. `shops.sample.json`은 삭제하고 shops.json으로 일원화 (참조 갱신)
- [ ] **Step 3:** package.json에 `"sync-sheet": "tsx scripts/sync-sheet.ts"` 추가, 커밋 `feat: sync-sheet CLI — 시트가 데이터 원천`

### Task 4: LOCALDATA 후보 추출기 (TDD)

**Files:**
- Create: `scripts/lib/localdata.ts`, Test: `scripts/lib/localdata.test.ts`, `data/fixtures/localdata.sample.csv`(인허가 포맷 가공 표본 6행 — 라멘집 2·분식 1·폐업 라멘 1·일반음식점 비라멘 1·멘야 1)
- Create: `scripts/seed-candidates.ts`

**Interfaces:**
- Produces:
```ts
type LocalDataRow = { name: string; roadAddress: string; status: 'open' | 'closed'; category: string; x: number | null; y: number | null };
parseLocalData(csv: string): LocalDataRow[]        // 인허가 CSV의 관련 컬럼만 추출
isRamenCandidate(row: LocalDataRow): boolean       // 키워드(라멘·라며느·멘야·라멘야·츠케멘·마제소바 등) + 폐업 제외
tmToWgs84(x: number, y: number): { lat: number; lng: number }  // EPSG:5174 → WGS84 (proj4)
toSheetTsv(rows: LocalDataRow[]): string           // 15번 헤더 TSV — 파트너 시트에 바로 붙이는 후보 목록
```

- [ ] **Step 1: 실패 테스트** — 후보 판별(라멘·멘야 통과, 분식·폐업 탈락), 좌표 변환(서울시청 TM 좌표 → lat 37.56±0.01·lng 126.97±0.01), TSV 헤더가 15번 문서와 일치
- [ ] **Step 2:** FAIL → 구현 → PASS. 키워드 목록은 상수로 노출(파트너가 추후 조정)
- [ ] **Step 3:** `seed-candidates.ts` CLI: `tsx scripts/seed-candidates.ts <localdata.csv>` → `data/out/candidates.tsv` + 건수 요약. 픽스처 실행 확인
- [ ] **Step 4:** 커밋 `feat: LOCALDATA 라멘 후보 추출기`

### Task 5: 신규·폐업 diff (TDD)

**Files:**
- Create: `scripts/lib/localdata-diff.ts`, Test: `scripts/lib/localdata-diff.test.ts`, `scripts/diff-localdata.ts`

**Interfaces:**
- Produces:
```ts
type DiffResult = { opened: LocalDataRow[]; closed: LocalDataRow[] };
diffLocalData(prev: LocalDataRow[], next: LocalDataRow[]): DiffResult
// 키: name+roadAddress. opened = next에만 있는 후보, closed = 양쪽에 있으나 open→closed 전이
```

- [ ] **Step 1: 실패 테스트** — 신규 감지, 폐업 전이 감지, 무변화 무보고
- [ ] **Step 2:** FAIL → 구현 → PASS
- [ ] **Step 3:** CLI `diff-localdata.ts <이전.csv> <최신.csv>` → 콘솔 리포트(신규 N·폐업 N, 목록). 커밋 `feat: 신규·폐업 diff — 16번 자동 감지 루프`

### Task 6: 마무리

- [ ] **Step 1:** `npm run build && npm test && npx tsc --noEmit` 클린
- [ ] **Step 2:** README에 파이프라인 사용법 3줄, `data/out/` gitignore 추가
- [ ] **Step 3:** 커밋·푸시 → main 머지 (사용자 확인 후)

## Self-Review 결과

- 15번 시트 규칙 반영: 헤더 1:1, 드롭다운 값 검증, 이슈 행 리포트. 16번 diff 루프 반영. 09번 좌표 정책(지오코딩 금지) 준수 — 변환만 수행
- 실데이터 의존은 픽스처로 대체 — LOCALDATA 실CSV·실시트 TSV가 오면 CLI 인자만 바꿔 실행
- 미포함(의도): Google Sheets API 직결(시트는 TSV 내보내기로 시작 — 자격증명 불필요), 동네 클러스터 사전 집계(Plan 3의 지도 구현과 함께)
