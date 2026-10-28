---
name: pr-review
description: PR이나 현재 브랜치의 변경을 리뷰할 때 사용한다. "리뷰해줘", PR 번호, PR을 올리기 전 점검 요청이면 이 스킬을 따른다.
---

# 코드 리뷰 절차

리뷰는 코드를 고치지 않는다. 지적만 남긴다. 기준의 원천은 `CLAUDE.md`다.

## 1. 대상 정하기

- 인자에 `owner/repo/pull/N`이 있으면 그 PR을 리뷰한다: `gh pr view N --json title,body,files`, `gh pr diff N`
- 없으면 현재 브랜치와 main의 차이를 리뷰한다: `git diff main...HEAD`
- PR 본문(로컬이면 브랜치 이름)의 이슈 번호로 이슈를 읽고 완료 조건, 범위 밖, 근거 문서를 확인한다. `gh`가 로그인돼 있지 않으면 GitHub MCP `issue_read`를 쓴다.

## 2. 꼭 고칠 것 (🔴)

- 운영에 영향을 주는 버그, 잘못된 로직
- 이슈의 완료 조건이나 근거 문서(`docs/planning/`·`docs/plans/`)에 없는 기능·범위가 들어간 것
- 로직을 바꿨는데 그 로직의 테스트가 없는 것 — 순수 함수는 `*.test.ts`, 훅·leaf 컴포넌트는 `*.test.tsx` co-location
- 서버 응답(Supabase 행 등)을 내로잉 없이 `as`로 단언해 쓰는 것, `any`
- 토큰, 키, 비밀번호, 개인정보가 코드·로그·오류 메시지·URL 쿼리에 들어간 것
- 테스트가 외부 API(Supabase·카카오맵 등)를 실제로 호출하는 것. 테스트는 목(mock)을 쓴다
- FSD 경계 위반: import 방향(app → views → features → entities → shared)의 역방향, 같은 레이어 슬라이스 간 import, 슬라이스 `index.ts`를 우회한 내부 경로 import, 서버 전용 코드가 클라이언트 번들에 섞이는 것(`server-only`·`index.server.ts` 규칙)
- 약관 위반: 카카오·네이버 지오코딩 결과 저장, 네이버·카카오 플랫폼 데이터 크롤링, 인스타그램 직접 조회·스크래핑, 타인 사진 사용
- 코드 주석. 이 레포는 주석을 쓰지 않는다. 한 줄·블록 주석, JSDoc, eslint 비활성 지시문, 타입 오류 무시 지시문 모두 해당한다

## 3. 가벼운 지적 (🟡) — 한 리뷰에 최대 5개

- 임의값 유틸(`w-[13px]`, `bg-[#...]`)이나 `globals.css` `@theme`에 없는 색. 색·크기는 토큰 유틸로만 쓴다
- `cn()`을 `shared/lib/utils` 것이 아닌 곳에서 가져온 것, 다크모드(`.dark`) 추가
- UI 문구 규칙: 화면 문자열은 한국어, 코드의 도메인 용어는 영어(soup·form·lineage)
- 클릭 요소가 `<button>`/`<a>`가 아닌 것, 터치 영역 44px 미만

## 4. 지적하지 않는 것

- 린트, 포맷, 타입 오류처럼 도구가 이미 잡는 것
- 자동 생성 파일, lock 파일, `data/` 산출물
- shadcn에서 복사해 온 `src/shared/ui/` 컴포넌트와 기존 코드에 원래 있던 주석 (주석 금지는 새로 쓰는 코드에만 적용)
- 취향 차이(이름, 구조 제안 등)

## 5. 근거

- 모든 지적에는 `파일:줄` 근거를 단다. 이름만 보고 추측한 지적은 올리지 않는다.
- 확실하지 않으면 올리지 않는다.

## 6. 결과 내기

- 인자에 `--comment`가 있으면 PR에 남긴다.
  - 지적마다 `mcp__github_inline_comment__create_inline_comment`로 해당 줄에 인라인 댓글을 단다. 첫머리에 🔴 또는 🟡를 붙인다.
  - 지적이 없으면 `gh pr comment N --body "리뷰 결과 지적할 문제가 없어요."` 하나만 남긴다.
- `--comment`가 없으면 터미널에 표로 출력한다: 등급 / 파일:줄 / 문제 / 고칠 방향
