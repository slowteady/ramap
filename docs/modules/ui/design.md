---
status: 유효
updated: 2026-10-28
---

# UI 설계

디자인 토큰·정보 구조·공통 헤더·화면 품질 게이트의 현재 상태.

## 코드 포인터

| 파일 | 역할 |
|---|---|
| `src/app/globals.css` | **토큰의 유일한 원천** — `@theme`(색·radius·타이포·간격·폰트·셸 폭), shadcn 시맨틱 변수(`:root`), base 레이어, 유틸(`mask-fade-r`), 지도 타일 톤다운(`.map-tone`) |
| `.claude/skills/ramap-ui/SKILL.md` | UI 코드 작성 규율 실물 — 토큰 사용법·금지 시그니처·구조 금지 패턴·바텀시트 제스처 규율. UI 작업 시 필수 |
| `src/app/layout.tsx` | 앱 셸 — Pretendard Variable 로드, `max-w-app` 중앙 컬럼, 전역 `Toaster`·`ConsentSheet` |
| `src/shared/ui/page-header.tsx` | 2뎁스 공통 헤더(뒤로가기 + 우측 보조 액션 1개, `dark` 변형) |
| `src/shared/ui/back-button.tsx` | 뒤로가기 — 이력 있으면 `router.back()`, 없으면 `fallbackHref`(기본 `/`) |
| `src/shared/ui/` | shadcn 기반 공통 UI(배럴 없음 — shadcn CLI 호환) |
| `src/shared/lib/utils.ts` | `cn()` — 커스텀 텍스트 스케일이 등록된 유일한 클래스 병합 함수 |
| `src/views/home/ui/home-page.tsx` | 홈 헤더(로고·검색·프로필) |

## 토큰 규율

값은 `globals.css`를 본다. 여기는 쓰는 규칙만.

| 그룹 | 토큰 | 규칙 |
|---|---|---|
| 액센트 | `ramen`, `ramen-050`, `ramen-100` | 유일한 유채색. 틴트는 활성(050)·선택(100) 칩 배경. shadcn `primary`도 같은 값. 캐치테이블 브랜드색과 hue를 떼어 둔 값([결정](decisions/0001-design-token-rules.md)) |
| 텍스트 | `ink` | 근흑. 순흑 금지 |
| 그레이 | `gray-050` ~ `gray-500` | 배경·구분선·보조 텍스트·비활성. 상태 표현은 이 단계 차로 |
| 시맨틱 | `open` | 그린. 영업 정보 전용 |
| radius | `rounded-card`·`rounded-card-lg` / `rounded-pill` / `rounded-chip` | 카드 / 컨트롤 / 태그 배지. 그 외 금지. 콘텐츠는 각지게, 컨트롤은 pill([결정](decisions/0001-design-token-rules.md)) |
| 타이포 | `text-caption`·`text-secondary`·`text-body`·`text-title`·`text-heading`·`text-display` | 6단 고정. 위계는 굵기(400/600/700)와 그레이 단계로 |
| 폰트 | `font-sans` | Pretendard Variable. 기본 폰트(Inter·Roboto) 흔적 금지 |
| 레이아웃 | `max-w-app`, `h-sheet-card` | 앱 셸 최대 폭(시트·오버레이 포함 전 화면 공통), 지도 홈 매장 카드 높이 |

- 규칙 전체: 흰 배경 + 그레이 + 유채 1색, 색 = 누를 수 있는 곳, 카드 구획은 여백([결정](decisions/0001-design-token-rules.md))
- shadcn `accent`는 호버 서피스(그레이)이지 브랜드색이 아니다
- 다크모드 없음 — `.dark` 블록 없음(이유는 [요구사항](requirements.md))
- 클릭 요소는 `<button>`/`<a>`만. 커서는 base 레이어가 `button`·`[role="button"]`에 일괄 pointer
- 그라데이션은 가로 스크롤 에지 페이드 마스크 `mask-fade-r` 한 곳만 예외

## 플랫폼과 앱 셸

- 모바일웹 퍼스트 — 이유는 [요구사항](requirements.md). 모든 화면이 `max-w-app` 폭의 흰 중앙 컬럼 안에 그려지고, 바깥 여백은 `gray-050`
- 데스크톱은 같은 단일 컬럼(무붕괴). 스플릿 뷰 없음

## 정보 구조

### 내비게이션

```
[라맵 로고]                       [검색] [프로필]
[필터 칩 행 ……………………………………]  [라멘집 등록]
```

