# 라맵 Plan 1: 기반 (Foundation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 라맵 빌드의 기반 — Next.js 스캐폴딩, 디자인 토큰, ramap-ui 스킬, 택소노미 타입, 기록 저장소(RecordStore)를 만든다.

**Architecture:** Next.js(App Router)+TS+Tailwind v4+shadcn. 택소노미는 `src/lib/taxonomy.ts`의 const 객체가 단일 원천(시트·필터·URL이 전부 여기서 파생). 완식/위시 기록은 `RecordStore` 인터페이스 뒤의 localStorage 구현체(모듈화 이음새 — 로그인 도입 시 Supabase 구현체로 교체).

**Tech Stack:** Next.js 15+, TypeScript, Tailwind CSS v4, shadcn/ui, Vitest(단위 테스트), Pretendard Variable.

**Spec:** `docs/planning/09.기술타당성.md`(스택·모듈화), `10.택소노미초안.md`(v2.1), `13.UI설계원칙.md`(토큰·게이트·F-2 스킬), `14.참여리텐션설계.md`(기록 스펙), `15.태깅시트스키마.md`(필드)

## Global Constraints

- 패키지 매니저 npm. 커밋 메시지 한국어, `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` 푸터
- 색은 토큰 외 사용 금지: 액센트 `#E8442E` 1색, 근흑 `#1A1B1F`(순흑 금지), 시맨틱 그린 `#1B8A4B`, 그레이 스케일만
- radius: 8px/12px/pill(9999px) 3종 외 금지. 폰트 Pretendard, 스케일 6단(11/13/15/18/22/26)
- 아이콘 lucide 단일 세트. 다크모드 미지원(라이트 고정)
- 기록 데이터 스키마 = JSON 내보내기 포맷 = 향후 Supabase 테이블 (형태 불변 계약)

---

### Task 1: Next.js 스캐폴딩 + Vitest

**Files:**
- Create: 프로젝트 루트 전체 (create-next-app), `vitest.config.ts`

**Interfaces:**
- Produces: `npm run dev`, `npm test` 동작하는 빈 앱

- [ ] **Step 1: 스캐폴딩** — 레포 루트에 기존 파일(README, docs)을 보존해야 하므로 임시 폴더에 생성 후 병합:

```bash
cd /Users/yongmin.lee/Documents/ramap
npx create-next-app@latest _scaffold --ts --tailwind --eslint --app --src-dir --use-npm --no-import-alias
rsync -a _scaffold/ ./ --exclude README.md && rm -rf _scaffold
```

(create-next-app이 비어 있지 않은 디렉토리를 거부할 때의 우회. `--no-import-alias`는 기본 `@/*` 유지 여부를 프롬프트 없이 처리 — 프롬프트가 나오면 `@/*` 기본값 수락)

- [ ] **Step 2: Vitest 설치·설정**

```bash
npm i -D vitest @vitest/coverage-v8 jsdom
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: { environment: 'jsdom', include: ['src/**/*.test.ts'] },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
});
```

`package.json` scripts에 추가: `"test": "vitest run", "test:watch": "vitest"`

- [ ] **Step 3: 동작 확인** — `npm run build` 성공, `npm test` 가 "no test files" 아닌 정상 종료(빈 스위트 허용: `--passWithNoTests` 플래그를 test 스크립트에 추가)
- [ ] **Step 4: 커밋** — `chore: Next.js+Vitest 스캐폴딩`

### Task 2: 디자인 토큰 + Pretendard

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`

**Interfaces:**
- Produces: CSS 변수 `--color-accent`, `--color-ink`, `--color-gray-{050..500}`, `--color-open` 및 Tailwind 유틸리티(`bg-accent`, `text-ink` 등), radius 토큰

- [ ] **Step 1: Pretendard 설치** — `npm i pretendard`. `layout.tsx`에서 `import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'`
- [ ] **Step 2: 토큰 정의** — Tailwind v4 방식으로 `globals.css`에 (v3라면 tailwind.config로 동일 값):

