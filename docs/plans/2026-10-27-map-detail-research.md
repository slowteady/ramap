# 지도·상세 개선 리서치 — 항목별 검토 (2026-10-27)

딥리서치(국내 지도·맛집 / 일본 라멘 특화·글로벌 기록 앱 / 라멘GPS 경쟁) 결과를 **항목 하나씩 PO 검토 → 채택 항목만 구현**하는 작업 문서. 결정이 나면 `결정` 칸과 날짜를 채우고, 채택 항목은 구현 시 기획 문서(`docs/planning/14`·`17`)를 함께 갱신한다.

상태: `대기` → `채택`/`보류`/`기각`. 구현 완료 시 `완료(커밋)`.

## 현재 데이터 커버리지 (2026-10-27, 영업 매장 1,301곳)

| 필드 | 보유 | 비율 |
|---|---|---|
| 영업시간 | 894 | 69% |
| 브레이크 | 430 | 33% |
| 휴무 | 460 | 35% |
| 메뉴 | 697 | 54% |
| 인스타 | 656 | 50% |
| 최종확인일(`lastVerifiedAt`) | 0 | 0% |

라이브 상태·정보 확인일 계열(M1·M3·D1·D2)은 이 커버리지에 묶인다.

## 이미 있는 것 (후보에서 제외)

길찾기 시트(카카오·네이버·티맵), 공유, 주소 복사, 근처 매장, 가까운 순, 동네 클러스터 "지역명+개수", 완식 회색조 마커 + "완식 숨기기" 칩, NEW 배지, 제보·핀 피커, 계보 랜딩의 소목록 진행률(`src/views/style-landing/ui/style-progress.tsx`), 폐업·이전 페이지(`closurePublicState`).

## 항목

