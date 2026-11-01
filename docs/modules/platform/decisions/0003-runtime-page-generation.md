---
status: 유효
date: 2026-11-01
---

# 매장·지역 페이지는 첫 요청 때 만든다(ISR)

## 맥락

배포 1회 결과물이 약 199MB였다. 매장 페이지 129MB(1,332곳 × HTML·RSC·segments 약 100KB), 지역 페이지 58MB, `/me` 5.8MB(전체 매장 데이터를 통째로 내려줌)다. Vercel Hobby의 배포 저장소 한도는 10GB이고, 보관 중인 배포마다 결과물이 쌓인다. 2026-10에 한도 경고 메일을 받았다.

## 결정

- 매장(`/shop/[slug]`)·지역(`/area/[area]`, `/area/[area]/[genre]`) 페이지는 `generateStaticParams`가 빈 배열을 돌려준다. 빌드 때는 만들지 않고, 처음 요청될 때 만들어 다음 배포까지 캐시한다(ISR). 데이터는 배포 때만 바뀌므로 `revalidate`는 두지 않는다
- 가이드·스타일 랜딩·홈은 수가 적어 지금처럼 빌드 때 만든다
- 없는 매장·숨김(검증 안 된 폐업)·없는 지역은 페이지 코드의 `notFound()`가 404를 낸다(이전에도 같은 검사가 있었다)
- `/me`에는 화면에 쓰는 칸 6개(`id`·`name`·`areaLabel`·`soups`·`forms`·`lineages`)만 넘긴다(`toMeShops`)
- 런타임에 `fs`로 읽는 `data/*.json`과 OG 폰트는 Next.js 파일 추적이 자동으로 함수에 넣는다(빌드의 `.nft.json`으로 확인). 다만 폰트 폴더 전체(18개, 37MB)가 딸려 들어가서, 쓰는 `Pretendard-ExtraBold.otf` 외에는 `outputFileTracingExcludes`로 뺀다

결과: 배포 결과물 199MB → 7.3MB, `/me` HTML 1.6MB → 0.24MB.

## 근거

- Vercel: "Deployment Storage: Build outputs and static assets" — 배포 저장소는 빌드 결과물만 센다. 첫 요청 때 만든 페이지는 ISR 캐시(별도 집계, Hobby 월 읽기 100만·쓰기 20만)에 들어간다. https://vercel.com/docs/deployment-storage
- Vercel 한도 문서: "We recommend using Incremental Static Regeneration (ISR) … pre-render a subset of the total number of pages at build time … generate pages on-demand." https://vercel.com/docs/limits
- Next.js 16 `generateStaticParams`: "To statically render all paths the first time they're visited, return an empty array" (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-static-params.md`)
- 로컬 `next start` 실측: 매장 페이지 첫 요청 97ms(생성), 두 번째 2ms(캐시). 없는 경로 404

## 영향

- 배포 직후 각 페이지의 첫 방문(사람이든 검색 로봇이든)만 서버에서 한 번 만든다(약 0.1초). 그 뒤는 정적 페이지와 같다
- 사이트맵·메타데이터·구조화 데이터는 바뀌지 않는다
- ISR 쓰기는 배포마다 방문된 페이지 수만큼(최대 약 1,900) 생겨 Hobby 한도(월 20만)보다 훨씬 작다

## 버린 안

- 일부만 빌드 때 만들기(인기 페이지) — 고를 기준이 없고, 크기 절감 대부분은 빈 배열로 이미 얻는다
- 배포 보관 기간만 줄이기 — 롤백 여유가 줄고, 배포 1회 크기 문제는 그대로다
