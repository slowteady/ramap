# 라맵 Plan 6: 카카오 로그인 + 기록 서버 저장 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Supabase 서버리스(BaaS)로 카카오 로그인 + 완식 기록 서버 저장. 백엔드 서버 없음 — 브라우저가 Supabase Auth·DB를 직접 호출. 비로그인은 현행 localStorage 유지, 로그인 시 로컬 기록을 서버로 병합 이전.

**Architecture:** 기록 의미론(완식 +1, want→visited 전이, 병합 규칙)을 순수 함수(`record-ops`)로 추출해 로컬·서버 스토어가 공유. 서버 스토어는 **메모리 write-through**(동기 RecordStore 인터페이스 유지 — 화면 코드 무변경, 쓰기는 fire-and-forget upsert). 로그인 상태 전환은 `use-records`가 auth 이벤트를 구독해 스토어를 교체.

**결정 사항:**
- `@supabase/supabase-js` 도입 (Auth 세션·PKCE를 수동 REST로 짜는 건 무의미). TanStack Query는 트리거("기록 server state화")가 형식상 걸리지만 1회 로드+write-through라 캐시·리페치 수요가 없어 **미도입 유지** — CLAUDE.md 표에 사유 갱신
- 카카오 OAuth 앱 = 기존 ramap 앱 재활용 (지도는 Keeper, 로그인은 ramap — 이전 결정)
- env 없으면 로그인 UI 자체가 숨고 현행 로컬 동작 그대로 (제보 폼과 같은 이음새 패턴)

## Global Constraints

- CLAUDE.md 전체. RecordStore 인터페이스 시그니처 불변(동기) — 화면 코드 수정 없음
- 브랜치 `feat/plan6-auth-records`

---

### Task 1: 기록 의미론 추출 + 병합 순수 함수

**Files:**
- Create: `src/entities/record/model/record-ops.ts`, `record-ops.test.ts`
- Modify: `src/entities/record/model/local-store.ts`(record-ops 사용으로 리팩터 — 기존 테스트로 동치 증명)

```ts
visitedNext(prev, shopId, at?): ShopRecord   // 신규·want→visited=count 1, visited=+1
wantNext(prev, shopId): ShopRecord | null    // visited면 null(변경 없음)
shouldReplace(prev, incoming): boolean       // 병합 규칙: count 큰 쪽·want→visited 승격
mergeRecords(base, incoming): ShopRecord[]   // 로그인 병합·importJson 공용
```

- [ ] 실패 테스트 → 구현 → 기존 local-store 테스트 포함 전체 PASS
- [ ] 커밋 `refactor: 기록 의미론 순수 함수 추출 + 병합 규칙`

### Task 2: Supabase 클라이언트 + 서버 스토어

**Files:**
- Create: `src/shared/api/supabase.ts`(env-gated 싱글턴, 없으면 null), `src/entities/record/model/synced-store.ts`, `synced-store.test.ts`, `src/entities/record/model/row-mapping.ts`(+테스트: ShopRecord↔records 행)

```ts
createSyncedRecordStore(seed: ShopRecord[], sink: RecordSink): RecordStore
// RecordSink = { upsert(r: ShopRecord): void; remove(shopId): void }  — fire-and-forget
fetchRecords(client, userId): Promise<ShopRecord[]>
supabaseSink(client, userId): RecordSink
```

- [ ] 테스트(모의 sink로 write-through 검증) → 구현 → PASS
- [ ] 커밋 `feat: Supabase 클라이언트·서버 기록 스토어`

### Task 3: use-records 로그인 전환 + use-auth

**Files:**
- Create: `src/features/auth/model/use-auth.ts`, `src/features/auth/index.ts`
- Modify: `src/features/records/model/use-records.ts`

**동작:** auth 이벤트 구독 — SIGNED_IN: 서버 기록 fetch → `mergeRecords(server, local.all())` → 병합분 일괄 upsert → synced store로 교체·notify. SIGNED_OUT: 로컬 스토어 복귀. use-auth: `{ user, signInWithKakao(), signOut() }` (signInWithOAuth provider kakao, redirectTo origin)

- [ ] 구현, tsc 클린
- [ ] 커밋 `feat: 로그인 시 기록 병합·서버 전환`