```css
@theme {
  --color-accent: #E8442E;      /* 라멘 레드 — 유일한 유채색 */
  --color-ink: #1A1B1F;         /* 근흑 텍스트 (순흑 금지) */
  --color-gray-500: #3D4048;
  --color-gray-400: #6B6E76;    /* 보조 텍스트 */
  --color-gray-300: #9AA0A8;
  --color-gray-200: #C9CDD3;
  --color-gray-150: #E4E6EA;    /* 보더 */
  --color-gray-100: #F0F1F3;    /* 구분선 */
  --color-gray-050: #F9FAFB;    /* 서피스 */
  --color-open: #1B8A4B;        /* 시맨틱: 영업중 */
  --radius-card: 8px;
  --radius-card-lg: 12px;
  --font-sans: 'Pretendard Variable', Pretendard, -apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
  --text-caption: 11px;
  --text-secondary: 13px;
  --text-body: 15px;
  --text-title: 18px;
  --text-heading: 22px;
  --text-display: 26px;
}
body { background: #fff; color: var(--color-ink); font-family: var(--font-sans); }
```

- [ ] **Step 3: 확인** — 홈 페이지를 토큰 스모크 화면으로 교체(색·radius·폰트 스케일 견본 렌더), `npm run dev`로 육안 확인. 기본 보일러플레이트(Next 로고 등) 완전 제거
- [ ] **Step 4: 커밋** — `feat: 디자인 토큰·Pretendard (13번 UI원칙 A절)`

### Task 3: shadcn 초기화 + 테마 덮기

**Files:**
- Create: `components.json`, `src/components/ui/*` (button, badge, drawer, dialog, input, sonner)
- Modify: `src/app/globals.css` (shadcn CSS 변수를 토큰으로 매핑)

- [ ] **Step 1:** `npx shadcn@latest init` (스타일 기본, base color neutral) → `npx shadcn@latest add button badge drawer dialog input sonner`
- [ ] **Step 2: 테마 덮기** — shadcn이 생성한 CSS 변수(`--primary`, `--radius` 등)를 Task 2 토큰 값으로 재정의: `--primary: #E8442E`, `--foreground: #1A1B1F`, `--radius: 8px`, muted/border 계열을 gray 토큰과 일치. **기본 팔레트(zinc/slate) 값 잔재 금지** (13번 게이트)
- [ ] **Step 3: Drawer 스냅 확인** — vaul 기반 Drawer가 `snapPoints` prop을 받는지 데모 페이지(`/dev/sheet`)에서 peek/half 2단 스냅 동작 확인 (이 데모 라우트는 Plan 3에서 제거)
- [ ] **Step 4: 커밋** — `feat: shadcn 도입 + 라맵 토큰 테마`

### Task 4: ramap-ui 스킬 + CLAUDE.md

**Files:**
- Create: `.claude/skills/ramap-ui/SKILL.md`, `CLAUDE.md`

- [ ] **Step 1:** `docs/planning/13.UI설계원칙.md`의 F-2 섹션 코드블록을 `.claude/skills/ramap-ui/SKILL.md`로 생성 (frontmatter 포함 그대로)
- [ ] **Step 2:** `CLAUDE.md` 작성 — 내용: ① 스펙은 `docs/planning/` 01~17 (단일 원천) ② UI 작업 시 ramap-ui 스킬 필수 ③ Global Constraints의 토큰·금지 규칙 요약 ④ 커밋 컨벤션 ⑤ 지오코딩 API 결과 저장 금지·크롤링 금지 경고
- [ ] **Step 3: 스킬 검증** — 서브에이전트에 UI 태스크 1개(간단한 카드 컴포넌트 작성)를 주고 스킬 준수(토큰 사용, 금지 시그니처 부재) 확인
- [ ] **Step 4: 커밋** — `chore: ramap-ui 스킬·CLAUDE.md`

