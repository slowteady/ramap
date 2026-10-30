---
status: 유효
updated: 2026-10-28
---

# shop-pages 설계

## 개요

| 경로 | 라우트 | 뷰 | 생성 |
|---|---|---|---|
| `/shop/{id}` | `src/app/shop/[slug]/page.tsx` (+`opengraph-image.tsx`) | `src/views/shop-detail/` | 전 매장 SSG(검증 안 된 폐업 제외) |
| `/area/{지역}` | `src/app/area/[area]/page.tsx` | `src/views/area-list/` | `listAreaPages` — 영업 매장이 있는 동네라벨만 |
| `/area/{지역}/{장르}` | `src/app/area/[area]/[genre]/page.tsx` | `src/views/area-list/` | `listAreaGenrePages(min=3)` 통과 조합만 |
| `/style/{계보}` | `src/app/style/[lineage]/page.tsx` | `src/views/style-landing/` | taste 계보 2개(iekei·jiro) |
| `/guide` | `src/app/guide/page.tsx` | `src/views/genre-guide/ui/guide-index-page.tsx` | 정적 |
| `/guide/{장르}` | `src/app/guide/[slug]/page.tsx` | `src/views/genre-guide/ui/genre-guide-page.tsx` | `GUIDES` 10개 |
| `/sitemap.xml`·`/robots.txt` | `src/app/sitemap.ts`·`src/app/robots.ts` | — | 빌드 시 |

- 전부 빌드 타임 SSG(`getShops()` → `data/*.json`). 페이지는 서버 컴포넌트, 클라이언트 섬은 상세의 액션·주소 복사·인스타 링크·사진 갤러리와 계보 랜딩의 완식 표시뿐 → [결정](decisions/0001-seo-hybrid-structure.md)
- 파생 계산은 `src/entities/shop/model/`의 순수 함수(`derive.ts`·`area-clusters.ts`·`closure.ts`·`instagram.ts`·`structured-data.ts`), 각자 co-located `*.test.ts`
- 2뎁스 헤더는 `src/shared/ui/page-header.tsx`(뒤로가기 + 우측 보조 액션 1개, 로고·홈 링크 없음) → [ui 설계](../ui/design.md)
- 지역 slug는 `areaLabel` 원문(한글), 장르 slug는 국물·계보 slug(`taxonomy.ts`). 매장 slug는 `shop.id`
- `generateStaticParams`는 지역을 **인코딩하지 않은 원문**으로 반환한다(인코딩하면 Next가 이중 인코딩해 percent-encoded 요청이 404). 페이지에서는 `decodeURIComponent`로 읽는다
- SSR 페이지에는 지도 위젯이 없다. 지도는 링크로만 이어진다(`/?shop={id}`, `/?soup={slug}`, `/?lineage={slug}`, `/?area={지역}`) → 홈 쪽 동작은 [map 설계](../map/design.md)

## 매장 상세 `/shop/{id}`

구조는 실측 관례를 따른다 → [결정](decisions/0003-shop-detail-structure.md)

### 화면 (위 → 아래)

