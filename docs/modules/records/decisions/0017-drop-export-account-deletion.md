---
status: 유효
date: 2026-09-01
---

# 기록 내보내기를 없애고 회원탈퇴를 넣는다

## 맥락

기록 JSON 내보내기·복원(무로그인 localStorage 시절 MVP 기능)은 기기 저장 기록의 소실 방지가 목적이었다. 기록이 로그인 + 서버 저장으로 바뀌어 목적이 사라졌다. 반면 계정을 받는 이상 회원탈퇴는 법적 필수다.

## 결정

- 마이 메뉴에서 JSON 내보내기를 뺀다.
- 회원탈퇴를 넣는다: 설정 → 계정 → 회원탈퇴 → 확인 시트.
- 탈퇴는 Edge Function 없이 `delete_own_account()` security definer RPC로 본인 `auth.users` 행을 지운다(profiles·records·record_photos는 cascade).
- 스토리지 객체 소유자는 계정 삭제가 막히므로, 클라이언트가 본인 `record-photos` 파일을 먼저 지운 뒤 RPC를 호출하고 로컬 세션을 끊는다.

## 근거

- Supabase 공식 discussion #1066 패턴(security definer RPC로 본인 삭제).
- 스토리지 객체 소유자 삭제 제약은 Supabase 공식 문서.

## 버린 안

- 기록 JSON 내보내기·복원 + 첫 완식 직후 "백업하기" 토스트(2026-08-26) — 기기 저장 기록의 소실 방지용이었고 서버 저장으로 목적이 사라졌다.
- Edge Function으로 계정 삭제 — 서버 코드 없이 RPC로 충분.
