---
status: 대체됨
date: 2026-08-27
superseded_by: 0016-검수는-앱-내-admin.md
---

# 제보·사진 검수는 Supabase 대시보드에서 한다

## 맥락

서버 코드 없이 브라우저가 anon key로 Supabase를 호출한다. 검수 화면을 따로 만들 여력이 없었다.

## 결정

- `reports`에는 select 정책을 두지 않는다(anon 조회 불가). 검수는 Supabase 대시보드(service role)에서 한다.
- 완식 사진도 대시보드에서 status를 바꿔 승인·반려한다(하루 1회 일괄).
- 제보가 주간 수십 건을 넘어 시트 검수가 버거워지면 자체 어드민 웹으로 옮긴다.

## 근거

초기 예상량(일 0~5건)에서는 대시보드로 충분. 원문: `docs/plans/2026-08-27-plan6-auth-records.md`, `docs/planning/16.제보운영플로우.md` 확장 트리거.
