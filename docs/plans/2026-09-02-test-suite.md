# 테스트 스위트 구축 — 단위·렌더링·시나리오 3계층

2026-09-02 PO 지시: "이제라도 테스트 다시 다 작성해 — 단위, 렌더링, 시나리오 전부". 이후 신규 기능은 TDD(테스트 선행).

## 현황 (착수 시점)

- 단위: Vitest+jsdom, 순수 함수 29파일 182케이스 (`src/**·scripts/**` co-location)
- 렌더링·시나리오: 없음
- 미테스트: 훅 전부(use-\*), 컴포넌트 전부, E2E 전부

## 계층 설계

| 계층 | 도구 | 위치 | 대상 |
| --- | --- | --- | --- |
| 단위 | Vitest (기존) | `*.test.ts` co-location | model/·lib/ 순수 함수 — 빈틈 보강(filter-axes·row-mapping·report-options) |
| 렌더링 | Vitest + @testing-library/react·user-event·jest-dom | `*.test.tsx` co-location | 클라 훅(renderHook)·leaf 컴포넌트 — 조건부 표시·핸들러 배선 |
| 시나리오 | @playwright/test | `e2e/*.spec.ts` | 비로그인 핵심 여정 (로그인 여정은 카카오 OAuth라 자동화 불가 — 보류) |

## 기존 코드 포인터

- vitest 설정: `vitest.config.ts` — include에 `.test.tsx` 추가, setup 파일(`vitest.setup.ts`, jest-dom) 등록
- URL 상태 훅들은 `next/navigation` 의존 — `src/shared/testing/next-navigation.ts` 모킹 헬퍼로 통일
- 지도는 `src/shared/map/types.ts` MapAdapter 인터페이스 — 렌더링 테스트에서 어댑터 페이크 주입, E2E는 실 SDK(localhost 도메인 등록됨)
- 기록은 RecordStore 인터페이스(`src/entities/record`) — 로컬 스토어 페이크 사용
- E2E 서버: `playwright.config.ts` webServer로 `npm run dev` 자동 기동, `NEXT_PUBLIC_KAKAO_MAP_KEY`는 `.env.local`

## 시나리오 목록 (e2e)

1. 홈: 지도 로드 → 상권 클러스터 표시 → 시트 "이 지역 매장 N곳" 정합
2. 클러스터 탭 → 줌인 → 개별 마커 전환
3. 필터: 국물 선택 → 지도·목록 축소, 칩 활성 표시
4. 검색: 오버레이 → 초성/일반 검색 제안 → 매장 선택 → 카드 표시
5. 상세: 정보 행·대표 메뉴·근처 라멘집·OG 메타 존재
6. 제보 신규: 폼 열기 → 입력 → 닫기 → 이탈확인 모달 → 계속 쓰기/나가기
7. 지도 폴백: SDK 요청 차단(route intercept) → 폴백 리스트+배너

## 검증 명령

- `npm test` — 단위+렌더링 (CI 겸용)
- `npm run test:e2e` — Playwright (chromium, dev 서버 자동 기동)

## 작업 절차

feat/test-suite 브랜치 → 계층별 커밋 → 전체 그린 확인 후 main 머지. 배포 산출물 변화 없음(테스트 전용).

## 진행 현황

- [x] 도구 설치 (@testing-library/react·user-event·jest-dom, @playwright/test)
- [x] vitest 설정 확장(esbuild jsx·setup 폴리필) + 단위 빈틈 보강 (filter-axes·row-mapping·report-options)
- [x] 훅 renderHook 테스트 (use-map-filters·use-recent-searches·use-selected-shop·use-search-query·use-report-form)
- [x] 컴포넌트 렌더링 테스트 (shop-card·open-status-line·discard-dialog·filter-chips·record-buttons·record-log-sheet 이탈확인 통합)
- [x] playwright 설정 + 시나리오 11케이스 (홈 4·상세 3·제보 3·지도 폴백 1) — 클러스터 탭은 dispatchEvent("click") 필요(오버레이 재배치)
- [x] CLAUDE.md 라이브러리 표·명령·테스트 컨벤션 갱신

최종: 단위+렌더링 225케이스 · E2E 11케이스 전체 그린 (2026-09-02)
