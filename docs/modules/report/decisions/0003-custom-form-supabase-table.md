---
status: 유효
date: 2026-10-28
---

# 제보는 자체 폼으로 받아 Supabase 테이블에 쌓는다

## 맥락

제보 접수 수단으로 외부 폼(구글 폼 등) 임베드와 자체 폼을 비교했다.

## 결정

- 앱 안의 자체 폼으로 받는다.
- 제출처는 Supabase `reports` 테이블(익명 insert만 허용).

## 근거

자체 폼이 외부 폼 임베드보다 UX가 낫다. 백엔드는 Supabase 스택 결정을 따른다 → [기술 스택](../../../decisions/0001-tech-stack-lite-fsd.md)

## 버린 안

- 외부 폼 임베드.
- Supabase 미설정 시 REST fetch 이음새(`ReportSink`) — supabase-js 도입 후 클라이언트 insert로 교체.
