# keeper 계정 정책 원문 정리

[records 설계 — 로그인·약관 동의·프로필](../design.md#로그인약관-동의프로필)과 닉네임 변경(후속)이 인용하는 keeper 정책 추출(2026-09-01, `docs/plans/2026-09-01-my-records.md`에서 옮김).

원본: `gh repo clone slowteady/keeper-app` / `git clone https://github.com/slowteady/keeper-backend.git`

## 로그인 전략 (keeper-backend `src/modules/auth/auth.service.ts`)

1. **소셜 인증 ≠ 가입.** `login()`: 소셜 토큰 검증 → 유저 조회 → 미가입이면 유저를 만들지 않고 `signupToken`(단기 서명 토큰) + `isNew`만 반환 → 앱이 약관 동의 화면으로
2. **가입 확정 = 약관 동의 시점.** `agree(signupToken, 약관 버전들)`: 토큰 검증 → 이 시점에 닉네임 랜덤 생성 → user create(약관 3종 버전 + agreedAt 기록, name·image는 빈 값 — 소셜 프로필 스코프 미요청) → 세션 발급. 기가입인데 `agreedAt` 없으면 재로그인 시 다시 동의 플로우(isNew=true)
3. 이메일 기반 중복 소셜 감지: 같은 이메일이 다른 소셜로 가입돼 있으면 "이미 {카카오}로 가입" 예외
4. 정지 유저 검사(suspension), refresh token 회전(세션 테이블 + argon2 해시, 위조 감지 시 전 세션 파기)

## 닉네임 생성 (`src/modules/auth/lib/nickname-generator.ts`, 사전 `nickname-data.ts`)

`generateUniqueNickname` — `형용사+명사` 랜덤(각 50개 사전, 공백 없음) → 중복이면 10회 재시도 → 4자리 숫자 접미사로 10회 → 최종 폴백 `base + Date.now()`. 할당 시점은 가입 확정.

## 닉네임 변경 정책 (후속용)

- 변경 UI는 가입 폼과 동일 컴포넌트 재사용(큰 타이틀+단일 인풋+하단 고정 버튼).
- 검증 4단: 입력 sanitize(`[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9]` 제거) → 1초 디바운스 → 로컬(자모만 "완성된 글자만 사용할 수 있어요"·비속어) → 서버 중복 exists.
- 쿨다운 30일: `nickname_updated_at` 기준 서버 강제(라맵은 BEFORE UPDATE 트리거로), UI 잠금 + "{날짜}부터 다시 변경할 수 있어요".
- 제출 전 확인 모달 "지금 변경하면 {+30일}까지 다시 바꿀 수 없어요".
- 에러 매핑: 중복(23505) "이미 사용 중인 닉네임이에요" / 쿨다운 "아직 닉네임을 변경할 수 없어요".
- 비속어 필터: 소문자화→숫자 제거→반복문자 축약 후 금칙어·초성 부분일치.

소스 위치:

- 검증 4단: keeper-app `src/features/auth/check-nickname/model/use-check-nickname.ts`
- 비속어: keeper-app `src/shared/lib/utils/korean-profanity.ts`
- 쿨다운: keeper-backend `src/modules/user/user.service.ts`
