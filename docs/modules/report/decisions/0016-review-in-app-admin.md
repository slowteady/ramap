---
status: 유효
date: 2026-09-03
---

# 검수는 앱 안의 /admin에서, 권한은 RLS로

## 맥락

[대시보드 검수](0015-review-in-supabase-dashboard.md)는 파트너가 쓰기 어렵고, 사진을 보며 판정하기 불편했다. 검수·반영 주 담당은 파트너다 → [입구 개방·출구 검수](0001-open-intake-full-review.md)

## 결정

- 앱 안 `/admin`에서 사진 검수와 제보 처리를 한다.
- 별도 서버 없이 RLS로 권한을 강제한다: `profiles.role = 'admin'`, `is_admin()` 함수로 reports·record_photos 조회·수정과 두 스토리지 버킷 열람을 연다.
- 앱 안에 링크를 두지 않는다(주소 직접 입력). 비관리자에겐 "운영자만 볼 수 있어요".

## 근거

`supabase/schema.sql` "운영 어드민 (2026-09-03)" 블록. 서버리스 구조 유지.

## 버린 안

- Supabase 대시보드 검수.
