---
status: 유효
date: 2026-09-05
---

# 구조화 데이터 규칙 — 필수 형식을 지키고 확인할 수 없는 값은 싣지 않는다

## 맥락

13번 E절(2026-08-26)은 리스트 = ItemList(summary) + BreadcrumbList + FAQPage, 상세 = Restaurant(geo, openingHours, servesCuisine, priceRange)로 정했다. 2026-09-05 점검에서 `restaurantJsonLd`가 주소를 문자열로, `openingHours`에 시트 원문 문자열을 넣고 있었고 `url`·`image`가 없었다. 구글·네이버는 2026년에 FAQ 리치결과를 폐지했다.

## 결정

- JSON-LD 직렬화는 `toJsonLdHtml()` 하나로 — `<`를 `<`로 이스케이프(Next 공식 가이드 스니펫)
- Restaurant
  - `address`는 `PostalAddress` 객체(+`addressCountry: KR`) — 구글 LocalBusiness 필수 요건
  - `openingHours`는 생략 — 시트 원문은 hh:mm 스펙을 충족하지 못하고, 잘못된 형식이 없는 것보다 해롭다
  - `url`·`image`(사진 있을 때) 추가
  - `aggregateRating`·리뷰는 실데이터가 생기기 전 절대 금지(수동 조치 대상)
  - 인스타 계정은 `sameAs` — 여러 지점 공용 계정이면 제외 → [0014](0014-instagram-link-display.md)
- 가이드는 Article(author·publisher = Organization 라맵)
- 홈(루트 URL 전용)에 WebSite(name 라맵, alternateName Ramap) + Organization(logo)
- FAQ 마크업은 새로 늘리지 않는다. 이미 있는 상세(영업시간)·지역×장르(장르 정의) FAQPage는 무해하므로 둔다
- 폐업 매장 상세에는 Restaurant를 싣지 않는다

## 근거

- 구글 공식: local-business(필수 = name + PostalAddress), site-names(WebSite는 루트 전용), organization(logo 112px 이상), article, spam-policies(근거 없는 평점 마크업 = 수동 조치)
- 구글 FAQ 리치결과 폐지(2026-05), 네이버 FAQ 종료 공지(2026-07)
- 네이버 searchadvisor structured-data 가이드
- 표본 검증: Rich Results Test·validator.schema.org

## 버린 안

- `openingHours`에 원문 문자열 — 형식 오류
- `priceRange` — 근거 데이터 없음
- SearchAction(사이트링크 검색창) — 2024-11 폐지