### Task 5: 택소노미 타입 + 샘플 데이터

**Files:**
- Create: `src/lib/taxonomy.ts`, `src/lib/types.ts`, `data/shops.sample.json`
- Test: `src/lib/taxonomy.test.ts`

**Interfaces:**
- Produces: `FORMS`, `SOUPS`, `LINEAGES`, `AMENITIES` (라벨·슬러그 포함 const 배열), `type Shop` (15번 시트 필드와 1:1), `type FormId = 'ramen' | 'tsukemen' | ...`

- [ ] **Step 1: 실패 테스트** — `taxonomy.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { SOUPS, FORMS, soupBySlug } from '@/lib/taxonomy';

describe('taxonomy v2.1', () => {
  it('스프 계열은 기타 포함 9종이며 슬러그가 유일하다', () => {
    expect(SOUPS).toHaveLength(9);
    expect(new Set(SOUPS.map(s => s.slug)).size).toBe(9);
  });
  it('니보시는 커뮤니티 라벨을 쓴다 (어패계 아님)', () => {
    expect(soupBySlug('niboshi')?.label).toBe('니보시');
  });
  it('형태에 히야시츄카는 없다', () => {
    expect(FORMS.some(f => f.label.includes('히야시'))).toBe(false);
  });
});
```

- [ ] **Step 2: 실패 확인** — `npm test` → 모듈 없음 FAIL
- [ ] **Step 3: 구현** — `taxonomy.ts`: v2.1(10번 문서) 그대로. 각 항목 `{ slug, label, labelJa? }`. 스프 9종: tonkotsu 돈코츠 / shoyu 쇼유 / shio 시오 / miso 미소 / tonkotsu-shoyu 돈코츠쇼유 / niboshi 니보시 / toripaitan 토리파이탄 / tantanmen 탄탄멘 / etc 기타. 형태 4종(ramen/tsukemen/mazesoba/etc), 계보 4종(iekei 이에케/jiro 지로계/jikaseimen 자가제면/honto 본토직영), 편의 7종(15번 시트와 동일 슬러그). `types.ts`: `Shop` 타입 — 15번 시트 35컬럼과 1:1 (형태·스프는 `slugs: string[]` + `primary: string`, 내부 세부값 `soupDetail?: string[]`, `status: 'open'|'paused'|'closed'`, `verification: 'confirmed'|'pending'`, `confidence: 'certain'|'estimated'`)
- [ ] **Step 4: 샘플 데이터** — `data/shops.sample.json`: 세션에서 실측된 5곳(킨카·멘야코노하·라멘다이야·왓쇼이켄·나가오중화소바)을 Shop 타입으로. 미확인 필드는 빈 값 + `confidence: "estimated"` (허위 값 기입 금지 — 주소·좌표 미확인이면 공란)
- [ ] **Step 5: 통과 확인** — `npm test` PASS, `tsc --noEmit` 클린
- [ ] **Step 6: 커밋** — `feat: 택소노미 v2.1 타입·샘플 데이터`

### Task 6: RecordStore (완식·위시 기록) — 모듈화 이음새 1번

**Files:**
- Create: `src/lib/records/types.ts`, `src/lib/records/local-store.ts`, `src/lib/records/index.ts`
- Test: `src/lib/records/local-store.test.ts`

**Interfaces:**
- Produces:
```ts
type ShopRecord = { shopId: string; status: 'visited' | 'want'; count: number; firstAt: string | null; lastAt: string | null };
// firstAt/lastAt: ISO 날짜. 온보딩 "가본 집 미리 찍기"는 null (날짜 미상 — 14번 스펙)
interface RecordStore {
  get(shopId: string): ShopRecord | null;
  all(): ShopRecord[];
  markVisited(shopId: string, at?: Date): ShopRecord; // 재방문 시 count+1
  markWant(shopId: string): ShopRecord;               // visited면 무시하고 현 상태 반환
  remove(shopId: string): void;
  exportJson(): string;                               // {version: 1, records: [...]}
  importJson(json: string): { imported: number };     // 병합: 같은 shopId는 count 큰 쪽 승리
}
createLocalRecordStore(storage?: Storage): RecordStore  // 기본 window.localStorage, 테스트에서 주입
```

