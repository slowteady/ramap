# 인스타 링크 전수 검수 — 2차 라운드(2026-11-01 이후) 계획

백로그 D-09. 1차(2026-10-27)는 1,289곳 중 598곳 + 히노아지 33곳을 반영했고, Tavily 무료 크레딧(월 1,000회, 매월 1일 리셋)이 소진돼 멈췄다. 이 문서만 읽고 2차를 이어서 할 수 있어야 한다.

## 결정 사항 (PO 2026-10-27)

- 우선순위: **그 지점 자체 계정 → 없으면 같은 체인의 브랜드 공식 계정 → 근거 없으면 비움.** 화면에 지점·브랜드 구분 표기는 하지 않는다
- 확실하지 않은 것은 반영하지 않고 이 라운드에서 다시 본다
- 근거는 검색엔진의 인스타 **프로필 결과**만(URL `instagram.com/<계정>` 한 단계, 제목·소개글이 그 매장을 지칭). 게시물·위치 태그·블로그 속 @언급은 근거 아님. 인스타그램 직접 조회·스크래핑 금지(Meta 약관)
- 규칙 전문: `.claude/skills/data-integrity/SKILL.md` "인스타" 절

## 남은 대상 — `data/review/instagram-2026-11/pending.tsv`

| 구분 | 수 | 처리 순서·방법 | 예상 검색 수 |
|---|---|---|---|
| chain | 299 | 1순위. 브랜드당 검색 1회(`<브랜드> 라멘 인스타그램`, max_results 15)로 공식·지점 계정을 한 번에 — 큐슈울트라아멘·와다라멘·혼다라멘·신센라멘 등 | 약 40 |
| existing | 129 | 2순위. 이미 링크가 있는 단독 매장 — 맞는지 확인 | 약 130 |
| recheck | 86 | 3순위. 1차에서 근거가 약했던 것(기존 링크 근거 없음, 크레딧 소진으로 지점 검색 못 하고 브랜드 계정을 넣은 산쪼메 18곳, 젠푸드히노아지 9곳 등) | 약 90 |
| standalone | 229 | 4순위. 링크 없는 단독 매장 — 가장 찾기 어려움 | 약 450 |
| side | 12 | 검색 아님. 프로필 소개글에 나온 상호 변경·이전·폐업 단서 — `closure-verification` 스킬로 별도 검증 | 0 |

Tavily 크레딧은 `/news`·`/gap`·`/rsi` 스킬과 공용이다. 1~3순위(약 260회)를 먼저 하고, 4순위는 남은 크레딧을 보고 정한다. 기본 웹 검색(WebSearch)은 한국 인스타 프로필이 거의 색인돼 있지 않아 대체 불가(2026-10-27 실측: 55곳 중 6곳, 공식 계정명 직접 검색도 0건).

## 절차

1. 브랜치 `chore/instagram-audit-2` 생성
2. `pending.tsv`를 구분별로 25~30곳 묶음 JSON으로 나눈다(같은 브랜드는 한 묶음에). 필드: `id, name, brand, brandSize, city, area, address, existing`
3. 조사 에이전트(general-purpose, sonnet)를 **동시 3개까지만** 돌린다 — 더 많으면 Tavily가 429·빈 응답을 낸다. 에이전트 지시문은 아래 "에이전트 지시문" 그대로
4. 결과 반영 규칙(1차와 동일):
   - `handle` 있음 → `data/enrichment/instagram-<날짜>.json`에 `{name, addrHint(도로명+번호), instagram, sourceNote}` 항목 추가. sourceNote에 프로필 제목
   - 브랜드 계정으로 대체하는 경우라도, 기존 링크가 그 매장만 쓰는 계정이고 "wrong"이 아니면 기존 링크 유지
   - `existingVerdict: "wrong"`이고 대체할 계정이 없으면 `"instagram": ""`(확인된 계정 없음 — 이전 값·체인 승계 차단)
   - `unverified`는 기존 값 유지
   - 브랜드 계정 중 교육기관·운영사 계정(예: `tokyoramenschool`, `kyeong_company`)처럼 제목에 브랜드명이 없거나 같은 사업체인지 불분명한 것은 쓰지 않는다
