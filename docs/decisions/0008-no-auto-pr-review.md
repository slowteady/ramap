---
status: 유효
date: 2026-10-28
---

# 자동 PR 리뷰를 쓰지 않는다

## 맥락

보일러플레이트 `ai-issue-workflow`는 PR이 열리면 `pr-review` 기준으로 리뷰하는 GitHub Actions 워크플로(`.github/workflows/claude-review.yml`)를 함께 준다. 라맵에서는 Claude 앱·토큰 시크릿을 설정하지 않은 상태라 PR마다 이 검사가 실패로 표시됐다(#11).

## 결정

- 라맵에는 `.github/workflows/claude-review.yml`을 두지 않는다. 보일러플레이트를 다시 복사할 때도 이 파일은 빼고 복사한다.
- 리뷰는 에이전트가 PR을 올리기 전에 로컬에서 `pr-review` 스킬로 한다(`issue-work` 마무리 단계).

## 근거

- PO 결정(2026-10-28): "클로드 리뷰를 이 프로젝트에서는 빼자".