### Task 4: 로그인 UI (홈 헤더 프로필 진입점)

**Files:**
- Create: `src/features/auth/ui/auth-entry.tsx`('use client' — 헤더 아이콘 + 시트)
- Modify: `src/views/home/ui/home-page.tsx`

**동작:** env 없으면 null. 비로그인: User 아이콘 탭 → 시트("기록을 계정에 백업하세요" + 카카오로 시작하기). 로그인: 닉네임·완식 N곳·기록 백업 다운로드·로그아웃. 카카오 버튼은 브랜드 가이드 색(#FEE500) — 유일 유채색 원칙의 명시적 예외로 기록

- [ ] 구현
- [ ] 커밋 `feat: 로그인 진입점 UI`

### Task 5: 스키마·문서·검증

**Files:**
- Create: `supabase/schema.sql`(records·reports 테이블 + RLS: `auth.uid() = user_id`), `docs/planning/18.데이터전략.md`(시드→기여→공동제작 3단계, 검수 게이트 원칙, 크레딧은 로그인 후 설계)
- Modify: CLAUDE.md 미도입 표(TanStack 사유 갱신, supabase-js 도입 기록)

- [ ] `build && test && tsc` 클린 + 브라우저: env 없는 상태에서 로그인 UI 미노출·기존 동작 불변 확인
- [ ] 커밋·푸시, main 머지는 사용자 확인

## 재검수(2026-08-27) 반영 및 잔여 미결

반영: fetch 실패=로컬 유지(서버 덮어쓰기 방지) / push 실패=로컬 유지 / adopt 성공 시 로컬 스토리지 이관·클리어(로그아웃 부활 차단) / adopt 대기 중 조작 pending 재적용 / adopt 실행 토큰화(이중 실행 방지) / ready 전 진입점 비활성 / 완식 버튼 날짜 기록 / 로그인 상태 첫 완식 토스트 생략 / 전역 auth 구독은 subscribe로 이동

미결(수용, v1.5 재검토):
- 다중 탭 동시 완식 시 count 덮어쓰기 — 원자 증가 RPC 필요
- 다중 탭: 이관·클리어 후에도 옛 탭의 메모리 캐시가 adopt 병합 입력에 포함돼 옛 기록이 부활할 수 있음(스토리지 불가 환경 보존을 위해 merge 입력에 메모리를 포함한 대가) — 완전 해결은 storage 이벤트 기반 캐시 무효화
- 병합 규칙에 tombstone이 없어 두 로컬 소스(스토리지·메모리)가 어긋난 극단 케이스(쓰기만 막힌 상태의 remove)에서 삭제가 재업로드될 수 있음
- adopt 상태 기계(pendingOps·토큰·이관)가 모듈 전역이라 단위 테스트 불가 — 순수 리듀서 추출은 리팩터 부채
- 다른 탭발 계정 전환(SIGNED_OUT 없는 u1→u2) 시 전환 창의 조작이 양쪽 계정에 기록될 수 있음 — UI에 전환 경로 없음
- fetchRecords 페이지네이션 없음 — PostgREST 기본 상한(1000행) 초과 시 절단
- reports 익명 insert 레이트리밋 없음 — 스팸 시 캡차/엣지 검토
- isNewOpen의 dayjs 전환으로 타임존 경계 ±1일 이동 가능 — 현재 미사용 함수

## Self-Review 결과

- 실 로그인 E2E는 외부 의존(사용자: Supabase 프로젝트 생성 → Auth에 카카오 프로바이더 등록(ramap 앱 REST 키) → schema.sql 실행 → env 2개) — 코드·스키마까지가 이번 스코프, 활성화는 env 주입 즉시
- 로그아웃 시 서버 기록은 보존, 로컬은 **빈 상태로 복귀**(adopt 성공 시 로컬 기록을 서버로 이관하고 클리어 — 재로그인 시 서버에서 복원)
- 완식 집계 공개("이 집 N잔")는 v1.5 후속 — records가 서버에 쌓이는 이번 작업이 전제
- 제보 폼 확장(선택 상세층·문맥 프리필)은 승인된 다음 작업 — 이 플랜 머지 후 진행