5. 재생성·검수: `npm run enrich-candidates -- data/out/candidates.tsv data/enrichment/*.json` → `npm run sync-sheet -- data/out/seed.tsv` → `npm run audit-integrity`. 인스타 변경 행을 표본 확인(바뀐 계정의 프로필 제목이 그 매장인지)
6. `npm test`, `npm run build` → 커밋 → main 머지(데이터 전용이라 UI 검수 불필요) → `npm run indexnow`
7. 백로그 D-09 상태 갱신, `pending.tsv`에서 처리한 행 제거

## 에이전트 지시문

```text
You are verifying Instagram accounts for Korean ramen shops on ramap.kr. Accuracy matters more than coverage: a wrong link is worse than an empty one.

Input: <입력 JSON 경로> — array of shops {id, name, brand, brandSize, city, area, address, existing}. `existing` = handle currently in our data (may be wrong). brandSize ≥2 means other shops share the name prefix (a real chain, or unrelated shops with a generic name like 미스터라멘/라멘집/도쿄라멘).

Search tool: use ONLY mcp__tavily-search__tavily_search with include_domains ["instagram.com"], country "South Korea", max_results 6 (15 for brand queries). Do NOT open instagram.com pages (no WebFetch/curl/tavily_extract) — search results only.
- Per shop: query "<name> <area> 라멘 인스타그램". If no acceptable profile, one retry "<name> 인스타그램". Max 2 queries per shop.
- Chain brands (brandSize ≥2): first run ONE brand query "<brand> 라멘 인스타그램" (max_results 15) and reuse it for every shop of that brand. Then per-shop queries only for branches still unresolved (max 1 extra each).

Evidence: ONLY results whose URL is a profile URL (https://www.instagram.com/<handle>, one path segment). Ignore /p/, /reel/, /reels, /explore/, /stories/, /tv/ results entirely. Title is usually "Display Name (@handle)", content is the bio.

Acceptance:
1. Display name or bio must clearly name THIS shop (Korean name or obvious romanization). Never accept personal/foodie/blogger accounts, accounts whose name doesn't include the shop name, or other businesses with a similar word.
2. Location must not contradict: a different branch/neighborhood/city/address in name or bio → not this shop's account.
3. kind: "shop" (standalone's own), "branch" (chain branch's own), "brand" (chain-wide official: name is the brand / official / 본사 / 창업문의 / lists branches — only when this branch has no own account AND the brand is clearly one business with multiple branches), null.
4. existingVerdict for non-null existing: "confirmed" / "wrong" (a profile result shows it belongs to a different shop/branch/business, or this shop has its own confirmed account and existing is neither it nor the brand account) / "unverified" (no profile result for that handle).

Write a JSON array (every input shop, same order) to <출력 JSON 경로>:
{"id", "handle": string|null (lowercase, no @), "kind", "title": string|null (verbatim), "bio": string|null (≤150 chars), "existingVerdict", "existingNote": string|null (≤120), "note": string|null (≤120, side findings only — renamed/moved/closed per bio; do not act on them), "queries": string[]}

Run searches strictly ONE AT A TIME (the API rate-limits with 429). On 429 or an empty response that looks like a failure, wait briefly and retry once. If the API returns 432 (plan usage limit), stop and write what you have, marking unsearched shops with note "quota".

Reply at the end with only: counts of kind and existingVerdict values, and up to 5 unsure cases.
```

## 1차 결과 참고 (2026-10-27)

- 링크 510 → 682곳(+히노아지 33). 교체 55·삭제 7: 산쪼메 구의점 계정 21곳 번짐, 계단라멘 마곡점 계정이 목동·일산에, 멘야카오리 장안점 계정이 3지점에, 코이라멘 압구정·동탄·도산 지점 계정이 체인 계정에 가려짐
- 파이프라인: `mergeMatched`에서 인스타는 그 매장 최신 조사 우선, `""`은 승계 차단. `sheet-parser`가 값을 소문자 계정명으로 정규화
- 화면: 상세 정보 표 "인스타 `@계정 ↗`"(`src/views/shop-detail/ui/instagram-link.tsx`), 여러 지점 공용 계정은 JSON-LD `sameAs` 제외(`isSharedInstagram`), 클릭 이벤트 `instagram_clicked`
