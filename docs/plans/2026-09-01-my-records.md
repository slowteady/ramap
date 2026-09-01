# 로그인·닉네임 할당 전략 + 내 기록 페이지 (2026-09-01)

keeper(keeper-app·keeper-backend)의 계정 라이프사이클을 딥다이브해 정책을 이식하되 Supabase(자체 서버 0)에 맞춰 번역한다 — PO 결정. 1차 범위는 **로그인 전략 + 닉네임 최초 할당 + /me 기본**. 닉네임 변경(쿨다운·검증 4단·확인 모달)은 후속 플랜 — keeper 정책 추출은 이 문서 하단 부록에 보존.

## keeper 로그인 전략 원문 (auth.service.ts 정독, 2026-09-01)

1. **소셜 인증 ≠ 가입.** `login()`: 소셜 토큰 검증 → 유저 조회 → 미가입이면 유저를 만들지 않고 `signupToken`(단기 서명 토큰) + `isNew`만 반환 → 앱이 약관 동의 화면으로
2. **가입 확정 = 약관 동의 시점.** `agree(signupToken, 약관 버전들)`: 토큰 검증 → **이 시점에 닉네임 랜덤 생성** → user create(약관 3종 버전 + agreedAt 기록, name·image는 빈 값 — 소셜 프로필 스코프 미요청) → 세션 발급. 기가입인데 `agreedAt` 없으면 재로그인 시 다시 동의 플로우(isNew=true)
3. 이메일 기반 **중복 소셜 감지**: 같은 이메일이 다른 소셜로 가입돼 있으면 "이미 {카카오}로 가입" 예외
4. 정지 유저 검사(suspension), refresh token 회전(세션 테이블 + argon2 해시, 위조 감지 시 전 세션 파기)

## Supabase 번역 — 로그인 전략

| keeper | 라맵 (Supabase) | 강제 지점 |
|---|---|---|
| 카카오 토큰 검증·교환 | `signInWithOAuth({provider:"kakao"})` — 이미 배포됨 | Supabase |
| access/refresh 회전·세션 테이블 | Supabase Auth 내장 (PKCE·자동 갱신) — 이식 불필요 | Supabase |
| signupToken 중간 상태 | **불가능** — OAuth 완료 = `auth.users` 생성. 대신 "미동의 상태"로 번역: profiles가 트리거로 즉시 생성되되 `agreed_at null` | — |
| 가입 확정 = 약관 동의 | 최초 로그인 감지(`profiles.agreed_at is null`) → **약관 동의 시트**(keeper 로그인 시트 아래 이어지는 풀스크린/시트) → 동의 시 `agreed_at`·`agreed_terms_version`·`agreed_privacy_version` update | 클라 게이트 + **RLS**: records·(향후)완식 인증 insert policy에 `exists(select 1 from profiles where user_id = auth.uid() and agreed_at is not null)` 조건 |
| 소셜 프로필 스코프 미요청 | 동일 — 카카오 동의항목에서 닉네임·프로필사진 요청 안 함(현재도 안 받음). displayName의 카카오 이름 폴백 제거, profiles.nickname 단일화 | 카카오 콘솔 |
| 이메일 중복 소셜 감지 | 카카오 단일이라 해당 없음. 애플 추가 시 Supabase identity linking 설정으로 — 미결 메모 | — |
| 정지 유저 | 미도입 — 공개 콘텐츠(완식 인증) 시점에 재검토 | — |

**약관 동의 플로우 (신규)**: 카카오 로그인 완료 → `agreed_at null`이면 동의 시트(서비스 이용약관·개인정보 처리방침 체크, 링크) → [동의하고 시작하기] → update → 완료. 미동의 상태로 이탈하면 다음 로그인 때 재노출, 기록 쓰기는 클라+RLS 양쪽에서 차단. **약관·방침 문서 자체가 없으므로 작성 필요(미결, 법적 필수)** — 문서 나오기 전까지 동의 시트는 스킵 가능한 플래그로 구현.

## Supabase 번역 — 닉네임 할당 전략

