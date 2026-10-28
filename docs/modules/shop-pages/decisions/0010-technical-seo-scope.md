---
status: 유효
date: 2026-09-05
---

# SEO 기술 최적화 범위 — 규모에 맞지 않는 최적화는 하지 않는다

## 맥락

2026-09-05 `site:ramap.kr` 구글·네이버 색인 0건. 색인을 막던 결함(지역 URL 이중 인코딩 404 755개, robots.txt 부재, canonical 전무)을 고친 뒤, 다음에 무엇을 하고 무엇을 하지 않을지 정했다.

## 결정

하지 않는다:

| 항목 | 이유 |
|---|---|
| `generateSitemaps` 분할 | 50k 한도의 4%뿐 |
| 크롤 예산 최적화 | 100만+ 페이지 대상 기법, 라맵은 약 2.1k |
| 스트리밍 메타데이터 대응 | 전량 SSG라 해당 없음(Next v16.3 공식 문서) |
| SearchAction | 2024-11 폐지 |
| `aggregateRating` 마크업 | 데이터 없음 = 수동 조치 대상 |
| UA 분기 동적 렌더링(캐치테이블 방식) | SSG에 불필요·비권장 |
| FAQ 마크업 신규 | 양대 엔진 리치결과 폐지 |
| 백링크 구매 | 네이버 명시 제재 |

한다: canonical·robots·사이트맵 정합, 얇은 페이지 색인 제외, 구조화 데이터 형식 준수, 랜딩 간 교차 링크, 검색엔진 등록과 IndexNow.

- 네이버는 별도 트랙: Yeti의 JS 렌더링은 2-pass·지연(공식)이라 SSR인 라맵이 유리. 소유확인 검증기는 JS를 실행하지 않는다. IndexNow 공식 지원 → 데이터 파이프라인 뒤 푸시

## 근거

- Next.js v16.3 로컬 공식 문서(`node_modules/next/dist/docs/`) + nextjs.org 교차 확인
- 구글: spam-policies·faceted-navigation·helpful-content·updates 변경로그
- 네이버: searchadvisor.naver.com 가이드 37건 전문(faq-start-register·request-crawl·indexnow-*·seo-advanced-javascript·structured-data-* 등) + IndexNow 공지(2023-07)·FAQ 종료 공지(2026-07)
- 실측: 다이닝코드·식신·캐치테이블·Airbnb·Zillow·호갱노노·카카오플레이스 raw HTML, 구글·네이버 SERP 8개 쿼리