### M1. "지금 영업중" 필터 — `대기`
- 제안: 필터에 영업중 토글. 시간 파싱으로 현재 영업 중인 매장만
- 근거: 카카오맵 검색 영업중 필터([클리앙](https://www.clien.net/service/board/news/16455813)), jirolianmap 상태 색 핀([GitHub](https://github.com/kohyalab/jirolianmap))
- **기존 결정과 충돌**: `src/entities/shop/ui/open-status-badge.tsx` — "실시간 '영업중' 판정은 시트 데이터 최신성이 보장되기 전까지 표시하지 않는다". 영업시간 보유 69%, 확인일 0%라 틀린 "영업중"이 나올 위험. 채택 시 최신성 기준(예: 최근 N개월 내 확인된 매장만 판정)을 먼저 정해야 함
- 코드: `src/views/home/model/filter.ts`(`MapFilters`), `src/views/home/ui/filter-sheet.tsx`, 시간 파싱 순수 함수 신설(`entities/shop/model/`)
- 작업량: 중(파싱·테스트) / 결정:

### M2. 저장한 곳 지도 표시 + "저장한 곳만" 토글 — `대기`
- 제안: 저장(가고 싶다) 매장을 북마크 마커로, 칩으로 저장한 곳만 보기
- 근거: 네이버 저장리스트 지도 토글([ZDNet](https://zdnet.co.kr/view/?no=20221213140210)), 타베로그 行った・行きたい地図, Corner
- **명세에 있는데 구현 누락**: `docs/planning/17` §1 "마커 상태 = 선택 > 저장(북마크) > 기본 > 완식". 코드 `MarkerState`는 `default|selected|visited`뿐(`src/shared/map/types.ts`)
- 코드: `src/shared/map/kakao-adapter.ts`(`markerEl`), `src/views/home/model/label-collision.ts`(상태 우선순위), `src/views/home/ui/shop-map.tsx`(`visitedIds` 옆에 `savedIds`), `filter-chips.tsx`(`hideVisited` 패턴 재사용)
- 작업량: 소 / 결정:

### M3. 목록 행에 영업 정보 한 줄 — `대기`
- 제안: 바텀시트 목록 행에 "11:00-21:00 · 브레이크 15:00" (라이브 판정 없이 시간만)
- 근거: 카카오 필터 결과 목록 반영
- 코드: `src/views/home/ui/shop-sheet.tsx` 목록 행, `OpenStatusBadge` 재사용
- 작업량: 소 / 결정:

### M4. 계보 필터 시 진행률 "이에케 4/12 완식" — `대기`
- 제안: 계보 필터를 켜면 시트 상단에 내 완식 진행률
- 근거: jirolianmap "X/Y店舗", Beli "0 of 15"([Pratt IxD](https://ixd.prattsi.org/2026/09/a-design-critique-of-beli-restaurant-discovery-and-social-platform/)), 14번 문서 1단 5번
- 코드: `style-progress.tsx`의 계산을 순수 함수로 내려 홈 시트에서 재사용(2페이지 재사용 → entities/records 또는 features로 추출 조건 충족 여부 확인)
- 작업량: 소 / 결정:

### D1. 상세 상단 영업 정보 재배치 + 라스트오더 — `대기`
- 제안: 상태(휴업 등) → 정기휴무 → 시간·브레이크 순, 라스트오더 필드 신설
- 근거: Retty 상단 상태([예시](https://retty.me/restaurant/100001526949/)), 네이버 플레이스 라스트오더 별도 입력([eventmoa](https://eventmoa.kr/k/%EB%84%A4%EC%9D%B4%EB%B2%84-%ED%94%8C%EB%A0%88%EC%9D%B4%EC%8A%A4-%EC%A0%95%EB%B3%B4-%EB%B3%80%EA%B2%BD/))
- 라스트오더는 시트 스키마 컬럼 추가 필요(`docs/planning/15`, `scripts/lib/sheet-parser.ts`, `Shop` 타입)
- 코드: `src/views/shop-detail/ui/shop-detail-page.tsx`, `open-status-badge.tsx`
- 작업량: 중(스키마) / 결정:

### D2. "정보 확인일" 상단 노출 — `대기`
- 제안: 마지막 확인일을 영업 정보 옆에, 오래되면 표시
- 근거: 두쫀쿠맵 마지막 업데이트 시각·오래된 매장 숨김([토스](https://toss.im/apps-in-toss/blog/dubaicookiemap))
- **데이터 없음**: `lastVerifiedAt` 0곳. 대안 = `data/shop-lastmod.json`(데이터 변경일, 확인일 아님). 확인일 운영 체계부터 정해야 함
- 작업량: 중(운영) / 결정:

### D3. 네이버 길찾기를 좌표 길찾기로 — `대기`
- 제안: 지금 네이버는 이름 검색(`map.naver.com/p/search/{이름}`) → 좌표 경로 URL. 공식 스킴 `nmap://route/public?dlat=..&dlng=..&dname=..&appname=ramap.kr`(`appname` 필수), 앱 미설치 시 웹 폴백 필요
- 근거: [NCloud URL Scheme](https://guide.ncloud-docs.com/docs/maps-url-scheme). 공공데이터 좌표를 외부로 넘기는 링크라 약관 무관
- 코드: `src/views/shop-detail/model/directions.ts`(+ 테스트)
- 작업량: 소 / 결정:

### D4. "주문 방법" 블록 — `대기`
- 제안: 식권기 여부, 면 굳기·맛 농도·기름량(이에케), 콜(지로) 사실 정보
- 근거: 家系マニア 구조화 필드([App Store](https://apps.apple.com/jp/app/id6767432534)), オールウェイズ二郎 콜 안내. 17번 명세 시트 요소에 "방문정보 태그(식권기·카에다마 등)"가 이미 있음
- 데이터 수집 필요(시트 컬럼 + 디깅)
- 작업량: 중~대(데이터) / 결정:

### D5. 상세 "내 기록" 블록 — `대기`
- 제안: 첫 완식일·완식 N회
- 근거: Letterboxd 고유 작품 수/다이어리 분리([지원](https://support.letterboxd.com/hc/en-us/articles/15178803712527-Why-does-my-films-total-differ-from-my-diary-entries-total))
- 코드: `src/views/shop-detail/ui/record-log-section.tsx`(이미 기록 섹션 존재 — 무엇이 빠졌는지 대조 필요)
- 작업량: 소 / 결정:

### F-A. 소목록 완주 진행률 + 공유 이미지 — `대기`
- 제안: "서울 이에케 7/7 완주" 인정증·스탬프카드 이미지
- 근거: 二郎スタンプラリー 생성 이미지([사이트](https://jiro-stamp2.maguro.dev/)), 일본 스탬프랠리 단계형 목표([닛케이](https://www.nikkei.com/article/DGXZQOCC153GC0V11C26A0000000/)), 14번 문서 2단(공유 이미지·인정증)
- 코드: `src/shared/lib/og-card.tsx`(satori) 재사용, `style-progress.tsx`
- 작업량: 중 / 결정:

### F-B. 큐레이션 컬렉션 페이지 — `대기`
- 제안: 운영자 큐레이션 SSG 페이지("겨울 니보시 7선") + 홈 시트 진입점
- 근거: 망고픽([브런치](https://brunch.co.kr/@startupalliance/45)), 카카오 테마지도, 네이버 인기 저장리스트([바이라인](https://byline.network/2025/06/19_naver-2/)). SEO 고유 콘텐츠 단위(지역 얇은 페이지 대체)
- 코드: 신규 `src/app/collection/[slug]`, `views/collection`, 데이터 `data/collections.json`
- 작업량: 소~중(콘텐츠 작성이 본체) / 결정:

### F-C. 내 완식 지도 — `대기`
- 제안: /me에서 내 완식·저장만 지도로
- 근거: Swarm 체크인 지도([지원](https://support.foursquare.com/hc/en-us/articles/12534514074012-Swarm-check-ins)), Atlas Obscura Been There
- 코드: `src/views/me/ui/me-page.tsx` + 지도 컴포넌트 재사용(`shared/map`)
- 작업량: 소~중 / 결정:

### F-D. 연말 "올해의 라멘" 이미지 — `대기`
- 제안: 10곳 이상 완식한 해에만 생성
- 근거: Untappd Recappd([axeetech](https://axeetech.com/untappd-year-in-beer-uncappd/)), Letterboxd 10편 임계([YIR](https://letterboxd.com/year-in-review/)), 14번 문서 2단
- 작업량: 중 / 결정:

### F-E. 저장 리스트 공유 링크 — `대기`
- 제안: 읽기 전용 공개 링크, **기본 비공개**
- 근거: 카카오 즐겨찾기 구독([고객센터](https://cs.kakao.com/helps_html/1073186880?locale=ko)), 카카오 폴더 공개 논란 후 기본 비공개([아이뉴스24](https://www.inews24.com/view/1335312))
- Supabase 공개 플래그·RLS 필요
- 작업량: 중 / 결정:

## 기각 (원칙 충돌 — 재검토 시에만 꺼냄)

| 항목 | 사유 |
|---|---|
| 스트릭·방문 수 배지·레벨 | 14번 문서 D계열 금지. Untappd 수량 배지 과음 보상 비판([arXiv](https://arxiv.org/html/2601.04841v1)) — 라멘은 과식 |
| 공개 리더보드·랭킹·기여 등급 | 14번 문서 금지. Swarm도 친구 한정으로 후퇴([Geoawesome](https://geoawesome.com/foursquare-brings-back-badges-and-mayorships-to-swarm-app/)) |
| 별점·리뷰 키워드 요약 | 별점 배제 원칙, 리뷰 없음 |
| 실시간 대기 시간 | 유저 밀도 전제 |
| 인스타 스크래핑 | Meta 약관(로그인 무관 자동 수집 금지, [Meta Terms](https://www.facebook.com/terms)) + 플랫폼 크롤링 금지 원칙 |

## 경쟁 메모 — 라멘GPS (ramengps.com)

단일 페이지(카카오맵+Firestore), 사이트맵 홈 1개·매장 URL 없음, 마지막 공지 2025-06-19, 도메인 2025-06-01 등록. 구글 "라멘지도" 1위 원인 추정 = 도메인 나이 + 제목 집중. 숨김 h1 사용(따라 하지 말 것). 네이버 웹문서에서는 라맵이 "라멘 지도"·"서울 라멘 맛집 지도" 1위, "라멘지도" 2위(2026-10-27 확인).

## 작업 절차

1. 항목별 검토 → `결정` 칸 갱신(이 문서, main 직접 커밋 허용 — docs 1파일)
2. 채택 항목마다 브랜치 `feat/<항목>` → TDD(순수 함수 `*.test.ts`, 컴포넌트 `*.test.tsx`) → UI는 ramap-ui 스킬 → 로컬 확인 → main 머지
3. 검증: `npm test` · `npm run build` · 필요 시 `npm run test:e2e`
4. 기획 문서 동기화: 지도·상세 변경은 `docs/planning/17`, 리텐션 계열은 `docs/planning/14`
