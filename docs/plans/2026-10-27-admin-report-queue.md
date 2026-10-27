# /admin 제보 검수 큐 재설계 (2026-10-27)

## 배경
제보 카드가 긴 네이버 지도 URL에 밀려 가게명이 한 글자씩 세로로 접히고, 유형 배지가 줄바꿈되며, 원시 JSON "상세 페이로드"가 노출됐다. 처리 상태도 open/done 둘뿐이라 반영·중복·반려를 구분하지 못했다.

## BP 근거
- 수정 제안은 현재 값 대비 제안 값으로 판단 — Stack Overflow suggested edits, OSMCha 태그 비교
- 처리 결과 세분 — Linear Triage(Accept·Duplicate·Decline), MapRoulette(고침·이미 반영·문제 아님)
- 처리 항목 분리·재오픈 — Intercom Open/Closed
- 넘침: flex 자식 `min-w-0`, URL은 `overflow-wrap:anywhere`(Tailwind `wrap-anywhere`), 배지 `shrink-0 whitespace-nowrap`, URL 원문 대신 도메인 칩(Baymard 말줄임 가이드)
- 되돌릴 수 있는 상태 변경은 확인 창 대신 즉시 처리 + 실행 취소 토스트

## 변경 파일
- `src/views/admin/model/report-view.ts` — 순수 함수: `linkLabel`·`parseDetails`(unknown 내로잉)·`groupReports`·`editRows`·`toAdminShops`
- `src/views/admin/ui/report-card.tsx` — 카드(유형별 본문·액션·되돌리기 토스트)
- `src/views/admin/ui/admin-page.tsx` — `PageHeader`, 대기/처리됨 필터, 그룹 카드 렌더
- `src/views/admin/model/admin-api.ts` — `resolveReports(ids, resolution, note)`·`reopenReports(ids)`, 조회에 resolution·note·resolved_at
- `src/app/admin/page.tsx` — 서버에서 `toAdminShops(getShops())`를 내려 현재 값 비교에 사용
- `supabase/schema.sql` — `reports.resolution`·`note`·`resolved_at` 추가

## 절차
1. **DB 마이그레이션 선적용 필수** — 새 조회가 resolution 칼럼을 읽으므로 칼럼 없이 배포하면 제보 목록이 빈다. Supabase SQL 편집기에서 `supabase/schema.sql`의 "제보 처리 결과" 블록 실행
2. `npm test` → `npm run build`
3. 브랜치 `feat/admin-report-queue` → 로컬 검수 후 main 머지