keeper 원문: `generateUniqueNickname` — `형용사+명사` 랜덤(각 50개 사전, 공백 없음) → 중복이면 10회 재시도 → 4자리 숫자 접미사로 10회 → 최종 폴백 `base + Date.now()`. 할당 시점은 가입 확정.

라맵 번역 — **전부 DB 안에서** (클라이언트는 관여 안 함, 레이스 안전):

```
public.profiles (
  user_id uuid pk references auth.users on delete cascade,
  nickname text not null unique check (char_length(nickname) between 2 and 12),
  nickname_updated_at timestamptz,          -- 변경 기능(후속)용, 할당 시 null
  agreed_at timestamptz,
  agreed_terms_version text,
  agreed_privacy_version text
)
```

- **할당 시점**: `auth.users` AFTER INSERT 트리거 `handle_new_user()` (Supabase 관례) — keeper는 동의 시점 할당이지만, Supabase는 중간 상태가 없으므로 생성 시점 할당으로 이동. 동의 전엔 닉네임이 어디에도 노출되지 않아 체감 동일
- **생성 함수** `generate_nickname()` (SQL, security definer): 형용사·명사 `text[]` 상수에서 랜덤 조합 → `exists` 검사로 10회 → 4자리 접미사 10회 → 폴백 `base || floor(extract(epoch from now()))`. keeper 로직 1:1 이식
- **단어 사전은 라맵 테마로 교체**: 형용사는 keeper 톤 유지(따뜻한·느긋한·씩씩한…), 명사는 라멘 어휘(돈코츠·니보시·차슈·멘마·아지타마·카에다마·츠케멘·시오…) ~40개 — "따뜻한차슈" 같은 조합. 도메인 정체성 + 사전 출처 명확
- **RLS**: select는 authenticated 전체(공개 표시명 대비) / update 본인 행만(동의 컬럼용 — nickname 변경은 후속 플랜에서 쿨다운 트리거와 함께 개방, 그 전까지 update policy에서 nickname 불변 강제: `with check (nickname = (select nickname from profiles where user_id = auth.uid()))`) / insert는 트리거 전용(클라 불허)
- **백필**: schema.sql 실행 시 기존 `auth.users` 전원에 대해 profiles insert 1회 (동일 생성 함수 사용)
- **schema.sql에 추가 — Supabase SQL Editor 1회 실행 필요**

클라이언트: `features/auth`에 `use-profile` 훅 — 로그인 시 profiles 1회 fetch, 표시 우선순위 `nickname → "라멘 러버"`(카카오 이름 폴백 제거).

## /me 기본 (1차 범위)

- 진입: 헤더 프로필 아이콘 — 로그인 시 `/me`, 비로그인 시 keeper 로그인 시트(기존 유지). 마이 시트의 로그인 후 상태는 `/me`로 흡수·제거
- SSG 껍데기 + 클라이언트 섬, `getShops()` 서버 전달 → records 클라 조인

```
[←] 마이
{닉네임}님
완식 N · 저장 N
[완식] [저장] 탭 (?tab=want, 기본 완식)
  행: 상호 · 지역 · 장르 칩 · 기록 날짜(dayjs), 최신순(lastAt ?? firstAt, null 뒤로) → /shop/{id}
빈 상태: "아직 완식한 라멘집이 없어요 / 지도에서 완식을 찍으면 여기에 모여요 / [지도 보기]"
하단 보조: 기록 JSON 내려받기 · 로그아웃
```

빈 상태 문구 규칙은 keeper 문법("~없어요 / ~하면 여기에 모여요 / CTA") 채택. 닉네임 옆 [수정]·계정관리는 후속 플랜에서.

## 구현 컨텍스트 (이어받는 에이전트용)

**keeper 원본** (스크래치패드 `keeper-app`·`keeper-backend`, 소실 시 `gh repo clone slowteady/keeper-app` / `git clone https://github.com/slowteady/keeper-backend.git`):

