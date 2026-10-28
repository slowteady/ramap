# superpowers 스킬 사용 규칙

이 레포는 설계 문서, 작업 단위, 워크트리를 직접 관리한다. superpowers 스킬은 아래처럼만 쓴다.

| 단계 | 쓰는 것 | 결과물 |
|---|---|---|
| 설계 | `superpowers:brainstorming` (사용자가 설계를 요청할 때만) | 스펙 변경은 `docs/planning/` 해당 문서, 설계·조사는 `docs/plans/YYYY-MM-DD-<주제>.md` |
| 작업 나누기 | `issue-create` 스킬 | GitHub 이슈 |
| 구현 계획 | `issue-work` 스킬 | 이슈의 "구현 계획" 아티팩트 |
| 구현 | `superpowers:test-driven-development`, `superpowers:systematic-debugging` | 코드와 테스트 |
| 마무리 | `superpowers:verification-before-completion`, `pr-review` 스킬 | PR |

- `docs/superpowers/` 아래에 파일을 만들지 않는다. brainstorming과 writing-plans의 기본 저장 위치 대신 위 표의 위치를 쓴다.
- writing-plans는 계획을 쓰는 방식만 참고하고, 이슈 단위 결과는 이슈 아티팩트에 남긴다. 여러 이슈에 걸친 설계는 `docs/plans/`에 두고 이슈 본문 "근거 문서"로 연결한다.
- 쓰지 않는 스킬: executing-plans, subagent-driven-development(레포에 계획 파일이 없음), using-git-worktrees(워크트리는 Orca가 만듦), finishing-a-development-branch(마무리는 PR과 사람의 머지).
