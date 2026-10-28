---
status: 유효
date: 2026-08-26
---

# 기술 스택과 축소형 FSD

## 맥락

지도 홈은 상태가 많은 앱 화면이고, 매장·지역·계보 페이지는 검색 유입을 받는 정적 페이지다. 1인 개발로 두 성격을 함께 다뤄야 한다.

## 결정

- Next.js(App Router) + TypeScript + Tailwind CSS + shadcn/ui, Vercel 호스팅. 상태는 URL 쿼리 + React 기본으로 시작한다.
- 코드 구조는 FSD를 줄인 4레이어: `app`(라우팅 전용) → `views`(코드의 기본 거주지) → `features`(2개 페이지 이상 재사용 시에만) → `entities`(도메인: shop, record) → `shared`. import는 이 방향으로만, 같은 레이어 슬라이스끼리는 금지. widgets 레이어는 필요가 증명되기 전까지 만들지 않는다.
- 로직 3분법: 데이터 읽기는 `entities/*/api/`의 async 함수(`server-only`), 순수 계산은 `model/`·`lib/`의 순수 함수, 상태·이펙트·브라우저 API는 클라이언트 섬의 view-model 훅(`use-*`).
- 기본은 Server Component, `'use client'`는 인터랙션이 필요한 잎 컴포넌트에만.

## 근거

- SSG/ISR/SSR을 섞을 수 있어 검색 유입 페이지와 앱형 지도 홈을 한 프레임워크로 만든다.
- 택소노미 값을 타입으로 강제하고, 디자인 토큰을 Tailwind 설정으로 강제한다.
- FSD 원형은 1인 규모에 레이어가 과하다. 코드는 페이지(views)에서 시작해 재사용이 증명될 때만 내린다.

## 버린 안

- Astro: 정적 페이지에는 유리하지만 지도 홈의 앱성 상태에서 Next가 낫다.