- [ ] **Step 1: 실패 테스트** — 핵심 케이스:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createLocalRecordStore } from '@/lib/records/local-store';

const mem = () => { const m = new Map<string,string>(); return {
  getItem: (k:string)=>m.get(k)??null, setItem:(k:string,v:string)=>{m.set(k,v)},
  removeItem:(k:string)=>{m.delete(k)}, clear:()=>m.clear(), key:()=>null, length:0 } as Storage; };

describe('RecordStore(localStorage)', () => {
  let store: ReturnType<typeof createLocalRecordStore>;
  beforeEach(() => { store = createLocalRecordStore(mem()); });

  it('완식 1杯 = 1회, 재방문은 count 증가', () => {
    store.markVisited('kinka', new Date('2026-08-26'));
    const r = store.markVisited('kinka', new Date('2026-08-27'));
    expect(r.count).toBe(2);
    expect(r.firstAt).toContain('2026-08-26');
    expect(r.lastAt).toContain('2026-08-27');
  });
  it('날짜 없는 완식(온보딩)은 firstAt null', () => {
    expect(store.markVisited('kinka').firstAt).toBeNull();
  });
  it('want → visited 전이는 되고 역전이는 무시된다', () => {
    store.markWant('konoha');
    expect(store.markVisited('konoha').status).toBe('visited');
    expect(store.markWant('konoha').status).toBe('visited');
  });
  it('export→import 왕복 보존, 병합은 count 큰 쪽', () => {
    store.markVisited('kinka'); store.markVisited('kinka');
    const json = store.exportJson();
    const other = createLocalRecordStore(mem());
    other.markVisited('kinka');
    expect(other.importJson(json).imported).toBe(1);
    expect(other.get('kinka')!.count).toBe(2);
  });
  it('저장소 접근 실패 시 throw하지 않는다', () => {
    const broken = { ...mem(), getItem: () => { throw new Error('denied'); } } as Storage;
    expect(() => createLocalRecordStore(broken).all()).not.toThrow();
  });
});
```

- [ ] **Step 2: 실패 확인** — `npm test` FAIL (모듈 없음)
- [ ] **Step 3: 구현** — `local-store.ts`: 단일 키 `ramap.records.v1`에 JSON 직렬화. 모든 storage 접근 try/catch(실패 시 메모리 폴백). UI가 이 인터페이스만 쓰도록 `index.ts`에서 팩토리만 export
- [ ] **Step 4: 통과 확인** — `npm test` PASS
- [ ] **Step 5: 커밋** — `feat: RecordStore — localStorage 구현체 (이음새 1)`

### Task 7: 마무리 검증

- [ ] **Step 1:** `npm run build && npm test && npx tsc --noEmit` 전부 클린
- [ ] **Step 2:** README에 개발 명령 2줄 추가 (`npm run dev`, `npm test`)
- [ ] **Step 3:** 커밋·푸시 — `chore: Plan 1 완료`

## Self-Review 결과

- 스펙 커버리지: 09(스택·이음새 1)·10(택소노미)·13(토큰·스킬)·14(기록 스펙)·15(필드) 반영. 이음새 2(사용자 식별)·3(제보)은 Plan 2·3 소관 — 의도적 제외
- 타입 일관성: `Shop`·`ShopRecord`·`RecordStore` 시그니처는 본 문서 Interfaces 블록이 유일 정의
- 미결 존중: 스프 색 팔레트·시트 스냅 높이는 이 계획에 없음 (Plan 3 실기기 단계)