- 메뉴 없음. 홈 = 지도, 필터는 지도 안 컨트롤, 기여는 버튼. 메뉴 수와 데이터 깊이는 반비례한다 — 살아 있는 니치 지도 서비스는 코어 뷰 1 + 참여 1 + 차별화 콘텐츠 1~2로 수렴(라멘GPS·포카맵·워시맵 등 7곳 실측). 랭킹·어워드 메뉴는 데이터가 쌓인 뒤
- 검색은 헤더 아이콘, 프로필은 로그인 기능이 켜졌을 때만 보이는 `/me` 링크
- 장르 가이드는 메뉴가 아니라 필터·매장·마이 페이지의 컨텍스트 링크로 진입
- 필터 칩 행 구성·동작은 [map design](../map/design.md)

### 라우트 맵

| 라우트 | 성격 | 진입 경로 | 코드 |
|---|---|---|---|
| `/` | 홈 = 풀스크린 지도 + 상시 바텀시트. 스크롤 콘텐츠 없음 | 직접 방문 | `src/app/page.tsx` → `views/home` |
| `/?search=1` | 검색 오버레이(상태) | 홈 헤더 아이콘 | `views/home` |
| `/?report=new` | 새 라멘집 등록 시트(상태). 구 `/report`는 여기로 리다이렉트 | [라멘집 등록] 버튼, 검색 빈 결과 | `features/report`, `src/app/report/page.tsx` |
| `/shop/{slug}` | 매장 상세(SSR, SEO 단위) | 지도·목록·검색·리스트 | `views/shop-detail` |
| `/area/{area}` | 지역 리스트(SSR) | 검색 착지, 크로스링크 | `views/area-list` |
| `/area/{area}/{genre}` | 지역×장르 리스트(SSR, SEO 엔진) | 검색 착지, 크로스링크 | `views/area-list` |
| `/style/{lineage}` | 계보 랜딩(SSR) | 검색 착지, 컨텍스트 링크 | `views/style-landing` |
| `/guide`, `/guide/{slug}` | 장르 가이드 목록·본문(SSR) | 컨텍스트 링크, 검색 착지 | `views/genre-guide` |
| `/me` | 마이(noindex) | 헤더 프로필 | `views/me` |
| `/settings` | 설정(noindex) | 마이 헤더 ⚙ | `views/settings` |
| `/terms`, `/privacy` | 약관·개인정보 방침 | 설정 | `views/legal` |
| `/admin` | 운영 검수(noindex, 내비 없음) | 운영자 직접 | `views/admin` |

