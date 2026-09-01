# 매장 상세 페이지 개편 (2026-08-31)

`/shop/{slug}`를 Plan 4 골격(2026-08-26, "폴리싱 미룸")에서 실측 관례 기반 구조로 재구성한다. 사진 데이터가 0장인 상태가 출시 기본값이라는 전제.

## 근거 — 11개 서비스 모바일 실측 (2026-08-31, Playwright 390×844 접근성 트리 + 공식 도움말)

네이버 플레이스·카카오맵·구글 지도·캐치테이블·다이닝코드·식신·당근 동네업체·타베로그·ramendb·망고플레이트(아카이브)·Yelp. 트립어드바이저는 403으로 미확인.

| 발견 | 서비스 | 라맵 판정 |
|---|---|---|
| 상세 헤더의 카테고리는 **텍스트 한 줄**(칩 없음) | 캐치 `논현 • 라멘`, 네이버 `일본식라면`, 다이닝코드 `합정 라멘, 시오라멘` | 장르 칩 → 상호 아래 텍스트 메타 "성수 · 니보시 · 시오 · 츠케멘". 3축 구조는 정보 표 행(타베로그·ramendb 표 형식)으로 보존 |
| **영업 상태 한 줄이 상호 직하단** | 네이버 `영업 종료 · 10:30에 영업 시작`, 카카오 `영업 마감 · 내일 11:00 오픈`, 구글·다이닝코드·식신·Yelp | `openStatus()`를 상세에서 켬(클라이언트 섬). 최종확인일 병기 |
| 상호 아래 **액션 아이콘 행** | 네이버 `길찾기 공유 전화 알림받기`, 카카오 `로드뷰 공유 지도 즐겨찾기`, 구글 5개, Yelp 4개 | `지도 · 길찾기 · 공유` 3개 (전화 없음, 저장은 하단 CTA에 이미 있음) |
| 하단 고정 CTA = 보조 아이콘 + 주 버튼 | 캐치 `♥ 1,935`·`전화` + 주 버튼 | 현행 `[저장][완식]` 유지 |
| 사진 0장에 **회색 placeholder 히어로를 쓰는 곳 없음** | 식신: 빈 상태 카드+등록 유도, 다이닝코드: 미니맵 | 0장이면 히어로 제거, 상호 블록이 첫 화면. 캐러셀·앨범은 2차(사진 데이터 동반) |
| 영업시간은 상태 한 줄 + 펼침, **정보 확인일 표기** | 캐치 요일 리스트, 카카오 `업데이트 2026.08.31.`, Yelp `Updated 2 months ago`, 타베로그 편집 이력·주의문 | 정보 표에 영업시간·브레이크·휴무 행 + `정보 확인 2026.8.26`(시트 `lastVerifiedAt`) |
| 오시는 길 = 주소 `복사` + 역 거리 + **길찾기 선택 시트**(네이버/카카오/티맵) | 캐치 `/info`, 카카오 `복사`, 구글 `주소 복사` | 회색 박스 제거 → 주소 행 + 복사 + 길찾기 시트. 정적 지도 이미지는 09 약관(사전 생성·캐싱 금지)으로 제외 |
| 수정 제안은 **정보 블록 직하단 일급 행** | 9개 서비스 공통. 캐치 원문 = 라맵 문구 | 유지. "폐업 신고 포함" 명시 |
| 근처 매장 교차 링크 + JSON-LD Breadcrumb·FAQ | 타베로그 `周辺のお店`·FAQPage, ramendb `近くのお店`, Yelp `More like` | 근처 라멘집 3곳 + BreadcrumbList + FAQPage(영업시간) |
| 라멘 특화 표 항목 | ramendb·타베로그 `オープン日`, `席数`, 역 거리 | 오픈일·좌석 표 행 추가. 역 거리는 데이터 없음(미결) |

## 권고 구조 (위→아래)

```
[사진 캐러셀 1/N]                       ← 2차. 0장이면 블록 없음
← (뒤로)                                ← 히어로 없을 때 헤더 행
킨카
성수 · 니보시 · 시오 · 츠케멘              ← 장르는 가이드 링크(있는 것만)
영업 종료 · 11:30 오픈                    ← 클라이언트 섬, 파싱 불가면 숨김
[지도] [길찾기] [공유]
한줄소개
── 정보 ── dl 표: 영업시간 / 브레이크 / 휴무 / 국물 / 종류 / 스타일 / 좌석 / 편의(+원격 줄서기↗) / 오픈일 / 정보 확인(검증 배지)
── 대표 메뉴 ── 이름 · 가격
── 오시는 길 ── 주소 [복사] / 길찾기 → 시트(카카오맵·네이버 지도·티맵)
잘못된 정보가 있나요? ›                  ← 수정·폐업
── 근처 라멘집 ── 3곳 (상호 · 동네 · 장르)
[♥][      완식      ]                    ← 하단 고정 유지
```

