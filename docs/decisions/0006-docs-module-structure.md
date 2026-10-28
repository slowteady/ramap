---
status: 유효
date: 2026-10-28
---

# 문서 구조를 모듈 단위로 이관

## 맥락

라맵 문서는 `docs/planning/` 01~19(기획 단일 원천), `docs/plans/`(구현 계획·조사), `docs/research/`로 나뉘어 있었다. 한 파일에 현재 사실·결정 이력·버린 안이 섞여, 에이전트가 무엇이 지금 유효한지 가려 읽어야 했다. 보일러플레이트가 수명 기준 문서 규칙(`.claude/rules/docs.md`)을 공통으로 정했다.

## 결정

- 문서를 `docs/modules/<모듈>/`(requirements·design·decisions·research)로 한 번에 이관한다. 모듈: product, ui, map, shop-pages, records, report, data, platform.
- 모듈을 넘는 결정은 `docs/decisions/`, 공통 조사는 `docs/research/`, 백로그는 `docs/backlog.md`.
- 구현 계획 문서는 지금도 유효한 설계 사실을 design.md로, 이유를 decisions로 옮기고 지운다. 이후 이슈 단위 계획은 이슈 아티팩트에 둔다.
- 옛 문서는 지우고 git 기록으로 남긴다(`archive/` 없음).

## 근거

- PO 결정(2026-10-28): 신규만 새 구조로 하는 점진 이관 대신 "지금 전부 이관".