- 로그인 플로우: keeper-backend `src/modules/auth/auth.service.ts` (login·agree 2단 구조)
- 닉네임 생성: `src/modules/auth/lib/nickname-generator.ts`(로직)·`nickname-data.ts`(형용사 사전 톤 참고)
- (후속용) 검증 4단: keeper-app `src/features/auth/check-nickname/model/use-check-nickname.ts`, 비속어 `src/shared/lib/utils/korean-profanity.ts`, 쿨다운: keeper-backend `src/modules/user/user.service.ts`

**라맵 기존 코드:**

- `src/features/auth/model/use-auth.ts` — useAuth·displayName(카카오 이름 폴백 제거 대상). `use-profile` 훅 추가 위치
- `src/views/home/ui/auth-entry.tsx` — 프로필 아이콘. 로그인 분기를 `/me` Link로
- `src/features/records/model/use-records.ts` — records 조인. `src/features/records/ui/login-prompt-sheet.tsx` — 비로그인 /me 진입 재사용 (views/me에서 조합, features 간 직접 import 금지)
- `supabase/schema.sql` — records/reports 패턴 참고해 profiles·트리거·백필 추가. RLS의 records agreed_at 조건은 약관 문서 준비 후 활성화(플래그)
- 확인 모달류: shadcn Dialog 미테마 — Drawer 시트로 대체 (ramap-ui 규율)

**작업 절차:** 브랜치 `feat/my-page` → `npx tsc --noEmit`+`npm test`+`npm run build` → Playwright 실측(실로그인) → 사용자 로컬 검수 → 머지·푸시는 사용자 OK 후. 순수 함수(정렬·표시명)는 Vitest. SQL은 schema.sql에 멱등(if not exists·or replace)으로. 문서: 17.페이지명세 §마이 추가

## 미결

- ~~약관·개인정보 처리방침~~ → 완료(2026-09-01, feat/terms-consent): /terms·/privacy 페이지, 전역 동의 시트, records RLS 게이트 활성(Plan 6 영문명 중복 정책 제거로 무력화 버그 해소). **방침의 보호책임자 연락처는 자리표시 상태 — 출시 전 실연락처 확정 필요.** 법률 검토 전 초안임
- 닉네임 변경 화면(쿨다운 30일 트리거·검증 4단·확인 모달·비속어 필터) — 후속 플랜, keeper 정책 부록 참조
- 회원탈퇴 — Supabase는 클라 삭제 불가, Edge Function 검토
- 프로필 이미지 — 미도입 유지 (닉네임 텍스트만)
- 애플 로그인 추가 시 identity linking 설정
- 내 지도 모아보기·공유 이미지 — 14 문서 플랜과 함께
- **내 제보·기여 메뉴 (2026-09-01 보류, 설계 확정)**: 하이브리드 — 익명 제보 유지 + 로그인 제보에 user_id 자동 귀속 → 마이 "내 제보"(상태 배지: 접수/검수 중/반영). reports에 user_id(nullable)·status 컬럼 + RLS 본인 select. 완식 인증 도입 시 "내 기여"(제보 반영 N + 인증 M)로 확장. 제보 폼에 "로그인하고 제보하면 반영 소식을 마이에서" 한 줄 = 로그인 유도 겸용

## 부록 — keeper 닉네임 변경 정책 (후속 플랜용 추출 보존)

변경 UI는 가입 폼과 동일 컴포넌트 재사용(큰 타이틀+단일 인풋+하단 고정 버튼). 검증 4단: 입력 sanitize(`[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9]` 제거) → 1초 디바운스 → 로컬(자모만 "완성된 글자만 사용할 수 있어요"·비속어) → 서버 중복 exists. 쿨다운 30일: `nickname_updated_at` 기준 서버 강제(라맵은 BEFORE UPDATE 트리거로), UI 잠금 + "{날짜}부터 다시 변경할 수 있어요". 제출 전 확인 모달 "지금 변경하면 {+30일}까지 다시 바꿀 수 없어요". 에러 매핑: 중복(23505) "이미 사용 중인 닉네임이에요" / 쿨다운 "아직 닉네임을 변경할 수 없어요". 비속어 필터: 소문자화→숫자 제거→반복문자 축약 후 금칙어·초성 부분일치 (korean-profanity.ts 이식).