| 블록 | 내용 | 구현 |
|---|---|---|
| 사진 | 사진이 있을 때만: 히어로 캐러셀(스냅 스와이프, `1/N`) → 탭하면 앨범 3열 그리드(`?photos=1`, 뒤로가기로 닫힘) → 전체화면 뷰어(스와이프·카운터·X). 이미지는 plain `<img>`(첫 장 eager, 나머지 lazy) | `ui/photo-gallery.tsx`, 드래그는 `shared/lib/use-drag-scroll` |
| 뒤로 | 사진 있으면 사진 위 흰 원형 버튼, 없으면 헤더 행. `/`로 이동, aria "지도로 돌아가기" | `ui/shop-detail-page.tsx` |
| 상호 | H1. 오픈 90일 이내면 앞에 "새로 오픈" 칩(`isNewOpen`, 빌드 시점 계산). 기준·다른 화면 표시는 [map 설계](../map/design.md#신규-오픈-표시) | `entities/shop/ui/new-chip.tsx` |
| 서브라인 | `동네 \| 장르, 장르` 텍스트. 동네는 `/area/{동네}` 링크(폐업 매장은 링크 없음), 장르는 국물 → 라멘 외 형태 → taste 계보 순, 가이드가 있으면 `/guide/{slug}` 링크. 장르는 **최대 2개**, `etc-soup`·`etc-form`·`ramen` 제외. 칩 없음 | `model/genre-meta.ts` |
| 영업 줄 | 영업 매장: `영업시간 · 브레이크 {시간} · {휴무}`(요일 휴무는 레드, "무휴"는 그대로). 휴업: "휴업 중". 폐업·이전: `폐업 · YYYY년 M월` / `이전 · …`(변경일 없으면 라벨만). 값이 없으면 숨김. 실시간 "영업 중" 판정 없음 → [공통 결정](../../decisions/0009-no-live-open-status.md) | `entities/shop/ui/open-status-badge.tsx` |
| 완식 요약 줄 | → [records 설계](../records/design.md) | `VisitSummaryLine` |
| 액션 행 | `지도 보기 · 길찾기 · 공유하기` 3칸 | `ui/detail-actions.tsx` |
| 한줄소개 | 인용 아이콘 + 테두리 박스. 값 있을 때만 | |
| 정보 표 | `dl`, 값 있는 행만(아래 표) | `infoRows()` |
| 대표 메뉴 | 이름 · 가격(`N원`, 가격 없으면 이름만) | |
| 찾아가는 길 | 주소 + [복사]. 정적 지도 없음 | `ui/copy-address.tsx` |
| 완식 기록 섹션 | → [records 설계](../records/design.md) | `ui/record-log-section.tsx` |
| 제보 진입 행 | "정보가 달라졌다면 알려주세요" — 수정·폐업 제보 → [report 설계](../report/design.md) | `ReportEntryRow`·`ReportSheet` |
| 근처 라멘집 | 3곳. 행 전체가 상세 링크(상호 + 서브라인, 서브라인 안에는 링크 없음). 자기 자신·폐업·좌표 없음 제외, 거리순, 반경 상한 없음(밀도가 낮은 지역에서 섹션을 비우면 교차 링크가 사라진다. 상권당 3곳 이상으로 차면 3km 상한 + 0곳이면 섹션 생략으로 바꾼다) | `nearbyShops(shops, shop, 3)` |
| 하단 고정 CTA | [저장][완식] → [records 설계](../records/design.md) | `RecordCtaBar` |

### 정보 표 행 (순서대로, 값 있는 행만)

| 행 | 값 |
|---|---|
| 영업시간·브레이크·휴무 | 시트 원문 |
| 인스타그램 | "계정 보기 ↗" 텍스트(aria "인스타그램 계정 보기") 새 탭 아웃링크, 터치 높이 44px. 계정명·로고 없음(타사 로고 금지 → [공통 결정](../../decisions/0002-third-party-data-boundary.md)), "인스타그램" 축약 없음(Meta 상표 규칙), 지점·브랜드 계정 구분 표기 없음(네이버 플레이스 관례) (`ui/instagram-link.tsx`) |
| 국물 | 국물 라벨(`etc-soup` 제외) + 회색으로 ` · 스프 세부` |
| 종류 | 형태 라벨(`etc-form` 제외) |
| 스타일 | taste 계보 라벨 |
| 좌석 | 원문 |
| 편의 | trait 계보(자가제면·본토직영) + 편의 태그 라벨, `·` 구분 + 원격 줄서기 링크 있으면 "원격 줄서기 ↗" |
| 문 연 날 | `YYYY.M` |
| 확인한 날 | `lastVerifiedAt`를 `YYYY.M.D` |

### 동작

| 동작 | 규칙 | 이벤트(`track`) |
|---|---|---|
| 지도 보기 | `/?shop={id}` 링크 | — |
| 길찾기 | Drawer 시트에 앱 목록. 카카오맵 `https://map.kakao.com/link/to/{상호},{lat},{lng}`(좌표 있을 때) / 네이버 지도: `naverPlace` URL, 없으면 `https://map.naver.com/p/search/{괄호 뺀 상호}` + 좌표가 있으면 `?c={WebMercator x},{y},15,0,0,0,dh`(지도 중심을 매장에 둬 가까운 동명 지점이 먼저. 비공식 파라미터라 무시돼도 이름 검색과 같다) / 티맵 `tmap://route?goalname=&goalx={lng}&goaly={lat}`(좌표 있을 때). 네이버 공식 좌표 스킴 `nmap://`은 앱 전용이고 웹 폴백이 없어 앱 미설치 폰·PC에서 열리지 않으므로 쓰지 않는다 | `directions_clicked {app, shop_id}` |
| 공유하기 | `navigator.share({title: "{상호} — 라맵", url})`, 없으면 클립보드 복사 + 토스트 "링크를 복사했어요". 공유 시트 취소는 무음 | `share_clicked {method: native\|clipboard}` |
| 주소 복사 | 클립보드 + 토스트 "주소를 복사했어요", 실패 시 "주소를 복사하지 못했어요. 주소를 길게 눌러 복사해 주세요" | `address_copied` |
| 인스타 | 새 탭 | `instagram_clicked {shop_id, shared}` |

길찾기 링크 생성은 `src/views/shop-detail/model/directions.ts`(+test).

### 폐업·이전 매장

`closurePublicState(shop, ledger)`(`entities/shop/model/closure.ts`) → [결정](decisions/0012-closed-shop-page-indexing.md)

| 상태 | 조건 | 페이지 |
|---|---|---|
| `open` | `status`가 closed 아님 | 일반 |
| `closed`·`moved` | closed + 검증 장부(`data/closure-verification.json`, `getClosureLedger`)에 판정 있음 | 제목 앞 `[폐업]`/`[이전]`, 설명 앞 "YYYY년 M월에 문을 닫았어요. "/"YYYY년 M월에 이전했어요. "(`views/shop-detail/model/gone-description.ts`), 영업 줄에 폐업·이전 표기, 서브라인 동네 링크 없음, Restaurant JSON-LD 없음. 색인 기준은 일반 매장과 같다 |
| `hidden` | closed인데 장부에 없음 | 정적 생성 안 함 → 404, 사이트맵 제외 |

폐업 매장은 지역·지역×장르·계보·가이드 리스트와 근처 라멘집에서 빠진다. 폐업 판정 절차 → [data 설계](../data/design.md)

### 메타데이터

| 항목 | 값 |
|---|---|
| title | `{[폐업] /[이전] }{상호} — {동네 또는 구} 라멘` + 루트 템플릿 ` \| 라맵` |
| description | `동네 · 국물 라벨들 · 첫 메뉴 가격` (없으면 "{상호} 정보를 라맵에서 확인하세요."), 폐업·이전이면 앞에 안내 문장 |
| canonical | `/shop/{id}` |
| robots | `shouldNoindexShop` = `isThinShop`이면 `index: false` → [결정](decisions/0008-noindex-criteria.md) |
| og:image | 첫 사진 가로 크롭 풀블리드, 없으면 중앙 로고 카드(`src/shared/lib/og-card.tsx`, 1200×630, jpeg·png만) |
| JSON-LD | Restaurant(영업 매장만) + BreadcrumbList(라맵 › 동네 › 상호, 동네 없으면 생략) + FAQPage(영업시간 있을 때 "{상호} 영업시간은?" → 영업시간, 브레이크, 휴무) |

`isThinShop`: 영업시간·메뉴·스프 세부·아부라소바 형태·사진·한줄소개가 모두 없으면 얇은 페이지.

## 지역 `/area/{지역}` · 지역×장르 `/area/{지역}/{장르}`

한 뷰(`AreaListPage`, `src/views/area-list/ui/area-list-page.tsx`)를 두 라우트가 쓴다.

| 블록 | 내용 |
|---|---|
| 헤더 | `PageHeader` + 우측 "지도에서 보기"(아래 버튼과 같은 링크) |
| 브레드크럼 | 텍스트 `라맵 › {지역}( › {장르})` |
| H1 | `{지역}( {장르}) 라멘 맛집 {N}곳 ({빌드 연도})` |
| 인트로 | 지역: 대표 국물 분포 상위 3(`soupBreakdown`, "니보시 3곳 · …") 한 줄. 지역×장르: 없음(H1이 같은 말을 한다) |
| 매장 리스트 | 행마다 상호 / 장르 칩(`GenreChips`) / 영업 줄 + 편의(식권기·카에다마·원격 줄서기). 상세 링크. 썸네일 없음 |
| 지도에서 보기 | 지역: `/?area={지역}`. 지역×장르: `/?soup={slug}&area={지역}` 또는 `/?lineage={slug}&area={지역}` — 홈이 그 지역으로 이동(`views/area-list/model/map-href.ts`) |
| FAQ | 지역×장르만: "{장르} 라멘이란?" → 택소노미 `description` + "이에요/예요"(`model/area-copy.ts` `faqAnswer`) |
| 교차 링크 | "근처 지역·다른 장르" 칩. 지역: 그 지역의 생성된 장르 조합 전부(↓) + 가까운 지역 6곳 `{지역} 라멘 {N}곳`(→, `nearestAreas`). 지역×장르: `{지역} 전체`(↑) + 다른 생성 조합 5개 |

| 메타 | 지역 | 지역×장르 |
|---|---|---|
| title | `{지역} 라멘 맛집 {N}곳` | `{지역} {장르} 라멘 맛집 {N}곳` |
| description | `{지역}의 라멘집 {N}곳. 국물 종류·영업시간과 위치를 라맵 지도에서 확인하세요.` | `{지역}의 {장르} 라멘집 {N}곳. 영업 정보와 위치를 라맵 지도에서 확인하세요.` |
| canonical | `/area/{인코딩 지역}` | `/area/{인코딩 지역}/{장르}` |
| noindex | 매장 3곳 미만(`shouldNoindexArea`) | `etc-soup`(`shouldNoindexAreaGenre`) |
| JSON-LD | ItemList(매장 상세 URL) + BreadcrumbList | ItemList + BreadcrumbList + FAQPage |

- 매장 집합: `shopsByArea`(동네라벨 일치, 폐업 제외), `shopsByAreaGenre`(+ 국물 또는 계보 slug 포함)
- 생성: 지역은 `listAreaPages`(동네라벨 기준 클러스터 중 영업 매장이 있는 것 — 지도 클러스터의 구 폴백 묶음은 제외), 지역×장르는 `listAreaGenrePages(shops, 3)`(3곳 기준의 이유는 [요구사항](requirements.md)). 미생성 조합 요청은 `notFound()`. 모든 조합을 만들고 noindex하는 방식은 쓰지 않는다 — 크롤 표면만 늘고 사이트맵·내부 링크 정합이 깨진다
- 색인 제외 → [결정](decisions/0008-noindex-criteria.md)

## 계보 랜딩 `/style/{계보}`

`src/views/style-landing/ui/style-landing-page.tsx`

| 블록 | 내용 |
|---|---|
| 에디토리얼 헤더 | `bg-ink` 고정 색 블록(다크 모드 아님): `PageHeader dark` + 우측 "지도에서 보기"(`/?lineage={slug}`) / "스타일" 아이브로 / 계보명(H1) + 일본어 표기 / 설명 / 통계: 등록 N곳 · 국물(많은 국물 상위 2) |
| 빈 상태 | "{계보} 라멘집을 알면 알려주세요" |
| 리스트 | 상호 + 완식 ✓(`ui/visited-check.tsx`, `useRecords().visitedIds`) / 계보·라멘 외 형태·동네 / 영업 줄. 영업 매장만 |
| 더 알아보기 | "{계보} 가이드" + 다른 taste 계보 링크 |

- 진행률 바 없음 → [records 요구사항](../records/requirements.md#1단-소목록-진행률-보류)
- 메타: title `{계보} 라멘 지도`, description `{계보} — {설명}. 전국 {계보} 라멘집 {N}곳을 라맵에서 확인하세요.`, canonical `/style/{slug}`. JSON-LD 없음
- trait 계보 slug 요청은 404

## 장르 가이드 `/guide` · `/guide/{장르}`

대상은 국물 8 + taste 계보 2. 자가제면·본토직영은 맛 계열이 아니라 특성이라 가이드가 없다. 대표 매장은 아래 순위로 데이터에서 계산한다(파트너가 수동으로 붙이는 `대표` 플래그 없음 — 운영 부담, 기준 불투명)

- 콘텐츠 원천: `src/entities/shop/model/guide-content.ts`의 `GUIDES` — `intro[]`·`boundary`(경계 설명)·`traits{taste, body}`·`origin`·`sources[]`. 출처에 있는 내용만 쓰고 출처 간 상충은 본문에 그대로 밝힌다
- 슬러그 10개: niboshi·tonkotsu·shoyu·shio·miso·tonkotsu-shoyu·toripaitan·tantanmen·iekei·jiro (gyokai·tomato 국물은 가이드 없음)

`/guide/{장르}` 화면:

| 블록 | 내용 |
|---|---|
| 헤더 | `PageHeader` + 우측 "지도에서 보기"(`/?soup=` 또는 `/?lineage=`) |
| 제목 | 장르명(H1) + 일본어 표기 |
| 본문 | `intro` 문단들 + `boundary` |
| 한눈에 | 맛 · 농도 · 기원 표 |
| 대표 {장르} 라멘집 | `shopsByGenre` 상위 5곳(상호 / 동네 · 한줄소개). 5곳 초과면 "지도에서 {N}곳 모두 보기" |
| 참고 | 출처 링크(새 탭) |

- `shopsByGenre` 순위: 대표 국물 일치(계보는 포함 여부) > 운영자 확인(`verification === "confirmed"`) > 태깅확신도 확정(`confidence === "certain"`) > 한줄소개 있음 > 최근 확인일. 폐업 제외
- 메타: title `{장르} 가이드`, description = 첫 intro 문단, canonical `/guide/{slug}`. JSON-LD Article(headline `{장르} 라멘 가이드`, author·publisher = Organization 라맵)
- `/guide` 색인: H1 "장르 가이드" + 가이드 목록(이름 + 택소노미 설명). title "장르 가이드", canonical `/guide`

## 구조화 데이터

빌더는 `src/entities/shop/model/structured-data.ts`(+test). 검색엔진 필수 형식을 지키고, 확인할 수 없는 값은 싣지 않는다.

| 빌더 | 쓰는 곳 | 필드 |
|---|---|---|
| `toJsonLdHtml(...objs)` | 모든 JSON-LD `<script>` | 1개면 객체, 여러 개면 배열로 직렬화하고 `<`를 `<`로 이스케이프(Next 공식 가이드 방식). 직렬화는 이 함수 하나로만 |
| `websiteJsonLd` | 홈(`src/views/home/ui/home-page.tsx`) | WebSite name "라맵", alternateName "Ramap", url |
| `organizationJsonLd` | 홈 | Organization name·url·logo(`/apple-icon.png`) |
| `restaurantJsonLd(shop, {instagramShared})` | 상세(영업 매장) | name, url, servesCuisine "라멘", address(PostalAddress: streetAddress·addressRegion=city·addressLocality=district·addressCountry KR), image(사진), geo, hasMenu(MenuItem + Offer KRW), sameAs(인스타, 공용 계정이면 생략 — `sameAs`는 같은 실체를 뜻하는데 공용 계정은 이 매장과 같은 실체가 아니다), keywords(국물 라벨). openingHours·priceRange·aggregateRating 없음 |
| `itemListJsonLd` | 지역·지역×장르 | url, numberOfItems, ListItem(position 1부터, name, 상세 URL) |
| `breadcrumbJsonLd` | 상세·지역·지역×장르 | ListItem(position, name, item) |
| `faqJsonLd` | 상세(영업시간)·지역×장르(장르 정의) | 기존 두 곳만. 새로 늘리지 않는다 |
| `articleJsonLd` | 가이드 | headline, url, description, author·publisher Organization |

공용 계정 판정 `isSharedInstagram`(`entities/shop/model/instagram.ts`): 같은 계정을 **주소가 다른** 다른 매장도 쓰면 공용.

| 규칙 | 이유 |
|---|---|
| Restaurant `address`는 `PostalAddress` 객체(+`addressCountry: KR`) | 구글 LocalBusiness 필수 요건(name + PostalAddress) |
| `openingHours` 없음 | 시트 원문은 hh:mm 스펙을 충족하지 못한다. 잘못된 형식은 없는 것보다 해롭다 |
| `priceRange` 없음 | 근거 데이터가 없다 |
| `aggregateRating`·리뷰 없음(실데이터 전까지) | 근거 없는 평점 마크업은 구글 스팸 정책상 수동 조치 대상 |
| WebSite는 홈(루트 URL)에만, Organization logo는 112px 이상 | 구글 site-names·organization 요건 |
| FAQPage는 기존 두 곳만, 새로 늘리지 않는다 | 구글·네이버가 FAQ 리치결과를 폐지했다. 기존 것은 무해하다 |
| SearchAction 없음 | 사이트링크 검색창 폐지 |
| 폐업 매장 상세에는 Restaurant 없음 | [결정](decisions/0012-closed-shop-page-indexing.md) |

## 색인·사이트맵

- 루트 메타(`src/app/layout.tsx`): `metadataBase` https://ramap.kr, title 기본 "라맵 — 라멘 맛집 지도"·템플릿 `%s | 라맵`, openGraph `siteName 라맵 · locale ko_KR · type website`, 네이버 소유확인 meta. 자식 세그먼트가 openGraph를 정의하면 얕은 병합이라 전체가 대체된다
- canonical: 홈 `/`(필터·시트 쿼리 흡수), 상세·지역·지역×장르·계보·가이드·가이드 색인·약관·개인정보에 각자 경로
- noindex: 얇은 매장, 3곳 미만 지역, `etc-soup` 조합, `/admin`·`/me`·`/settings`
- `robots.ts`: 전체 허용, `/admin`·`/me`·`/settings` 차단, 사이트맵 선언
- `sitemap.ts` 포함 항목:

| 항목 | priority | 조건 |
|---|---|---|
| 홈 | 1 | — |
| `/guide` | 0.8 | — |
| `/guide/{slug}` | 0.8 | `GUIDES` 전부 |
| `/style/{slug}` | 0.8 | taste 계보 |
| `/shop/{id}` | 0.7 | 얇지 않고 `hidden` 아님. 사진 있으면 `images` |
| `/area/{지역}` | 0.8 | 매장 3곳 이상 |
| `/area/{지역}/{장르}` | 0.8 | 생성 조합 중 `etc-soup` 아님 |

- `lastModified`: 담긴 매장들의 최신 변경일. 매장 변경일 원천은 `data/shop-lastmod.json`(`getShopLastmod`, 시트 동기화가 내용 해시로 갱신), 없으면 `lastVerifiedAt`. `/guide`는 없음
- 검색엔진 등록: 구글 서치콘솔(HTML 파일 소유확인 `public/googlec4e4153e5f45058b.html`), 네이버 서치어드바이저(meta 소유확인 — 검증기가 JS를 실행하지 않아 SSR HTML에 있어야 한다, `https://ramap.kr` 호스트 단위). 둘 다 사이트맵 제출됨
- IndexNow: `npm run indexnow`(`scripts/indexnow.ts`) — 기본은 프로덕션 sitemap.xml 전체, 인자로 개별 URL. 최대 1만 URL, `searchadvisor.naver.com/indexnow`로 POST(Bing에도 전파). 키 파일 `public/63ade0b0eb4cc68704f932e7e046aade.txt`. 데이터 라운드 배포 뒤 실행
- 색인 추적: 주 1회 `site:ramap.kr` + 서치어드바이저 URL 검사

## 검증

- `npm test` — `derive.test.ts`·`structured-data.test.ts`·`directions.test.ts`·`genre-meta.test.ts`·`instagram-link.test.tsx`·`style-landing-page.test.tsx`
- `npm run build` → `npx next start -p 3002` 후 `curl`로 robots·sitemap·percent-encoded 지역 URL 200·JSON-LD 확인
- 표본을 Rich Results Test·validator.schema.org로 확인
- `npm run test:e2e` — `e2e/shop-detail.spec.ts`(상세 정보·영업 줄·액션, OG 메타, 없는 매장 404)