- 각 화면 명세: 홈·검색 = [map design](../map/design.md), 등록 시트 = [report design](../report/design.md), 상세·지역·계보·가이드 = [shop-pages design](../shop-pages/design.md), 마이·설정 = [records design](../records/design.md)
- SEO 착지 페이지(상세·지역·계보·가이드)는 내비에 없다. 검색이 입구이고, 크롤러 발견은 `sitemap.xml`·`robots.txt`와 랜딩 간 상호 크로스링크가 담당
- 신규 오픈 전용 페이지는 없다 — "새로 오픈" 칩과 필터로 대신한다([shop-pages 요구사항](../shop-pages/requirements.md), 표시 규칙은 [map design](../map/design.md#신규-오픈-표시))
- 홈 아래 SSR 콘텐츠 섹션은 없다 — [map design](../map/design.md)

### 헤더

| 화면 | 헤더 |
|---|---|
| 홈 | 로고(h1, 스크린리더 "라맵") · 검색 아이콘 · 프로필 아이콘 |
| 2뎁스 전부(가이드·지역·계보·마이·설정·약관·상세·운영) | 뒤로가기 + 우측 보조 액션 1개. 로고·홈 링크 없음. 뒤로가기는 이력이 없으면(검색 착지) 홈으로 — back만 있으면 막다른 길이 된다 |
| 풀스크린 오버레이(검색 등) | 뒤로가기(=닫기) + 입력/제목 |

- `PageHeader`를 쓰는 화면: 운영, 지역 리스트, 장르 가이드(목록·본문), 계보 랜딩. 매장 상세·마이·설정·약관은 같은 형태를 자체 마크업으로 그린다

## 공통 라벨

| 위치 | 라벨 |
|---|---|
| 홈 기여 버튼 | 라멘집 등록 |
| 등록 시트 제목 / CTA | 새 라멘집 등록 / 등록하기 |
| 검색 빈 결과 등록 진입 | 라멘집 등록하기 |
| 매장 상세 수정·폐업 진입 | 잘못된 정보가 있나요? (일급 행) |
| 지도 실패 배너 | 지도를 불러오지 못했어요 |

"제보"는 신규 등록 라벨로 쓰지 않는다 — 폐업·수정·가격 갱신까지 뭉뚱그리는 말이라서다. 국내 지도는 "신규 장소 등록"(카카오맵·네이버)으로 수렴했고, 상세의 "잘못된 정보가 있나요?" 일급 행은 캐치테이블, 검색 빈 결과 아래 등록 진입은 카카오·네이버·망고 관례.

## 지도 실패 폴백

지도를 쓰는 화면은 지도 로드 실패 시 리스트 + 안내 배너로 대체한다. 현재 지도를 띄우는 화면은 홈뿐이다(매장 상세는 정적 지도 없음). 구현은 [map design](../map/design.md).

## AI티 방지 게이트

빌드 시 모든 화면이 통과해야 한다. AI티는 레퍼런스 없이 기본값으로 생성된 흔적이고, 무국적 화면은 "라맵 화면"으로 식별되지 않는다. 대원칙: 모든 레이아웃 패턴은 실측 레퍼런스 출처를 댈 수 있어야 하고, 못 대면 제거한다. shadcn 컴포넌트는 토큰 테마로 덮기 전에 쓰지 않는다. 게이트는 `ramap-ui` 스킬로 모든 UI 작업에 적용되고, 코드 작성 규율 실물은 [`ramap-ui` 스킬](../../../.claude/skills/ramap-ui/SKILL.md)이다.

**금지 시그니처**

- [ ] Inter/Roboto 등 기본 폰트 흔적 없음 (Pretendard만)
- [ ] 그라데이션 배경 없음 (사진 플레이스홀더, `mask-fade-r` 제외)
- [ ] radius는 카드 8~12 / 컨트롤 pill / 태그 배지 5px뿐 — `rounded-2xl` 남발 없음
- [ ] 이모지 아이콘 없음 (lucide 라인 아이콘만)
- [ ] 유리 효과(backdrop-blur 카드) 없음
- [ ] 테두리 + 그림자 이중 카드 없음 — 여백 구획 우선
- [ ] shadcn 기본 팔레트 잔재(slate/zinc) 없음
- [ ] 보라-파랑 계열 액센트 없음
- [ ] 화면을 무드보드(Mobbin·실서비스 10~15장) 옆에 놓고 비교했는가
- [ ] "이 화면이 어느 서비스 것인지 가릴 수 있는가" — 가려지면 실패

**금지 구조 패턴 (AI 단골 레이아웃)**

- [ ] 아이콘 + 제목 + 설명 3열 특징 카드 그리드 없음 → 에디토리얼 문장 속 인라인 정보로(Culture Trip·Hitosara)
- [ ] 중앙 정렬 히어로(제목 + 서브 + CTA 2개) 없음
- [ ] 숫자 나란한 통계 밴드 없음 (다크 헤더의 인라인 통계는 예외 — Hitosara 이원 톤)
- [ ] 섹션 제목 위 pill 배지("NEW" 류) 없음
- [ ] 아이콘 원형 파스텔 배경 없음
- [ ] 모든 섹션이 같은 리듬(제목-설명-그리드) 반복 없음
- [ ] 페이지 끝 CTA 밴드 재등장 없음
- [ ] 3단계 스텝퍼 온보딩 없음 (온보딩은 단일 화면)
- [ ] FAQ는 기본 아코디언 대신 답변 노출형 Q&A(Yelp·Tripadvisor — 답이 HTML에 노출돼 SEO에도 유리)
- [ ] 모든 레이아웃 패턴에 실측 레퍼런스 출처가 있다. 출처를 못 대면 제거

벤치마크 배정: 앱 구조·검색·카드 = 캐치테이블(도메인 최근접) / 지도 = 호갱노노 / 바텀 카드·상세 탭 = 오늘의집 / 토큰 규율 = 토스. 구조·동작은 한국 컨벤션을, 시각 언어는 미려 레퍼런스를 따른다.

## 안티패턴

| 영역 | 금지 |
|---|---|
| 필터 | 값 칩 15+ 평면 나열 / 축 혼합 칩 바 / 승격 칩의 전체 필터 미중복 / Apply 배치 필터 / 필터 시 뷰포트 자동 이동 / 적용 필터 오버뷰 누락("이 동네엔 없다" 오판 유발) |
| 지도 | 스크롤 페이지 중간 임베디드 지도 / 진입 즉시 위치 권한 요청 / **지도 렌더링 결함 방치** |
| 시트 | 모달 시트로 지도 차단 / 시트 중첩 / X 없는 스와이프 단독 의존 |
| 데스크톱 | 가로 스크롤 칩 이식 |
| 콘텐츠 | 초기 소셜프루프 흉내("N명 보는중") |
| SEO | 지도 SPA 단독 SEO 기대 |

지도·필터·시트 항목이 실제로 어떻게 지켜지는지는 [map design](../map/design.md).