## 구현 (1차 — 데이터 변경 없음)

**파일:**

- `src/entities/shop/model/derive.ts` — `nearbyShops(shops, shop, n)` 추가 (+테스트). 좌표 없는·폐업·자기 자신 제외, 거리순
- `src/views/shop-detail/model/directions.ts` — `directionLinks(shop)` 순수 함수 (+테스트): 카카오맵 `map.kakao.com/link/to/{name},{lat},{lng}` (공식 URL 스킴), 네이버 지도(네이버플레이스 URL 있으면 그것, 없으면 `map.naver.com/p/search/{상호}`), 티맵 `tmap://route?goalname=&goalx=&goaly=`
- `src/views/shop-detail/model/genre-meta.ts` — 장르 텍스트 메타 항목(라벨·가이드 href) 순수 함수 (+테스트)
- `src/views/shop-detail/ui/open-status-line.tsx` (`'use client'`) — `openStatus(now)` → `openStatusLabel`, open이면 `text-open`
- `src/views/shop-detail/ui/detail-actions.tsx` (`'use client'`) — 지도(Link `/?shop=`), 길찾기(Drawer 시트), 공유(`navigator.share` → 폴백 클립보드+토스트)
- `src/views/shop-detail/ui/copy-address.tsx` (`'use client'`) — 클립보드 복사 + 토스트
- `src/views/shop-detail/ui/shop-detail-page.tsx` — 위 구조로 재작성. `GenreChips`·회색 히어로·가이드 배너 제거
- `src/app/shop/[slug]/page.tsx` — `nearbyShops` 계산해 props 전달
- 문서: `docs/planning/17.페이지명세.md` §3 갱신

**재사용:** `openStatus`/`openStatusLabel`(`entities/shop/model/open-status.ts`), `breadcrumbJsonLd`·`faqJsonLd`(`structured-data.ts`), `Drawer`(`shared/ui/drawer`), `ReportEntryRow`·`ReportSheet`(`features/report`), `RecordCtaBar`(`features/records`), 토큰·`rounded-chip` 태그 스타일은 홈 카드와 동일.

**절차:** 브랜치 `feat/report-sheet`에 이어서(상세 개편이 제보 진입 행과 결합) → `npx tsc --noEmit` + `npm test` + `npm run build` → Playwright 실측 → 사용자 검수 → 머지.

## 2차 (사진) — 표시 계층 구현 완료 (2026-09-01, feat/shop-photos)

- `Shop.photos: string[]` + `sync-sheet` 파서(`사진` 컬럼, 콤마 복수, 컬럼 부재 방어) + 로더 기본값 [] — 완료
- `src/views/shop-detail/ui/photo-gallery.tsx`: 히어로 캐러셀(스냅 스와이프, `1/N`) → 탭 → 앨범 3열 그리드(`?photos=1`, 뒤로가기 닫힘) → 전체화면 뷰어(스와이프·카운터·X). 0장이면 전 층 미렌더, ← 버튼은 사진 위 흰 원형 오버레이로 전환
- 이미지는 plain `<img>`(lazy) — next/image는 Storage 도메인·Vercel 최적화 쿼터 결정과 함께 후속
- 남은 것: 시트에 실제 사진 채우기(Storage 공개 버킷 — 완식 인증 파이프라인과 함께), 완식 사진 승인분 합류

## 미결

- 근처 라멘집 반경 상한 — 현재 거리순 상위 3곳(상한 없음)이라 시드 단계엔 9km도 노출. 매장 밀도가 차면(상권당 3곳+) 3km 상한 + 상한 내 0곳이면 섹션 생략으로 전환 (2026-09-01 결정)
- 역 거리(캐치 `논현역에서 218m`, 타베로그·ramendb 공통) — 시트에 필드 없음. 파트너 태깅 확장 후보
- 영업시간 요일별 구조화(캐치 요일 리스트) — 시트는 단일 문자열. 요일별 편차 매장이 늘면 스키마 확장
- 네이버·카카오의 사진 0장 실제 화면 미확인
