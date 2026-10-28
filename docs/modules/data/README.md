# data

매장 데이터 — 택소노미, 시트 스키마, 시딩·보강·동기화 파이프라인, 무결성 검수, 갱신 라운드, 폐업 검증, 인스타·휴무 수집.

| 문서 | 언제 읽나 |
|---|---|
| [requirements.md](requirements.md) | 데이터 원칙·수집 필드·게재·폐업 요구를 확인할 때 |
| [design.md](design.md) | 파이프라인 명령·파일·시트 열·택소노미 값·동네라벨·검증상태·갱신 라운드 매칭 규칙·인스타 검수 절차를 볼 때 |
| [decisions/0001-taxonomy-axes-localization.md](decisions/0001-taxonomy-axes-localization.md) | 분류 축이나 한국화 원칙(5곳 실효성·커뮤니티 용어·겸업)을 바꿀 때 |
| [decisions/0002-taxonomy-values.md](decisions/0002-taxonomy-values.md) | 형태·스프 값(대표값·니보시·토마토·아부라소바 등), 이에케 표기, 본토직영·편의 태그를 추가·삭제·승격하거나 다시 논의할 때 |
| [decisions/0011-lineage-by-signature-ramen.md](decisions/0011-lineage-by-signature-ramen.md) | 이에케·지로계를 붙일지 판단할 때 |
| [decisions/0012-sheet-schema-is-shop-schema.md](decisions/0012-sheet-schema-is-shop-schema.md) | 시트 열을 추가·변경하거나 DB 도입을 검토할 때 |
| [decisions/0015-user-contribution-review-gate.md](decisions/0015-user-contribution-review-gate.md) | 유저 편집·제보 반영 방식을 바꿀 때 |
| [decisions/0017-seed-two-layer-extraction.md](decisions/0017-seed-two-layer-extraction.md) | 후보 소스·발굴 방식·카카오 장소 ID 사용을 바꿀 때 |
| [decisions/0018-digging-source-copyright.md](decisions/0018-digging-source-copyright.md) | 미디어·갤러리 글을 조사에 쓸 때 |
| [decisions/0019-publish-gate-web-presence.md](decisions/0019-publish-gate-web-presence.md) | 후보가 게재·보류·제외된 이유를 볼 때 |
| [decisions/0020-inherit-same-shop-chain.md](decisions/0020-inherit-same-shop-chain.md) | 다른 가게 정보가 번졌거나 체인 승계를 바꿀 때 |
| [decisions/0021-latest-research-wins.md](decisions/0021-latest-research-wins.md) | 같은 매장의 조사가 충돌할 때 |
| [decisions/0024-closure-direct-evidence-only.md](decisions/0024-closure-direct-evidence-only.md) | 폐업을 확정·공개할 때 |
| [decisions/0025-secondary-review-collect-evidence.md](decisions/0025-secondary-review-collect-evidence.md) | 갱신 라운드 근거 수집 수단을 바꿀 때 |
| [decisions/0026-biweekly-routine-review-only.md](decisions/0026-biweekly-routine-review-only.md) | 자동 루틴의 범위를 바꿀 때 |
| [decisions/0027-instagram-link-priority.md](decisions/0027-instagram-link-priority.md) | 인스타 링크를 넣거나 고칠 때 |
| [decisions/0028-closed-days-two-reviews.md](decisions/0028-closed-days-two-reviews.md) | 휴무 정보를 수집·채택할 때 |
| [research/2026-08-26-ramendb-structure-korean-terms.md](research/2026-08-26-ramendb-structure-korean-terms.md) | ramendb 원본 구조나 니보시·어패계 용어 실측 수치가 필요할 때 |
| [research/2026-09-02-seed-source-deep-research.md](research/2026-09-02-seed-source-deep-research.md) | 공공데이터 소스 실측·지도사 약관·판례 근거가 필요할 때 |
| [research/2026-10-19-data-refresh-round-results.md](research/2026-10-19-data-refresh-round-results.md) | 지난 갱신 라운드 결과·남은 TODO를 볼 때 |
| [research/2026-10-27-instagram-link-first-review.md](research/2026-10-27-instagram-link-first-review.md) | 인스타 1차 검수 결과·검색 수단 실측을 볼 때 |

실무 절차의 실물: [data-integrity 스킬](../../../.claude/skills/data-integrity/SKILL.md) · [closure-verification 스킬](../../../.claude/skills/closure-verification/SKILL.md)
