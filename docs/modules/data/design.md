---
status: 유효
updated: 2026-10-28
---

# data 설계

매장 데이터는 DB가 아니라 Git의 파일이다. 공공데이터에서 후보를 뽑고, 조사 결과(enrichment)를 병합해 시트 형식 TSV를 만들고, 검증을 통과하면 `data/shops.json`이 되어 빌드에 들어간다.

## 흐름

```
공공데이터 원본(레포 밖)
  ├─ seed-candidates ──────────────▶ data/out/candidates.tsv  ◀── 갱신 라운드 반영(사람)
  └─ refresh-localdata(격주) ──▶ data/out/refresh-*.tsv → data/review/<TAG>/ (검토 자료)
data/enrichment/*.json (조사 결과)
  └─ enrich-candidates(candidates.tsv + enrichment) ─▶ data/out/seed.tsv(게재) · held.tsv(보류)
       └─ sync-sheet(seed.tsv) ─▶ data/shops.json · data/shop-lastmod.json
            └─ audit-integrity ─▶ data/out/integrity-report.md (git HEAD 대비)
앱: src/entities/shop/api/ 가 data/*.json 을 읽는다 → 배포 후 indexnow
```

- **원천은 `data/out/candidates.tsv`(시트 형식, Git 추적)와 `data/enrichment/*.json`이다.** `seed.tsv`·`held.tsv`·`shops.json`은 재생성 산출물이라 직접 고치지 않는다.
- `data/out/`은 gitignore지만 `candidates.tsv`만 추적한다. `seed-candidates`를 다시 돌리면 `candidates.tsv`를 덮어써 누적된 반영(폐업·신규·수정)이 사라진다.
- 시트 스키마가 곧 데이터 스키마다 → [결정](decisions/0012-시트-스키마가-매장-데이터-스키마.md)

## 파일

