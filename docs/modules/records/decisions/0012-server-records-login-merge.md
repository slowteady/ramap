---
status: 유효
date: 2026-08-27
---

# 기록은 Supabase에 저장하고, 로그인 시 로컬 기록을 병합 이관한다

## 맥락

카카오 로그인과 함께 기록을 서버에 두기로 했다. 백엔드 서버 없이(BaaS) 구현하되 기존 화면 코드는 건드리지 않아야 했다.

## 결정

- 브라우저가 Supabase Auth·DB를 직접 호출한다. 보안은 RLS(`auth.uid() = user_id`).
- 기록 의미론(완식 +1, 저장 토글, 병합 규칙)은 순수 함수로 두고 로컬·서버 스토어가 공유한다.
- 서버 스토어는 **메모리 write-through** — 동기 `RecordStore` 인터페이스를 유지하고 쓰기는 fire-and-forget upsert.
- 로그인 시: 서버 기록 조회 → 로컬과 병합 → 병합분 일괄 upsert → 서버 스토어로 교체 → 로컬 스토리지 비움. 로그아웃 시 로컬 스토어(빈 상태)로 복귀, 서버 기록은 보존.
- 조회 실패·업로드 실패 시 로컬을 유지한다(서버 덮어쓰기 방지).
- `@supabase/supabase-js`를 도입한다. TanStack Query는 도입하지 않는다 → [라이브러리 도입 트리거](../../../decisions/0004-library-adoption-triggers.md)
- 카카오 OAuth 앱은 기존 ramap 앱을 재활용한다(지도 키와 별개).
- env가 없으면 로그인 UI가 숨고 로컬 동작만 한다.

## 근거

- Auth 세션·PKCE를 수동 REST로 짜는 건 무의미 → supabase-js.
- TanStack Query는 트리거("기록 server state화")가 형식상 걸리지만, 1회 로드 + write-through라 캐시·리페치 수요가 없다.
- 로그아웃 후 로컬을 비우는 이유: 이관 후 로컬이 남아 있으면 로그아웃 시 옛 기록이 부활한다.

## 버린 안

- 로그아웃 시 로컬 기록 유지 — 로그아웃 부활 문제.
