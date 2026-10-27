# 이용 통계 (PostHog) — 2026-10-27

## 구성
- PostHog 조직 `ramap`(keeper와 분리 — 무료 플랜은 조직당 프로젝트 1개), 프로젝트 690709, US 리전
- 초기화: `src/instrumentation-client.ts` 한 곳. `api_host: "/ingest"`(next.config rewrites로 us.i.posthog.com 프록시, `skipTrailingSlashRedirect`), `ui_host: NEXT_PUBLIC_POSTHOG_HOST`
- 토큰 `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`은 **Vercel Production에만** — 로컬·프리뷰는 미초기화(운영 데이터 오염 방지). 로컬에서 확인하려면 셸에서 일시 주입 후 `npm run build && npx next start`
- 켬: 자동 클릭 수집, 페이지뷰/이탈(`defaults: "2026-08-30"`), 히트맵, 데드 클릭, 예외, 웹바이탈. 끔: 세션 녹화(`disable_session_recording`) — 켜려면 이 옵션만 false + 처리방침에 녹화 고지 추가
- 공통 속성: `page_type`(`before_send`, `shared/lib/analytics-context.ts` `pageTypeOf`), `in_app`(카카오톡·인스타·네이버·페이스북·라인 인앱 브라우저)
- 로그인: Supabase user id로만 `identify`(이메일·닉네임 미전송), 로그아웃·탈퇴 시 `reset`. 운영자(`role=admin`)는 `opt_out_capturing`
- 개인정보처리방침 2026-10-27판: 자동 수집 항목, 목적, 1년 보관, PostHog(미국) 위탁·국외 이전, 쿠키 거부 방법

## 커스텀 이벤트 (`src/shared/lib/analytics.ts`의 `EventMap`이 단일 원천)

| 이벤트 | 위치 | 속성 |
|---|---|---|
| filter_changed | `views/home/model/use-map-filters.ts` | soups·forms·lineages·new_only·active_count |
| hide_visited_toggled | `views/home/ui/shop-map.tsx` | on |
| shop_selected | `shop-map.tsx` | shop_id, source(map/list/search) |
| search_result_selected | `views/home/ui/search-overlay.tsx` | kind(shop/genre/area), value, query |
| locate_clicked | `shop-map.tsx` | granted |
| map_load_failed | `views/home/model/use-shop-map.ts` | — |
| record_toggled | `features/records/model/use-visit-action.ts` | kind(visited/saved), on, shop_id |
| record_log_submitted | `features/records/ui/record-log-sheet.tsx` | shop_id, photo_count, has_comment, revisit, ok |
| report_opened / report_submitted | `features/report/model/use-report-query.ts` / `use-report-submit.ts` | type / type, ok |
| directions_clicked / share_clicked / address_copied | `views/shop-detail/ui/detail-actions.tsx`, `copy-address.tsx` | app·shop_id / shop_id, method / shop_id |
| login_started / account_deleted | `features/auth/model/use-auth.ts` | — |

새 이벤트는 `EventMap`에 타입을 먼저 추가하고 `track()`으로만 보낸다(posthog 직접 호출 금지).

## 유입 경로
`$referring_domain`(구글·네이버·디시 등)과 utm은 SDK 기본 수집. 인앱 브라우저는 referrer가 비는 경우가 많아 `in_app`으로 보완하고, 직접 배포하는 링크(인스타 프로필 등)에는 `?utm_source=` 부착. 검색어는 Search Console·서치어드바이저에서 본다.
