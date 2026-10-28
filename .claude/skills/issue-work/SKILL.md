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
3. 해당 모듈의 `docs/modules/<모듈>/README.md` 색인을 읽고, `requirements.md`와 `design.md`는 항상 읽는다. 이슈 본문의 근거 문서와, 색인의 "언제 읽나"를 보고 이번 작업에 필요한 문서만 골라 읽는다. 문서를 전부 읽지 않는다.
4. "충돌 주의"에 적힌 이슈가 아직 열려 있으면 시작하지 말고 사용자에게 알린다.
5. 현재 브랜치 이름이 `.claude/rules/project.md`의 브랜치 규칙과 다르면 바꾼다. 이슈 제목의 TYPE으로 종류를 고르고, 설명은 이슈 제목을 짧은 영어로 옮긴다.
   원격에 아직 없는 브랜치만 `git branch -m <새 이름>`으로 바꾼다. 이미 푸시된 브랜치는 바꾸지 않고 사용자에게 알린다.
6. "구현 계획" 아티팩트가 없으면 plan 타입으로 만든다. 완료 조건을 어떤 순서로 채울지만 짧게 적는다.

## 작업 중
- 완료 조건과 근거 문서에 없는 일은 하지 않는다. 필요해 보이면 멈추고 묻는다.
- 이슈 본문은 고치지 않는다. 본문은 사람이 관리한다.
- 로직은 `superpowers:test-driven-development` 스킬로 테스트를 먼저 쓴다: 실패하는 테스트 → 통과하는 최소 구현 → 정리.
- 버그나 테스트 실패를 만나면 `superpowers:systematic-debugging` 스킬로 원인부터 찾는다.

## 마무리
1. `superpowers:verification-before-completion` 스킬로 완료 조건을 하나씩 실제로 확인한다(테스트 실행, 화면 확인 등). 확인하지 못한 항목은 "미확인"으로 남긴다.
2. 동작이 바뀌었으면 해당 모듈의 `design.md`를 같은 PR에서 고친다. 바뀐 게 없으면 PR 본문에 "명세 변경 없음"과 이유를 적는다.
3. `pr-review` 스킬로 현재 브랜치를 리뷰하고(`--comment` 없이), 🔴 지적은 고친다. PR에 붙는 자동 리뷰와 같은 기준이다.
4. "진행 기록" 아티팩트(generic)를 하나만 유지한다. 없으면 만들고, 있으면 고친다.
   내용: 한 일 / 내린 결정 / 확인한 완료 조건 / 미확인 / 남은 일
5. PR 본문에 `Closes #이슈번호`를 넣는다.
6. 이슈는 닫지 않는다. 사람이 PR을 머지하면 자동으로 닫힌다.

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
