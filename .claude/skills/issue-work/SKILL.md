---
name: issue-work
description: GitHub 이슈 번호나 이슈 URL을 받아 작업을 시작하거나 마무리할 때 사용한다.
---

# 이슈 작업 절차

에이전트의 계획과 진행 기록은 이슈 **아티팩트**에 남긴다. 댓글은 사람이 지시를 남기는 자리라서 에이전트는 댓글을 쓰지 않는다.

## 시작

1. GitHub MCP `issue_read`로 이슈 본문(method: get)과 댓글(method: get_comments)을 읽는다.
   댓글에는 사람이 덧붙인 지시가 있을 수 있다. 처음 작업하는 이슈라면 댓글이 없는 게 정상이다.
2. 아티팩트 목록을 읽는다. "진행 기록"(generic)이나 "구현 계획"(plan)이 있으면 거기서 이어서 한다.
3. 본문의 근거 문서를 읽는다.
4. "충돌 주의"에 적힌 이슈가 아직 열려 있으면 시작하지 말고 사용자에게 알린다.
5. "구현 계획" 아티팩트가 없으면 plan 타입으로 만든다. 완료 조건을 어떤 순서로 채울지만 짧게 적는다.

## 작업 중

- 완료 조건과 근거 문서에 없는 일은 하지 않는다. 필요해 보이면 멈추고 묻는다.
- 이슈 본문은 고치지 않는다. 본문은 사람이 관리한다.
- 라맵 규칙은 `CLAUDE.md`를 따른다: 신규 기능은 TDD, 커밋은 한국어 컨벤셔널(`feat:`·`fix:`·`chore:`·`docs:`·`refactor:`), 주석 금지 원칙, 이슈 "작업 유형"에 적힌 스킬(ramap-ui·data-integrity·closure-verification)

## 마무리

1. 완료 조건을 하나씩 실제로 확인한다(테스트 실행, 화면 확인 등). 확인하지 못한 항목은 "미확인"으로 남긴다.
   - 라맵 공통: `npm test`, `npm run build`. 핵심 여정을 건드렸으면 `npm run test:e2e`
   - 매장 데이터: `npm run enrich-candidates -- data/out/candidates.tsv data/enrichment/*.json` → `npm run sync-sheet -- data/out/seed.tsv` → `npm run audit-integrity`, 리포트 첫 줄과 소실·계보 변경 표를 PR 본문에 붙인다
   - UI 변경: 로컬 서버는 3001 포트(카카오맵 도메인 허용, 3000은 다른 프로젝트가 씀). 모바일 폭 430px 스크린샷을 PR 본문에 넣는다 — 사람이 PR에서 화면을 검수하고 머지한다
2. "진행 기록" 아티팩트(generic)를 하나만 유지한다. 없으면 만들고, 있으면 고친다.
   내용: 한 일 / 내린 결정 / 확인한 완료 조건 / 미확인 / 남은 일
3. PR 본문에 `Closes #이슈번호`를 넣는다.
4. 이슈는 닫지 않는다. 사람이 PR을 머지하면 자동으로 닫힌다.
5. main에 직접 머지·푸시하지 않는다. main 머지가 곧 Vercel 프로덕션 배포라서 사람이 PR에서 결정한다. 머지 후 IndexNow(`npm run indexnow`)는 사람이 요청할 때 실행한다

## 아티팩트 사용법

`gh api`로 다룬다. `{owner}/{repo}`와 `{N}`(이슈 번호)은 실제 값으로 바꾼다.

```bash
# 목록
gh api repos/{owner}/{repo}/issues/{N}/artifacts

# 하나 읽기 (응답은 "artifact" 키 안에 들어 있다)
gh api repos/{owner}/{repo}/issues/{N}/artifacts/{번호}

# 만들기: 본문은 임시 파일에 쓰고 -F body=@파일 로 넣는다
gh api -X POST repos/{owner}/{repo}/issues/{N}/artifacts \
  -f type=generic -f name="진행 기록" -F body=@/tmp/progress.md

# 고치기
gh api -X PATCH repos/{owner}/{repo}/issues/{N}/artifacts/{번호} -F body=@/tmp/progress.md
```

- type은 `generic`(진행 기록, 조사 노트), `plan`(구현 계획), `link`(본문에 URL 하나) 중 하나다.
- name에는 글자, 숫자, 공백, `.`, `-`, `_`만 쓴다. 괄호 같은 기호를 넣으면 422 오류가 난다.
- 임시 파일은 워크트리 밖(`/tmp`)에 만든다.
- 아티팩트는 미리보기 기능이다. API가 오류를 내서 기록할 수 없을 때만 `add_issue_comment`로 같은 내용을 댓글로 남기고, 첫 줄에 "아티팩트 API 오류로 댓글에 기록"이라고 적는다.