| 경로 | 내용 | 쓰는 곳 |
|---|---|---|
| `data/out/candidates.tsv` | 전체 후보(게재·보류·폐업 포함), 시트 36열 | 원천. 사람이 라운드 결과를 반영 |
| `data/enrichment/<주제>-<YYYY-MM[-DD]>.json` | 조사 결과 배열. 파일명 날짜 = 조사일 | 원천. `enrich-candidates` 입력 |
| `data/out/seed.tsv` · `held.tsv` · `area-review.tsv` | 게재분 · 보류분 · 동네라벨 충돌 검수 큐 | 재생성 산출물(미추적) |
| `data/shops.json` | 게재 매장 배열(`Shop` 타입) | 앱이 읽는다 |
| `data/shop-lastmod.json` | `{id: {date, hash}}` — 내용 해시가 바뀐 매장만 날짜 갱신 | 사이트맵 lastmod |
| `data/closure-verification.json` | 폐업·이전 장부 `{id: {verdict, checkedAt, evidence[], movedTo?}}` | 폐업·이전 페이지 공개 여부 |
| `data/shop-redirects.json` | `{지운 id: 남긴 id}` — 같은 가게 중복 행을 합칠 때 | `next.config.ts`가 `/shop/<from>` → `/shop/<to>` 영구 리다이렉트 |
| `data/refresh-exclusions.tsv` | `상호 주소 사유` — 사람이 중복 인허가·비라멘·임시 영업으로 판정한 행 | 갱신 라운드 신규에서 자동 제외 |
| `data/review/<TAG>/` | 갱신 라운드 검토 자료(아래) | PR 리뷰·반영 근거 |
| `data/review/instagram-2026-11/pending.tsv` | 인스타 검수 대기열 | [인스타 검수 라운드](#인스타-검수-라운드) |
| `data/fixtures/` | `sheet.sample.tsv` · `localdata.sample.csv` | 테스트 픽스처 |

## 명령

| 명령 | 입력 → 출력 | 비고 |
|---|---|---|
| `npm run seed-candidates -- <인허가.csv> [상가정보.csv[,…]] [디깅.json…]` | → `data/out/candidates.tsv` | 최초 시딩용. 재실행 시 원천 덮어씀 |
| `npm run extract-lic -- <인허가.csv> <출력.csv>` | 지자체 인허가 원본 → 상가정보 스키마 CSV | 부산 영문·대구/전국 한글 컬럼 자동 탐색, 스트리밍. 영업 중·좌표 확보 행만, 소분류코드 `LIC` |
| `npm run refresh-localdata -- <전국인허가.csv> [TAG=YYYY-MM]` | → `data/out/refresh-{new,closed,unmatched,moves,excluded}.tsv` | 갱신 라운드 대조 |
| `npm run diff-localdata -- <이전.csv> <최신.csv>` | 콘솔 리포트(신규·폐업 전이) | 두 스냅샷 단순 비교. 키 = 상호+도로명 |
| `npm run collect-evidence -- data/review/<TAG> [출력.json]` | → `<출력>.json` + `<출력>.txt` 요약 | 2차 검수 증거 수집. 기본 출력 `/tmp/refresh-evidence.json`. 종료코드 2 = 검수 소스 접속 차단 |
| `npm run enrich-candidates -- data/out/candidates.tsv data/enrichment/*.json` | → `seed.tsv` · `held.tsv` · `area-review.tsv` | 병합·게재 판정 |
| `npm run sync-sheet -- data/out/seed.tsv` | → `data/shops.json` · `data/shop-lastmod.json` | 검증 실패 시 행 단위 리포트, exit 1, 파일 미변경 |
| `npm run audit-integrity [-- <기준 shops.json>]` | → `data/out/integrity-report.md` | 기준 기본값 = `git show HEAD:data/shops.json` |
| `npm run indexnow [-- <URL…>]` | 네이버 서치어드바이저 IndexNow로 전송 | 기본은 프로덕션 `sitemap.xml` 전체(최대 10,000). 배포 후 실행 |
| `npx tsx scripts/backfill-lastmod.ts` | `shops.json` git 이력 재생 → `shop-lastmod.json` | 초기 1회용 |

순수 로직은 `scripts/lib/*.ts`, 테스트는 같은 폴더 `*.test.ts`(vitest `include`에 `scripts/**/*.test.ts`). `npm test`로 함께 돈다.

## 택소노미

값의 원천은 `src/entities/shop/model/taxonomy.ts`. 시트에는 **라벨**을 쓰고 `sheet-parser`가 slug로 바꾼다. 라벨이 정확히 일치하지 않으면 동기화 실패.

| 축 | 시트 라벨 (slug) |
|---|---|
| 형태 | 라멘(`ramen`) · 츠케멘(`tsukemen`) · 마제소바(`mazesoba`) · 아부라소바(`aburasoba`) · 기타(`etc-form`) |
| 스프 | 돈코츠(`tonkotsu`) · 쇼유(`shoyu`) · 시오(`shio`) · 미소(`miso`) · 돈코츠쇼유(`tonkotsu-shoyu`) · 니보시(`niboshi`) · 토리파이탄(`toripaitan`) · 탄탄멘(`tantanmen`) · 교카이(`gyokai`) · 토마토(`tomato`) · 기타(`etc-soup`) |
| 계보 | 이에케(`iekei`, 맛) · 지로계(`jiro`, 맛) · 자가제면(`jikaseimen`, 특성) · 본토직영(`honto`, 특성) |
| 편의 | 식권기 · 카에다마 · 원격 웨이팅 · 한정메뉴 · 심야 · 주차 · 1인 카운터 |

- 값별 결정: [3축·한국화](decisions/0001-택소노미-3축-직교와-한국화-원칙.md) · [복수+대표](decisions/0002-형태와-스프는-복수-허용과-대표값.md) · [스프 구성](decisions/0003-스프-계열-값-구성.md) · [니보시·교카이](decisions/0004-니보시-교카이-병립.md) · [토마토](decisions/0005-토마토-스프-승격.md) · [아부라소바](decisions/0006-아부라소바-별도-형태.md) · [이에케 표기](decisions/0007-이에케-표기.md) · [무화조 제외](decisions/0008-무화조-태그-제외.md) · [본토직영](decisions/0009-본토직영-태그.md) · [편의 태그](decisions/0010-편의-태그-한국화.md) · [계보 기준](decisions/0011-계보는-대표-라멘-기준.md)
- 스프 값 설명 문구(`description`)·일본어 표기(`labelJa`)도 같은 파일에 있다.
- 편의 태그는 값만 정의돼 있고 현재 채운 매장이 없다.

### 세부값(`스프_세부`) 정규화 — `scripts/lib/enrich.ts`

화면에 필터로 노출하지 않는 내부 보관값. `enrich-candidates`가 아래 순서로 정리한다.

| 규칙 | 내용 |
|---|---|
| 형태 승격 `DETAIL_TO_FORM` | 아부라소바·아부라라멘·아부라소바·파이탄 → 형태 `아부라소바`, 세부에서 제거 |
| 스프 승격 `SOUP_PROMOTIONS` | 토마토·토마토라멘 → `토마토`, 교카이 → `교카이` |
| 계보 승격 `LINEAGE_PROMOTIONS` | 지로·지로케·지로계 → `지로계`, 이에케·이에계 → `이에케` (스타일 표기만. "지로라멘" 같은 메뉴명은 승격 안 함) |
| 이형 통일 `SOUP_DETAIL_ALIASES` | 나가사키 · 카레 · 유즈 · 구로마유(쿠로라멘·쿠로이·블랙라멘) · 마라 · 시루나시 · 시지미 · 카라이 · 카모 |
| 제외 | 운영 메모(겸업·퓨전·한식 퓨전) — 시트 `메모` 몫 |
| 메뉴 승격 `promoteFromMenus` | 메뉴명·세부에 드러난 스프·형태를 필터 값에 더한다(긴 표현 우선 소비, 메뉴 등장 순서로 스프 정렬). 계보는 첫 메뉴이거나 메뉴 과반일 때만 |
| 상호 계보 `lineageFromName` | 상호·지점명에 이에케·이에계·家系 → 이에케, 지로·二郎 → 지로계 |

`라멘집 아님`·`실존 미확인`은 세부값이 아니라 **판정 표시**다(게재 게이트가 읽는다).

## 시트 스키마 (36열)

헤더 순서는 `scripts/lib/sheet-parser.ts` `SHEET_HEADER`와 정확히 같아야 한다. 복수 값은 콤마 구분. 빈 칸은 `null`(복수 값은 `[]`).

| 열 | 형식·규칙 | `Shop` 필드 |
|---|---|---|
| id | `^[a-z0-9][a-z0-9-]*$`, 유일. `enrich-candidates`가 상호(+`-지점명`) 로마자화로 매번 생성(최대 40자, 충돌 시 `-2`…) | `id` |
| 상호 / 지점명 | 간판 기준 / 있을 때만 | `name` / `branch` |
| 주소 | 도로명 주소. 시도 반복 표기는 `normalizeAddress`가 정리 | `address` |
| 시 / 구 | 주소에서 자동: 시도 약칭(서울·경기·전남광주 …) / 특별·광역시는 구·군, 도는 시·군 (`scripts/lib/region.ts`) | `city` / `district` |
| 동네라벨 | 개별 상권명(아래 "동네라벨") | `areaLabel` |
| lat / lng | 숫자 | `lat` / `lng` |
| 좌표출처 | `LOCALDATA` / `상가정보` / `수동핀` | `coordSource`: `localdata` / `sanggwon` / `manual-pin` |
| 영업시간 | `11:30-21:00`, 복수 구간 쉼표, 심야 `18:00-02:00` (파서는 형식 검사 안 함) | `hours` |
| 브레이크 | `15:00-17:00` | `breakTime` |
| 휴무 | `월요일` · `토요일, 일요일` · `연중무휴`, 그 밖 자유 표기(`마지막주 월요일`) | `closedDays` |
| 오픈일 | `YYYY-MM-DD`. 인허가일 기준, 조사로 실제 오픈일이 확인되면 그 값 | `openedAt` |
| 상태 / 상태변경일 | `영업`(빈칸) / `휴업` / `폐업` → `open`/`paused`/`closed` | `status` / `statusChangedAt` |
| 형태 / 형태_대표 | 라벨. 대표는 목록 안에 있어야 함 | `forms` / `primaryForm` |
| 스프 / 스프_대표 | 라벨. 대표는 목록 안에 있어야 함 | `soups` / `primarySoup` |
| 스프_세부 | 자유 값(위 정규화) | `soupDetail` |
| 계보 / 편의 | 라벨 | `lineages` / `amenities` |
| 태깅확신도 | `확정` / `추정`(빈칸) | `confidence`: `certain` / `estimated` |
| 대표메뉴1~3 | `이름\|가격` | `menus[]` `{name, price}` |
| 좌석 | 예 `카운터 9, 테이블 2` | `seats` |
| 한줄소개 | 40자 이내 | `tagline` |
| 인스타 | URL·`@`·계정명 모두 받아 소문자 계정명으로 정규화, `[a-z0-9._]{1,30}` 아니면 실패 | `instagram` |
| 네이버플레이스 / 웨이팅링크 | URL | `naverPlace` / `waitingLink` |
| 검증상태 | `운영자확인` / `제보검토중`(빈칸) → `confirmed` / `pending` | `verification` |
| 최종확인일 / 정보출처 / 메모 | 날짜 / 텍스트(예 `시딩v2(인허가+상가)`, 조사 근거 누적 최대 200자) / 자유 | `lastVerifiedAt` / `source` / `note` |

- `Shop`·`ShopList` 타입은 `src/entities/shop/model/types.ts`. `photos`는 시트 열이 없어 항상 `[]`이다(매장 사진은 아직 없음).
- `ShopList`(소목록)는 타입만 있고 데이터·시트는 없다 → [요구사항](requirements.md#범위-밖-아직-안-함)
- 검증 결정: [운영자확인](decisions/0014-운영자확인은-사람-검수일-때만.md). 태깅확신도 산정은 `scripts/lib/grade.ts`.

### 동네라벨

[결정](decisions/0013-동네라벨은-캐치테이블-상권명.md). `enrich-candidates`의 우선순위:

1. 조사에서 검색으로 확증한 라벨(`area` + `areaConfirmed: true`)
2. 주소 사전 판정 `areaLabelOf` — 키 `구|법정동`(괄호 속 동), 일부는 도로명 직접 판정 (`scripts/lib/area-label.ts`)
3. 확증 없는 디깅 라벨(`area`)
4. 그래도 없으면 게재분 중 라벨 있는 최근접 매장(1.5km 이내)의 라벨 상속

확증 없는 디깅 라벨이 주소 판정과 다르면 `data/out/area-review.tsv`로 보낸다.

## 시딩

[결정](decisions/0017-시드는-보편-추출과-디깅-보강-2층.md) · [조사](research/2026-09-02-시드-소스-딥리서치와-실측.md)

| 단계 | 규칙 | 코드 |
|---|---|---|
| 인허가 파싱 | 컬럼 별칭 탐색(도로명전체주소/도로명주소 등). `영업`으로 시작하는 상태만 open | `scripts/lib/localdata.ts` |
| 키워드 매칭 | 상호에 라멘 · 라-멘 · 멘야 · 라멘야 · 츠케멘 · 마제소바 · 라면집 (`RAMEN_KEYWORDS`) | `isRamenCandidate` |
| 상가정보 보조 발굴 | 소분류 `I20303` ∩ 제외어(우동·소바·돈가스·돈까스·초밥·스시·카레·규동·덮밥·이자카야·포차) 미포함 | `scripts/lib/sanggwon.ts` |
| 조인 | 상호 정규화(`(주)`·공백·기호 제거) 부분 매칭 하한 2자 + 위치 호환(좌표 500m 또는 주소 구 일치). 같은 도로명+건물번호면 같은 매장. 좌표 150m 초과 차이는 메모 플래그 | `scripts/lib/merge-candidates.ts` |
| 좌표 | 인허가 EPSG:5174 → WGS84(proj4), 상가정보는 WGS84 그대로 | `tmToWgs84` |
| 디깅 이름 발굴 | 디깅 JSON의 `name`을 인허가·상가정보 전체에서 정규화 **완전 일치**로 찾아 추가 | `discoverByName` · `discoverBySanggwonName` |
| 출력 | `정보출처=시딩v2(<출처>)`, 상태 `영업`, 확신도 `추정`, 검증 `제보검토중`. I20303 단독 발굴은 메모 "라멘 여부 확인 필요" | `candidatesToSheetTsv` |

- CSV 인코딩은 UTF-8·EUC-KR을 자동 판별(`scripts/lib/csv.ts`). 원본 CSV는 레포 밖에 두고 경로를 인자로 준다.
- 원본: LOCALDATA 일반음식점(아래 갱신 라운드 접근 정보), 소상공인 상가(상권)정보 data.go.kr 15083033(업종코드 15067631, WGS84 좌표 포함), 지자체 인허가 원본은 `extract-lic`로 변환해 상가정보 인자로 넣는다.
- 디깅 소스 사용 경계 → [결정](decisions/0018-디깅-소스-저작권-경계.md)

## 보강 (enrich-candidates)

### enrichment 항목 스키마 — `scripts/lib/enrich.ts` `Enrichment`

| 필드 | 뜻 |
|---|---|
| `name` | 매장 상호(매칭 키) |
| `addrHint` | 도로명+번호. 행 주소에 포함될 때만 위치 필드·인스타를 그 매장에 준다 |
| `area` / `areaConfirmed` | 동네라벨 / 검색으로 확증했는지 |
| `soups` `primarySoup` `forms` `primaryForm` `soupDetail` `lineages` | 장르(시트 라벨로) |
| `instagram` | 계정. `""` = 확인된 계정 없음(이전 값·승계 차단) |
| `naverPlace` `openedAt` `hours` `breakTime` `closedDays` `seats` `menus`(`"이름\|가격"`) | 위치 종속 사실 |
| `closed` | 폐업 의심 → 제외, 메모에 "폐업 의심(디깅 소스) — 확인 필요" |
| `unverified` | 재검증에서도 실존 흔적 없음 → 보류 |
| `standalone` | 이름만 겹치는 별개 가게 — 체인 승계 양방향 차단 |
| `chainWide` | 계보가 체인 전 지점의 사실(체인 선언) |
| `sourceNote` | 근거(출처 종류·날짜). `정보출처`에 덧붙는다 |
| `observedAt` | 로더가 파일명 날짜로 채움(월 단위 파일은 `YYYY-MM-00`) |

### 병합 규칙

- 매칭: 정규화 상호(+지점명)가 같거나 짧은 쪽 3자 이상 **접두** 일치(`matchEnrichment`). 중간 포함은 쓰지 않는다.
- 승계(같은 체인 판정·계보·인스타·위치 필드)와 검수 절차는 [data-integrity 스킬](../../../.claude/skills/data-integrity/SKILL.md)이 원천 → [결정](decisions/0020-정보는-같은-가게-같은-체인에만-승계.md)
- 최신 조사일 우선 필드 → [결정](decisions/0021-조사-결과는-최신-조사일-우선.md)
- 동명 행(상호+지점 정규화가 같은 행)이 여럿이면 정확 일치 항목도 `addrHint`가 있어야 위치 필드를 준다.
- 오픈일은 조사값이 있으면 그 값, 없으면 시트 값(인허가일).
- 형태가 비면 `라멘`, 스프가 비면 `기타`가 기본값이다.

### 게재 판정

[결정](decisions/0019-게재-게이트는-웹-실존-신호.md). 콘솔에 `후보 N → 게재 / 보류 / 제외` 건수를 찍는다.

## 동기화 (sync-sheet)

- 헤더가 `SHEET_HEADER`와 다르면 즉시 실패.
- 행 단위 검증: id 형식·중복, 라벨 존재, 대표값 포함, 상태·확신도·검증상태·좌표출처 허용값, 메뉴 `이름|가격`, lat/lng 숫자, 인스타 형식. 문제 행이 하나라도 있으면 전체를 보고하고 exit 1, `shops.json` 미변경.
- 통과 시 `shops.json`을 임시 파일 → rename으로 원자적 교체.
- `shop-lastmod.json`: 매장 객체를 키 정렬 JSON으로 sha1(16자) — 해시가 바뀐 매장만 오늘 날짜(`scripts/lib/lastmod.ts`).

## 무결성 검수 (audit-integrity)

재생성할 때마다 필수. 기준(git HEAD) 대비 변경을 리포트한다(`scripts/lib/integrity.ts`).

- 첫 줄: 변경 N곳(계보 N) · 소실 N · 신규 N · 인스타 공유 그룹 N
- 구역: 소실(게재 → 비게재) / 계보 변경 / 장르·인스타 변경 표(스프·형태·인스타) / 주소가 다른 매장끼리 같은 인스타(폐업 제외)
- 판정·반영 금지 조건·보고 형식은 [data-integrity 스킬](../../../.claude/skills/data-integrity/SKILL.md)

## 갱신 라운드

[결정](decisions/0022-갱신-라운드는-LOCALDATA-전국본-대조.md) · 지난 라운드 결과 → [조사](research/2026-10-19-데이터-갱신-라운드-결과.md)

### 원천 접근

- LOCALDATA 웹은 공공데이터포털로 이관됐지만 **파일 서버는 살아 있다**: 안내 허브 `https://file.localdata.go.kr/file/general_restaurants/info` → 파일 `https://file.localdata.go.kr/file/download/general_restaurants/info`
- 조건: `Referer: https://file.localdata.go.kr/file/general_restaurants/info` + 일반 UA. `Accept-Ranges` 지원. 전국 일반음식점 약 700MB·230만 행, **EUC-KR**(응답 헤더의 `charset=UTF-8`은 거짓), 일 갱신(2일 전 기준).
- 사용 컬럼: 사업장명·도로명주소(없으면 지번주소)·영업상태명·폐업일자·관리번호·업태구분명·좌표정보(X)/(Y)·인허가일자. 다른 업종은 허브 페이지의 `/file/<slug>/info` 링크에서 slug 확인(예 `bakeries`).
- 서버가 첫 연결을 `Connection reset by peer`(curl 35)로 자주 끊는다. curl `--retry`는 35를 재시도하지 않으므로 `--retry-all-errors`가 필요하다.

### 절차

```bash
curl -L --retry 6 --retry-all-errors --retry-delay 15 --max-time 900 \
  -H "User-Agent: Mozilla/5.0" -H "Referer: https://file.localdata.go.kr/file/general_restaurants/info" \
  -o /tmp/general_restaurants.csv https://file.localdata.go.kr/file/download/general_restaurants/info
# 실패하면 60초 뒤 1회 재실행
npm run refresh-localdata -- /tmp/general_restaurants.csv <TAG>     # data/out/refresh-*.tsv
# refresh-*.tsv 를 data/review/<TAG>/ 로 복사
npm run collect-evidence -- data/review/<TAG> /tmp/refresh-evidence.json
# 2차 검수 → data/review/<TAG>/ 산출물 → PR (여기까지가 격주 루틴)
# ── 이하 사람이 반영 ──
# candidates.tsv 반영, enrichment 추가(data/enrichment/refresh-<TAG>.json 등)
npm run enrich-candidates -- data/out/candidates.tsv data/enrichment/*.json
npm run sync-sheet -- data/out/seed.tsv
npm run audit-integrity          # 소실·계보 변경 사유 전부 확인
npm test
# PR → 사람이 머지(배포) → npm run indexnow
```

- 라운드 시작 전 재현성 기준선: 반영 없이 `enrich-candidates` → `sync-sheet` 결과가 현행 `shops.json`과 내용이 같아야 한다. 다르면 갱신보다 원인부터.

### 분류 (`scripts/lib/refresh.ts` `classifyRefresh`)

| 출력 | 정의 |
|---|---|
| `refresh-new.tsv` | 라멘 키워드 상호 + 영업 + 어떤 기지 후보와도 미매칭. 같은 이름+건물 중복은 접음. 시트 형식, 오픈일 = 인허가일, 정보출처 `LOCALDATA 시딩 <TAG>` |
| `refresh-closed.tsv` | 기지 후보와 매칭되는 최신 행이 모두 폐업. 열: 상호·지점명·주소·게재(Y)·폐업일자·관리번호·같은건물영업중. 이미 폐업 처리한 행은 다시 보고하지 않음 |
| `refresh-unmatched.tsv` | 게재 매장인데 매칭 행 0 — 자동 폐업 금지, 검토만 |
| `refresh-moves.tsv` | 신규 후보 상호가 폐업·미발견 매장과 겹침 — 이전 가능성 |
| `refresh-excluded.tsv` | 임시 영업장(`isTemporaryVenue`) 또는 `data/refresh-exclusions.tsv` 일치(상호 포함관계 + 같은 건물) |

대조 대상은 스트리밍 중 라멘 키워드·기지 상호·기지 건물 중 하나라도 걸리는 행으로 줄인다. 주소는 `normalizeAddress`로 정리한다.

### 2차 검수

[결정](decisions/0025-2차-검수-수단-고정.md)

- 수집: `collect-evidence` — 대상은 `refresh-new.tsv` 전부 + `refresh-closed.tsv`의 게재=Y 전부. 항목당 Daum 통합검색 2회(상호+법정동, 상호+도로명)에서 장소 카드 영업 표기와 상호가 들어간 후기 조각(뒤 220자 안의 첫 날짜). 라멘 미니갤(`goodramen`) 최근 21일 키워드 7종(오픈·개업·폐업·영업종료·이전·휴업·2호점) + 사건성 제목 글 본문 최대 30건. 직전 라운드 `closed-verify.tsv` 판정과 같은 건물 영업 인허가를 함께 붙인다.
- 검색 원문은 커밋하지 않는다. 사람이 읽을 요약은 `<출력>.txt`.
- 근거 인정·불인정(인허가 재게시 디렉터리·검색어 되돌림·광고·날짜 없는 조각은 무효)은 [closure-verification 스킬](../../../.claude/skills/closure-verification/SKILL.md)의 판정표·"증거로 쓰지 않는 것"을 신규 판정에도 그대로 쓴다.
- 신규 판정: `라멘 영업 확인`(같은 주소 장소 카드 또는 방문 후기) / `라멘집 아님` / `중복` / `임시 영업` / `미확인`
- 폐업 전이 판정: closure-verification 스킬 범주(영업 중 · 이전 · 확정 폐업 · 미확정) + `상호 변경 의심`(같은 건물 영업 인허가에 라멘 상호 → 그 가게 조사 후 처리)
- 직전 라운드 판정과 달라지면 근거에 "MM/DD 판정 정정"을 적는다.
- 산출 `data/review/<TAG>/`: refresh-*.tsv 사본 · `new-verify.tsv`(상호·주소·인허가일·판정·근거) · `closed-verify.tsv`(상호·지점명·주소·폐업일자·판정·근거(날짜 포함 1문장)) · `gallery-sync.md`(우리 데이터와 어긋난 갤러리 사건만) · `SUMMARY.md`(대조 결과·반영 권고 표·판정별 건수)

### 반영

| 판정 | 반영 |
|---|---|
| 확정 폐업 / 이전 | closure-verification 스킬 절차(장부 + candidates `상태=폐업`·`상태변경일`). 이전의 신 주소는 신규 후보 |
| 영업 중 | 변경 없음(오판이면 `상태=영업` 복원, 메모에 근거) |
| 미확정 | 장부에 넣지 않음 — 비공개 유지, 다음 라운드 재검증 |
| 신규 라멘 영업 확인 | `refresh-new.tsv` 행을 candidates에 추가 + 조사 항목 |
| 신규 미확인 | candidates에 넣고 `실존 미확인` 항목으로 보류(다음 라운드 재등장 방지) |
| 신규 중복·라멘집 아님·임시 영업 | `data/refresh-exclusions.tsv`에 한 줄 |
| 같은 가게 중복 행 | 정보 많은 행(기록 있는 id 우선)을 남기고 지운 id를 `shop-redirects.json`에, 재유입은 exclusions로 차단 |

enrichment를 쓸 때(스킬의 "항목을 추가·수정할 때"에 더해):

- 동명 신규 행을 넣을 때는 기존 항목에 `addrHint`를 먼저 붙인다(안 그러면 기존 매장의 영업시간·메뉴가 빠진다). 같은 가게의 지번/도로명 이형 행은 병합한다.
- 신규 행이 기존 상호와 접두로 겹치면 같은 체인인지 다른 가게인지 `sourceNote`에 근거를 적는다. 동명 체인 항목 덕에 조사 전 자동 게재된 신규 행은 눈으로 검토한다.
- 체인 승계는 `primarySoup`·스프 순서까지 형제 지점에 번진다 → 신규 항목은 `primarySoup`를 비우고 스프 순서를 기존과 맞춘다. 범용 접두어 항목에는 `기타` 스프를 넣지 않는다.

### 격주 루틴

[결정](decisions/0026-격주-루틴은-검토-자료까지.md)

| 항목 | 값 |
|---|---|
| 루틴 | claude.ai/code Routines `trig_01KPE7yfxcDBr9ZWYJhC69oA` "라맵 데이터 갱신 검토 자료 (격주)" |
| 주기 | cron `0 0 1,15 * *`(UTC) |
| 모델·환경 | `claude-sonnet-5-5` · `env_01H1EdNEezDifbixJfgAAPSd`(이름 Default) |
| 산출 | `data/review/<날짜>/` 커밋 → `chore/data-refresh-<날짜>` 브랜치 PR |
| 네트워크 전제 | 환경 Network access **사용자 지정** + Allowed domains `file.localdata.go.kr`·`search.daum.net`·`gall.dcinside.com` + "패키지 매니저 기본 목록 포함". 미등록 시 `CONNECT tunnel failed, response 403`. 편집: claude.ai/code 하단 환경 선택 → 클라우드 → 환경 행 호버 → 톱니바퀴 |
| GitHub 전제 | Claude GitHub App이 `slowteady/ramap`에 contents·issues 쓰기 권한으로 설치(https://github.com/apps/claude/installations/select_target) |
| 수정 경로 | 루틴은 생성 주체(RemoteTrigger http_api)로만 수정 가능, 루틴 자신의 세션은 비활성화만. effort 필드는 API에 없어 무시됨 |

## 폐업 장부

[결정](decisions/0024-폐업은-직접-증거로만-확정.md)

- 판정·증거·장부 형식·보고는 [closure-verification 스킬](../../../.claude/skills/closure-verification/SKILL.md)이 원천.
- 앱: `getClosureLedger`(`src/entities/shop/api/get-closure-ledger.ts`)가 장부를 읽고, `closurePublicState(shop, ledger)`(`src/entities/shop/model/closure.ts`)가 `open`/`closed`/`moved`/`hidden`을 정한다. 폐업 매장 페이지 표현 → [shop-pages 설계](../shop-pages/design.md)
- 유저 폐업 제보도 같은 스킬로 검증한다 → [report 설계](../report/design.md)

## 인스타 검수 라운드

[결정](decisions/0027-인스타-링크는-지점-브랜드-비움-순.md) · 근거·우선순위 규칙은 [data-integrity 스킬](../../../.claude/skills/data-integrity/SKILL.md) "인스타" 절 · 1차 결과 → [조사](research/2026-10-27-인스타-링크-1차-검수.md)

### 대기열 — `data/review/instagram-2026-11/pending.tsv`

열: `구분 id 매장 주소 현재 인스타 사유`. 처리 순서와 방법:

| 순서 | 구분 | 방법 |
|---|---|---|
| 1 | `chain` | 브랜드당 검색 1회(`<브랜드> 라멘 인스타그램`, max_results 15)로 공식·지점 계정을 한 번에 |
| 2 | `existing` | 이미 링크가 있는 단독 매장 — 맞는지 확인 |
| 3 | `recheck` | 1차에서 근거가 약했던 것(근거 없는 기존 링크, 지점 검색 없이 브랜드 계정을 넣은 곳 등) |
| 4 | `standalone` | 링크 없는 단독 매장 — 가장 찾기 어려움, 남은 크레딧을 보고 정함 |
| — | `side` | 검색 아님. 프로필 소개글의 상호 변경·이전·폐업 단서 → closure-verification 스킬로 별도 검증 |

구분별 건수는 파일에서 센다.

### 검색 수단 제약

- Tavily 검색만 쓴다. 무료 크레딧 월 1,000회, 매월 1일 리셋, `/news`·`/gap`·`/rsi` 스킬과 공용.
- 조사 에이전트는 **동시 3개까지** — 더 많으면 429·빈 응답.

### 절차

1. 이슈 브랜치에서 작업한다([공통 결정](../../decisions/0005-이슈-기반-작업.md)).
2. `pending.tsv`를 구분별로 25~30곳 묶음 JSON으로 나눈다(같은 브랜드는 한 묶음). 필드: `id, name, brand, brandSize, city, area, address, existing`
3. 조사 에이전트(general-purpose, sonnet)에 아래 지시문을 그대로 준다.
4. 결과 반영:
   - `handle` 있음 → `data/enrichment/instagram-<날짜>.json`에 `{name, addrHint(도로명+번호), instagram, sourceNote}` 추가. `sourceNote`에 프로필 제목
   - 브랜드 계정으로 대체하는 경우라도, 기존 링크가 그 매장만 쓰는 계정이고 `wrong`이 아니면 기존 링크 유지
   - `existingVerdict: "wrong"`이고 대체할 계정이 없으면 `"instagram": ""`
   - `unverified`는 기존 값 유지
   - 에이전트가 `handle: null`로 판정한 매장에 같은 이름 그룹의 브랜드 계정을 자동 대입하지 않는다. 브랜드 대체는 에이전트가 그 매장에 `kind: "brand"`를 준 경우만
   - 소개글·제목에 위치 근거가 없는 매장·지점 계정은 이름이 고유하고 다른 단서(계정명 지명·전화번호·역 이름)가 있을 때만. 대표 개인·유튜버 계정, 게시물 0개 빈 계정은 쓰지 않는다
   - 교육기관·운영사 계정(예 `tokyoramenschool`, `kyeong_company`)처럼 제목에 브랜드명이 없거나 같은 사업체인지 불분명한 브랜드 계정은 쓰지 않는다
5. 재생성·검수: `enrich-candidates` → `sync-sheet` → `audit-integrity`. 인스타 변경 행을 표본 확인(바뀐 계정의 프로필 제목이 그 매장인지).
6. `npm test`, `npm run build` → PR. 처리한 행은 `pending.tsv`에서 지우고 백로그 D-09를 갱신한다. 머지·배포 후 `npm run indexnow`.

### 에이전트 지시문

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

### 앱 쪽

- `sheet-parser`가 값을 소문자 계정명으로 정규화(`scripts/lib/instagram.ts` `normalizeHandle`).
- `instagramUrl`·`isSharedInstagram`(`src/entities/shop/model/instagram.ts`) — 화면·구조화 데이터 사용은 [shop-pages 설계](../shop-pages/design.md)

## 정기 휴무 수집

[결정](decisions/0028-정기-휴무는-후기-2건-일치로-채택.md)

- 추출: `extractClosedDays(text)` — 후기 조각에서 "월요일 휴무", "정기휴무: 화", "매주 월·화 휴무", "연중무휴" 꼴을 요일 배열로. 매치 자체나 그 앞 16자 안에 임시·명절·연휴·날짜·n번째·격주·매월·마지막 같은 비정기 표현이 있으면 버린다. 장소 카드 문구는 `null` (`scripts/lib/closed-days.ts`)
- 채택: `decideClosedDays(evidence[])` — 같은 요일 조합 2건 이상 + 반대 근거의 3배 이상일 때만 라벨(`월요일`, `토요일, 일요일`, `연중무휴`), 아니면 `null`
- 위치 단서(도로명·동)가 있는 조각만 입력으로 쓴다.
- 결과는 `data/enrichment/closed-days-<날짜>.json`에 `{name, addrHint, closedDays, sourceNote}`(근거 건수·후기 날짜)로 넣는다. 전용 CLI는 없다.

## 앱이 데이터를 읽는 곳

| 함수 | 파일 | 읽는 데이터 |
|---|---|---|
| `getShops` | `src/entities/shop/api/get-shops.ts` | `data/shops.json` (server-only, `React.cache`) |
| `getClosureLedger` | `src/entities/shop/api/get-closure-ledger.ts` | `data/closure-verification.json` (없으면 `{}`) |
| `getShopLastmod` | `src/entities/shop/api/get-shop-lastmod.ts` | `data/shop-lastmod.json` → 사이트맵 |
| `redirects()` | `next.config.ts` | `data/shop-redirects.json` |

매장 파생 로직(신규 오픈·씬 페이지·지역 클러스터·구조화 데이터)은 `src/entities/shop/model/` → [shop-pages 설계](../shop-pages/design.md), [map 설계](../map/design.md)
