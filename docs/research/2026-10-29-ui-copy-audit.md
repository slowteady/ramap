---
status: 유효
date: 2026-10-29
---

# 화면 문구·배치 전수 점검 (ui.md 기준)

`.claude/rules/ui.md`(토스 기준) 도입 직후 main(b0aa32a) 전 화면을 4개 영역으로 나눠 읽기만 하고 점검한 결과. 🔴 ui.md·project.md 명시 규칙 위반 43건, 🟡 개선 권장 95건(반복 패턴은 대표 1행). 용어 기준은 `.claude/rules/project.md` 화면 절의 용어표를 따른다.

## 화면 문구·배치 점검 — 홈 지도·목록·검색·필터·카드 + 공용 UI

기준: `.claude/rules/ui.md`(토스 기준), `.claude/rules/project.md` 화면 절, `ramap-ui` 스킬. 코드는 고치지 않았고 읽기만 했다(main, 2026-10-29).
범위: `src/views/home/**`, `src/entities/shop/ui/**`, `src/shared/ui/**`, `src/shared/lib/og-card.tsx`, `src/app/layout.tsx`·`page.tsx`·`opengraph-image.tsx`, 문구 공급 `.ts`(`entities/shop/model/taxonomy.ts`·`derive.ts`, `views/home/model/filter-axes.ts`). 홈 화면에 함께 그려지는 `features/records/ui/record-buttons.tsx`, `shared/map/kakao-adapter.ts`(마커)는 배치 판단에 필요한 만큼만 함께 봤다.

### 요약

- **🔴 위반 9건 / 🟡 개선 권장 18건** (반복 패턴은 대표 1행으로 묶음)
- 영향이 가장 큰 3가지
  1. **본문 크기 16px 미만이 전역 기본값** — `text-body` 토큰 자체가 15px이고, 홈 범위에서 13px(`text-secondary`) 28곳·11px(`text-caption`) 9곳이 본문·버튼·메타 정보에 쓰인다. 지도 마커는 13·12·9px 인라인이다. 토큰 한 줄만 고쳐도 전 화면이 바뀌므로 파급이 가장 크다.
  2. **한 화면에 채운 주 버튼이 2개** — 홈 상단 "라멘집 등록"(빨강 채움)이 늘 떠 있는 상태에서, 매장 카드를 열면 "완식"(빨강 채움)이 하나 더 생긴다. 두 버튼 모두 13px이라 "버튼은 한눈에" 규칙에도 걸린다.
  3. **빈 결과·에러 문구가 부정형이고 해결책이 없다** — "검색 결과가 없어요", "조건에 맞는 매장이 없어요", "위치 권한이 없어 현위치를 표시할 수 없어요". 특히 현위치 토스트는 시간 초과·미지원 같은 다른 실패에도 똑같이 "권한이 없어"라고 말해서 이유가 틀릴 수 있다.

### 확인한 토스 원문 근거

| 출처 | 원문 인용 |
|---|---|
| 앱인토스 UX 가이드 — https://developers-apps-in-toss.toss.im/design/consumer-ux-guide.md | "제품 안의 모든 문구는 '해요체'로 써요." / "모바일 화면의 좁은 공간을 고려, '되어요'는 모두 '돼요'로 통일해서 써주세요." |
| 〃 | "제품 안에서 부정적 커뮤니케이션을 최대한 줄이고 긍정형 문장을 써주세요. 예 : 안 돼요, 없어요 (X) → ~하면 할 수 있어요 (O)" |
| 〃 | "다이얼로그 왼쪽 버튼은 닫기로 문구를 통일해요. 취소는 사용자가 하고 있는 작업이 취소된다고 오해할 수 있어 쓰지 않아요." / "'~시겠어요?', '시나요?', '~께' 같은 과도한 경어를 쓰지 않아요." |
| 〃 | "'{명사} + {명사}' 쓰지 않기 … 한자어 명사를 풀어서 동사 형태로 쓸 수 있어요." / "특별한 이유가 없다면 한글로 작성해 주세요. 예를 들면 '토스'는 가능하지만 'Toss'는 권장하지 않아요." |
| 〃 | "CTA는 사용자가 다음에 무엇을 하게 되는지 명확하게 알려주는 장치예요." / "CTA 위에 과장되거나 중복된 보조 설명을 함께 노출하면 버튼의 역할이 흐려지고…" |
| 토스 8가지 라이팅 원칙 — https://toss.tech/article/8-writing-principles-of-toss | "한 화면 안에서 똑같은 말을 불필요하게 반복해서 쓰지 않는 거죠." / "공간이 비어보인다거나, 뭔가 허전한 느낌이 든다는 이유로 의미 없는 문구를 쓰는 것도 피해야 하고요." |
| 〃 | "일상에서 구두로 쓰이지 않는 단어나 금융, IT 업계에서만 쓰이는 전문 용어를 최대한 줄여, 별도의 학습 없이도 이해할 수 있게…" / "다음 화면을 예상할 수 있는 문장을 씁니다." |
| 좋은 에러 메시지 6원칙 — https://toss.tech/article/21021 | 좋은 에러 메시지에는 "그것이 왜 발생했는지(이유)", "해결하려면 어떻게 해야하는지(해결책)"가 들어가야 해요. / "사용자가 스스로 에러를 해결할 수 있도록 해결책을 알려줘야 해요. 에러 메시지의 궁극적인 역할이자, 원칙들 중 가장 중요한 내용" |
| 〃 | "개발자만 읽을 수 있는 코드로 된 에러나, IT 업계 용어로 이뤄진 에러도 마찬가지예요." / "토스트는 3~5초 사이에 사라지는 컴포넌트인데, 너무 많은 내용이 담겨있죠." |
| TDS Mobile — https://tossmini-docs.toss.im/tds-mobile/llms-full.txt | Button: "`fill` variant는 … 주요 액션을 강조하는 데 적합해요." / "`weak` variant는 … 덜 중요한 액션이나 보조적인 버튼에 적합해요. 이 variant를 사용하면 주요 액션과 보조 액션을 명확히 구분할 수 있죠." |
| 〃 | 타이포 매핑: "size 13: t7 / size 15: t6 / size 17: t5", 기본값 `@default 't5'`(17). BottomCTA.Double은 왼쪽 `variant="weak"` + 오른쪽 채움. |

참고: 앱인토스 UX 가이드에는 본문 px 기준이나 "주 버튼 1개" 규정이 명시돼 있지 않다. 16px·주 버튼 1개는 ui.md 자체 규칙이고, TDS에서 확인한 것은 fill=주요/weak=보조 구분과 t5(17px) 기본값까지다. 바텀시트·토스트의 문구 규칙은 TDS 문서에서 찾지 못했다.

### 점검표

| 등급 | 파일:줄 | 규칙 | 현재 | 제안 |
|---|---|---|---|---|
| 🔴 | `src/app/globals.css:36-38` (전역 대표) | 본문 16px 미만 금지 | `--text-body: 15px`, `--text-secondary: 13px`, `--text-caption: 11px`. 홈 범위 tsx에서 `text-secondary` 28곳·`text-caption` 9곳이 본문·메타·버튼에 쓰임(src 전체는 106·39곳). 마커 인라인 `kakao-adapter.ts:106` 13px·`:130` 12px·`:113` 9px, sonner 토스트 기본 13px | `--text-body`를 16px 이상으로(TDS 기본 t5=17px). 13px는 거리·지역 같은 메타 한 줄에만, 11px는 배지에만. 마커 라벨 13→15px, NEW 배지 9px는 없애거나 11px 이상 |
| 🔴 | `src/views/home/ui/shop-map.tsx:96` + `src/features/records/ui/record-buttons.tsx:35` | 한 화면 주 버튼(채운 버튼) 1개 | 홈에 "라멘집 등록"(`bg-ramen` 채움)이 늘 떠 있고, 매장 카드를 열면 "완식"(`bg-ramen` 채움)이 같은 화면에 하나 더 생김 | 카드가 열린 화면의 주 버튼은 "완식" 하나로. "라멘집 등록"은 보조(흰 바탕+테두리 또는 TDS weak 톤)로 내리기 |
| 🔴 | `src/views/home/ui/filter-chips.tsx:52`, `:66`, `src/views/home/ui/shop-map.tsx:96` | 같은 줄 조작 요소 높이 맞춤 | 필터 줄(`items-center`라 늘어나지 않음): 초기화 아이콘 `size-8`=32px, 칩=13px×줄높이 1.5+`py-1.5`+테두리≈33.5px, "라멘집 등록"=테두리 없이≈31.5px. 빌드 CSS에서 `.text-secondary{font-size:…}`만 있고 줄높이가 없어 1.5를 물려받음(계산값이고 실측은 아님) | 세 요소에 같은 높이(`h-8`이나 `h-9`)를 직접 주기 |
| 🔴 | `src/views/home/ui/shop-map.tsx:110` | 해요체 | "지도를 불러오는 중" | "지도를 불러오고 있어요" |
| 🔴 | `src/views/home/ui/shop-map.tsx:121` | 에러 문구(무슨 일·왜·어떻게), 긍정형 | "위치 권한이 없어 현위치를 표시할 수 없어요" — 부정형이고 해결책이 없음. `use-shop-map.ts:190-205`는 미지원·시간 초과·거부를 모두 이 문구로 보내서 "권한이 없어"가 틀린 이유일 수 있음 | 거부: "위치 접근을 허용하면 내 주변 라멘집을 볼 수 있어요"(가능하면 설정 방법 안내). 그 밖의 실패: "내 위치를 찾지 못했어요. 잠시 뒤에 다시 눌러 주세요". 실패 종류(`error.code`)로 나누기 |
| 🔴 | `src/views/home/ui/shop-sheet.tsx:308-309` | 긍정형, 설명은 한 줄 | "이 지역에 조건에 맞는 매장이 없어요. 지도를 움직이거나 필터를 풀어보세요." (두 문장, 부정형, 회색 13px) | "지도를 옮기거나 필터를 줄이면 라멘집을 더 볼 수 있어요" 한 줄 |
| 🔴 | `src/views/home/ui/search-overlay.tsx:244-254` | 긍정형, 회색 보조 설명 줄 금지(project.md), 한 화면 중복 | 제목 "검색 결과가 없어요" + 회색 줄 "찾는 라멘집이 라맵에 없다면 알려주세요" + 버튼 "라멘집 등록하기" — 회색 줄과 버튼이 같은 말을 되풀이함 | 제목 "찾는 라멘집을 알려주세요"(또는 "'{검색어}'를 아직 몰라요"보다 긍정형으로), 회색 줄은 빼고 버튼만 남기기 |
| 🔴 | `src/views/home/model/filter-axes.ts:21-22, 28-29, 35-36` → `filter-sheet.tsx:147`·`:155` | 한 화면에서 같은 말 반복 금지 | 필터 시트 탭이 "종류/국물/스타일"이고 바로 아래 제목도 같은 "종류"(`title`과 `sheetTitle`이 같은 값) | 제목은 화면에서 숨기고(`sr-only`, 접근성 이름은 유지) 도움말 아이콘을 탭 줄로 옮기거나, 제목을 다른 정보로 바꾸기(예: "고른 종류 2개") |
| 🔴 | `src/entities/shop/model/taxonomy.ts:22-92` (필터 시트 도움말 `filter-sheet.tsx:179-189`에 노출) | 업계 용어는 풀어 쓰기 | 장르 이름은 도메인 용어라 괜찮지만, 그 설명에 다시 업계 용어를 씀: "백탁 국물", "간장 다레", "건어물 다시", "라유", "클래식한", "이탈리안 퓨전", "볼륨 계열", "요코하마 계열" 외 다수 | "돼지뼈를 오래 끓여 뽀얗고 진한 국물", "간장으로 맛을 낸 맑은 국물", "멸치·정어리로 우린 쌉싸름한 국물", "고추기름" 등 일상어로 |
| 🟡 | `src/views/home/ui/shop-sheet.tsx:280`, `filter-sheet.tsx:231` | 사용자의 말로, 같은 대상은 같은 말로 | 같은 홈 화면에서 "매장"(목록·필터 버튼), "라멘집"(등록 버튼·검색), "집"(안 가본 집), "곳"(저장한 곳)이 섞임. "매장"은 공급자 쪽 말 | "라멘집" 하나로 통일: "이 지역 라멘집 12곳", "라멘집 12곳 보기" |
| 🟡 | `src/entities/shop/ui/new-chip.tsx:12` 외 3곳(`shared/map/kakao-adapter.ts:111` 마커 9px, `views/home/ui/filter-chips.tsx:91` "새로 오픈", `views/home/ui/shop-sheet.tsx:53` "M/D 오픈") | 영어 대신 한글, 한 화면 용어 통일 | 같은 개념에 배지 "NEW", 필터 칩 "새로 오픈", 메타 "10/3 오픈"이 함께 나옴 | 하나로 통일: 배지 "새로", 칩 "새로 연 곳", 메타 "10/3 개업" |
| 🟡 | `src/views/home/ui/filter-sheet.tsx:225` 외 2곳(`filter-chips.tsx:50` aria "필터 초기화", `search-overlay.tsx:162` "전체 삭제") | 한자어 명사 나열 대신 동사, 같은 동작은 같은 말로 | 지우는 동작 하나에 "초기화"·"전체 삭제"·"지우기"(`search-overlay.tsx:119`)가 섞임 | "모두 지우기"로 통일(aria도 "필터 모두 지우기") |
| 🟡 | `src/entities/shop/ui/open-status-badge.tsx:42` | 업계 용어·영어 차용 | "브레이크 15:00-17:00" | "쉬는 시간 15:00-17:00" |
| 🟡 | `src/entities/shop/model/taxonomy.ts:103`, `:112`, `:111` | 한자어 명사 나열·영어 차용 | 편의 배지·특성 칩 "본토직영", "원격 웨이팅", "카에다마"(라멘 문화 용어라 도메인 예외로 볼 수도 있음) | "일본 본점 직영", "앱으로 줄서기", "면 추가(카에다마)" — 카에다마는 PO가 판단 |
| 🟡 | `src/views/home/ui/map-fallback.tsx:22` | 에러 문구(왜·어떻게), 한 줄 | "지도를 불러오지 못했어요. 목록으로 보여드릴게요." — 무슨 일은 있지만 다시 시도할 방법이 없고 두 문장 | "지도를 불러오지 못해 목록으로 보여 줘요" + 다시 시도 버튼(누르면 새로고침) |
| 🟡 | `src/views/home/ui/shop-map.tsx:98` ↔ `search-overlay.tsx:254` | 버튼은 결과 동사, 같은 동작은 같은 말로 | 같은 등록 화면을 여는 버튼이 "라멘집 등록"(명사)과 "라멘집 등록하기"(동사)로 다름 | "라멘집 등록하기"로 통일(좁으면 "등록하기") |
| 🟡 | `src/views/home/ui/shop-map.tsx:128` | 결과를 알 수 있는 말, 띄어쓰기 | "내주변" | "내 위치"(누르면 지도가 내 위치로 이동) |
| 🟡 | `src/views/home/ui/shop-sheet.tsx:187` | 다음 화면 예상(Predictable hint) | "길찾기 ›" — 누르면 카카오맵 새 창으로 나가는데 문구로는 알 수 없음 | "카카오맵 길찾기" 또는 외부 이동 아이콘(`ExternalLink`) |
| 🟡 | `src/views/home/ui/auth-entry.tsx:14` | 사용자의 말(영어 차용) | aria-label "마이"(페이지 제목 `app/me/page.tsx:6`도 "마이") | "내 기록" — 페이지 제목과 함께 바꾸기 |
| 🟡 | `src/views/home/ui/filter-sheet.tsx:205-213` | aria도 대상 — 결과 동사 | 고른 값 칩(X 아이콘)의 접근성 이름이 값 이름뿐("돈코츠")이라 누르면 빠진다는 걸 알 수 없음 | `aria-label="돈코츠 빼기"` |
| 🟡 | `src/shared/map/kakao-adapter.ts:131-139` | aria도 대상 — 의미 있는 말 | 지역 묶음 마커의 이름이 "강남12"(숫자 단위 없음, aria-label 없음) | `aria-label="강남 12곳"` |
| 🟡 | `src/views/home/ui/shop-map.tsx:96`·`:125`, `src/features/records/ui/record-buttons.tsx:35`·`:44`, `shop-sheet.tsx:185` | 버튼은 한눈에 들어오게 키우기 | "라멘집 등록"·"내주변"·"완식"·"저장"·"길찾기" 버튼 글자가 모두 13px | 버튼 글자는 `text-body` 이상(토큰을 16~17px로 올린 뒤) |
| 🟡 | `src/views/home/ui/filter-chips.tsx:121` | 긍정형(약하게 적용) | 토글 칩 "안 가본 집" | "아직 안 간 곳"도 부정형이라 바꿀 이득이 작음. 용어 통일만 할 때 "안 가본 곳" |
| 🟡 | `src/app/layout.tsx:14` | 의미 없는 말, 한자어+영어 나열 | 메타 설명 "라멘집 찾을 때 필요한 모든 정보. … 신규 오픈 소식까지 …" | "필요한 모든 정보"는 빼고 "새로 연 라멘집까지" |
| 🟡 | `src/app/layout.tsx:10` ↔ `src/app/opengraph-image.tsx:3` | 같은 말로 통일 | 기본 제목 "라맵 — 라멘 맛집 지도"와 OG 대체 텍스트 "라맵 — 한국 라멘을 장르로 찾는 지도"의 소개 문구가 다름 | 한 문구로 통일(서비스 정의인 "장르로 찾는 라멘 지도" 쪽) |
| 🟡 | `src/views/home/ui/filter-chips.tsx:52`, `filter-sheet.tsx:159`, `search-overlay.tsx:117-121`·`:157-160`·`:175-179` | 터치 영역 44px(project.md 리뷰 기준) | 필터 초기화 32px, 도움말 아이콘 16px, 검색어 지우기 20px, "전체 삭제" 11px 글자 버튼, 최근 검색 X 약 28px | 시각 크기는 두고 패딩·음수 마진으로 44px 확보(`search-bar.tsx:14` 방식) |
| 🟡 | `src/views/home/ui/filter-sheet.tsx:172-176` | aria도 대상 | 도움말 바깥 투명 백드롭 버튼 aria "설명 닫기" — 문구는 맞음. 다만 백드롭이 탭 순서에 들어감 | `tabIndex={-1}`(문구 문제는 아님, 참고) |

### 참고 (사용자에게 지금 보이지 않음)

- `src/shared/ui/dialog.tsx:78`·`:117` — shadcn 기본 영어 "Close"(sr-only·버튼). 지금은 쓰는 곳이 없어서 보이지 않는다. 쓰기 시작하면 "닫기"로 바꿔야 한다(토스: 닫는 버튼은 "닫기").
- `src/shared/map/kakao-loader.ts:12`·`:25` 오류 원문("카카오맵 SDK 로드 실패")은 화면에 나오지 않고, 화면에는 `map-fallback.tsx` 안내만 나온다. 원문 노출 없음.
- 문제없는 것: 바텀시트 닫기 aria "닫기"(`drawer.tsx:73`), 검색 닫기 aria "닫기", "뒤로가기", 이탈 확인 "나가기/계속 쓰기"(결과 동사), "카카오로 계속하기", "매장 N곳 보기"(결과 동사 — 용어만 통일), 필터 시트는 고르는 칸이 적용 버튼보다 위. 결과가 바로 보이는 확인 토스트는 홈에 없다(project.md 준수).

## UI 문구·배치 점검 — 매장 상세·랜딩 (main @ b0aa32a, 2026-10-29)

범위: `src/views/{shop-detail,area-list,style-landing,genre-guide,legal}/**`, `src/app/{shop,area,style,guide,terms,privacy}/**`, 그리고 이 화면들에 문구를 공급하는 `.ts`·`.tsx`(`entities/shop/model/guide-content.ts`·`taxonomy.ts`, `entities/shop/ui/new-chip.tsx`, `views/legal/model/legal-content.ts`). 상세의 완식 버튼·기록 섹션(`record-log-section.tsx`, `RecordCtaBar`, `VisitSummaryLine`)은 제외했습니다. 코드는 고치지 않았습니다.

### 요약

- 🔴 16건 (반복을 합치면 원래 약 70곳) / 🟡 33건
- 영향이 큰 3가지
  1. **법률 문서 사실 오류 3건**: 이용약관과 개인정보 처리방침이 이미 폐기된 기능을 약속하고 있습니다. "기록 내려받기"는 a47060f(2026-09-01)에서 JSON 내보내기를 폐기했고, "온보딩 여부 저장"은 dfd9beb(2026-09-01)에서 온보딩을 폐기했습니다. 법적으로 고지한 내용이 실제와 다른 상태입니다.
  2. **장르 가이드 본문(SEO 랜딩의 핵심 콘텐츠)**: 22줄이 합니다체이고, 22줄에 일본어·한자 원문(中華そば, あっさり, ニンニク·ヤサイ·アブラ·カラメ, 直系/資本系 등)이 번역 없이 들어 있습니다. 저가수면·콧테리·극태 평타면 같은 업계 용어도 풀어 쓰지 않았습니다.
  3. **매장 상세 정보 영역**: 영어 라벨("SNS", "NEW"), 한자어 명사 라벨("정보 확인")이 있고, 영업시간이 한 화면에 두 번 나옵니다. 지도·길찾기·공유 액션 버튼 라벨은 11px입니다.

### 확인한 토스 원문 근거

- 해요체·능동형·긍정형·한자어 풀기·과한 경어·닫기: "제품 안의 모든 문구는 '해요체'로 써요." / "**한자어 명사를 풀어서 동사 형태로 쓸 수 있어요.**" / "'~시겠어요?', '시나요?' 같은 과도한 경어를 쓰지 않아요." / "다이얼로그 왼쪽 버튼은 **닫기**로 문구를 통일해요." / "CTA는 사용자가 다음에 무엇을 하게 되는지 명확하게 알려주는 장치예요." — https://developers-apps-in-toss.toss.im/design/consumer-ux-guide.md
- 8가지 원칙: "Remove empty sentences — 의미 없는 문장을 모두 제거했는가?" / "Easy to speak — 이해하기 어려운 용어나 표현을 사용하지 않았는가?" / "Universal words — 모두가 이해할 수 있고 모두에게 무해한가?" / "Predictable hint — 다음 화면을 예상할 수 있는 힌트가 있는가?" — https://toss.tech/article/8-writing-principles-of-toss
- 에러 메시지: "사용자가 스스로 에러를 해결할 수 있도록 해결책을 알려줘야 해요" / "공급자가 아닌 사용자의 입장에서 해결책을 전달하는 것도 중요해요" — https://toss.tech/article/21021
- 글자 크기와 주 버튼 개수는 consumer-ux-guide 원문에서 찾지 못했습니다. 이 두 항목은 `.claude/rules/ui.md`만 근거로 썼습니다.

### 점검표

| 등급 | 파일:줄 | 규칙 | 현재 | 제안 |
|---|---|---|---|---|
| 🔴 | src/views/legal/model/legal-content.ts:46 | 사실 오류(폐기된 기능) | 약관 제6조 "서비스를 종료할 경우 30일 전에 … 공지하며, 회원은 기록을 내려받을 수 있습니다." — JSON 내보내기는 a47060f(2026-09-01)에서 폐기했고, 지금 코드에는 내려받기·export가 없음 | 내려받기 문구를 빼거나, 종료 시 제공할 실제 방법(요청하면 이메일로 보내 주는 등)으로 바꾸기. 법적 검토 후 약관 버전 갱신 |
| 🔴 | src/views/legal/model/legal-content.ts:171 | 사실 오류(폐기된 기능) | 방침 11항 "기록은 마이 페이지에서 직접 내려받을 수 있으며" — /me에 내려받기 기능 없음 | "열람·정정·삭제 요청은 아래 연락처로 받으며…"처럼 실제 행사 방법만 남기기 |
| 🔴 | src/views/legal/model/legal-content.ts:140 | 사실 오류(폐기된 기능) | 방침 6항 "로그인 세션과 온보딩 여부는 브라우저 로컬 저장소에 저장되며" — 온보딩은 dfd9beb(2026-09-01)에서 폐기 | "온보딩 여부"를 빼고, 실제로 저장하는 항목(로그인 세션, 최근 검색어 등)으로 맞추기 |
| 🔴 | src/entities/shop/model/guide-content.ts:23 외 21줄(24·31·54·64·87·116·125·144·153·172·181·200·227·228·237·256·257·266·285·286·294) | 해요체 | 가이드 본문 intro·boundary가 "…계열입니다", "…시작됐습니다", "…불립니다" | "…계열이에요", "…시작됐어요", "…불려요" |
| 🔴 | src/entities/shop/model/guide-content.ts:23 외 21줄(24·26·58·87·91·119·147·172·175·202·205·227·228·231·237·256·260·266·285·286·294) | 사용자의 말(외국어 원문) | "中華そば", "왕도계(あっさり)", "泡系", "콜(ニンニク·ヤサイ·アブラ·カラメ)", "直系와 체인형 資本系", "インスパイア系", "煮豚", "芝麻醤", "花椒", "吉村家", "四川飯店의 陳建民" 등을 번역 없이 표기 | 한국어 음역과 뜻을 먼저 쓰고 원어는 필요할 때만 괄호로: "주카소바(중화소바)", "마늘·야채·기름·간장 추가 콜", "직계·자본계", "요시무라야(吉村家)" |
| 🔴 | src/entities/shop/model/guide-content.ts:54 외 5곳(150·178·205·256·285) | 사용자의 말(업계 용어) | "가는 저가수면", "고가수 중태 곱슬면", "'일본에서 가장 콧테리'", "극태 평타면", "중태 스트레이트면", "유화된 백탁 국물" | "수분이 적어 단단한 가는 면", "중간 굵기 꼬불꼬불한 면", "일본에서 가장 진하다고", "아주 굵고 납작한 면", "뽀얗게 우러난 국물" |
| 🔴 | src/views/area-list/ui/area-list-page.tsx:100 외 1곳(102) | 해요체 · 한 화면 중복 | h1 "{지역} 라멘 맛집 N곳" 바로 아래 "{지역}의 라멘집을 한 곳에 모았습니다." / "…내는 집만 모았습니다." | 설명 문장은 지우고 국물 분포("돈코츠 5곳 · 쇼유 3곳")만 남기기. 남긴다면 "모았어요" |
| 🔴 | src/views/area-list/ui/area-list-page.tsx:62 | 해요체 | FAQ 답(화면과 JSON-LD) "`${genreDescription}입니다.`" | 받침에 따라 "~이에요/~예요"로 바꾸기(es-hangul `josa` 이미 import돼 있음) |
| 🔴 | src/app/shop/[slug]/page.tsx:42 | 해요체 | 메타 설명(검색 결과·공유 카드) "폐업한 매장입니다(2026년 3월). " / "이전한 매장입니다" | "2026년 3월에 문을 닫았어요. " / "2026년 3월에 이전했어요. " |
| 🔴 | src/app/guide/page.tsx:7 | 해요체 | 메타 설명 "…첫 주문 가이드를 한눈에 봅니다." | "…장르별 특징을 한눈에 볼 수 있어요." (아래 🟡 '첫 주문' 행 참고) |
| 🔴 | src/views/shop-detail/ui/shop-detail-page.tsx:56 | 사용자의 말(영어 약어) | 정보 행 라벨 "SNS" | "인스타그램"(값은 "@핸들 ↗"로) |
| 🔴 | src/views/shop-detail/ui/shop-detail-page.tsx:132 | 한자어 명사 나열 | 라벨 "정보 확인" + 날짜. 버튼 문구처럼 읽힘 | "확인한 날" 또는 값을 "2026.10.1에 확인했어요"로 |
| 🔴 | src/entities/shop/ui/new-chip.tsx:12 (상세 h1 shop-detail-page.tsx:261, 외 마커·목록·카드) | 사용자의 말(영어) | 배지 "NEW". 코드 주석이 근거로 든 레퍼런스도 한국어("새로오픈"·"신규") | "신규" 또는 "새로 열었어요"(한 단어 배지라면 "신규") |
| 🔴 | src/views/shop-detail/ui/shop-detail-page.tsx:279 ↔ 51–53 | 한 화면에서 같은 말 반복 | 헤더 `OpenStatusBadge`가 "11:00-21:00 · 브레이크 15:00-17:00 · 월 휴무"를 보여 주고, 바로 아래 정보 행 영업시간·브레이크·휴무가 같은 값을 반복 | 둘 중 하나만 남기기. 헤더는 오늘 기준 한 줄(휴무 강조)만, 행은 상세값만 두거나, 정보 행 3줄을 지우기 |
| 🔴 | src/views/shop-detail/ui/detail-actions.tsx:17 | 버튼은 한눈에 들어오게 | 지도·길찾기·공유 버튼 라벨이 `text-caption`(11px) | 최소 `text-secondary`(13px), 권장 `text-body` |
| 🔴 | src/views/shop-detail/ui/detail-actions.tsx:44 외 1곳(56) | 버튼은 결과 동사 | "지도"(실제로는 이 매장이 선택된 지도로 이동), "공유" | "지도에서 보기", "공유하기"(아이콘 행 폭이 좁으면 "지도 보기") |
| 🟡 | src/views/legal/model/legal-content.ts:23 외 1곳(188) | 사실 확인 필요 | "중요한 변경은 재동의를 받습니다" — 코드의 `needsConsent`는 `agreed_at === null`만 확인(features/auth/model/use-profile.ts:80). 버전이 바뀌어도 재동의를 받는 로직이 없고, 2026-10-27 개정(PostHog 국외 이전 추가) 때 재동의를 받았는지 코드로는 확인할 수 없음 | 운영상 재동의 절차가 있었는지 확인하기. 없다면 문구를 고치거나 버전 비교 로직 추가를 검토 |
| 🟡 | src/views/legal/model/legal-content.ts:138–140 | 사실 누락(확인 필요) | 저장소 항목에 최근 검색어 로컬 저장(views/home/model/use-recent-searches.ts:22)이 빠져 있음 | 개인정보에 해당하는지 판단한 뒤 6항에 추가 |
| 🟡 | src/views/legal/model/legal-content.ts 전체 | 해요체(법률 문서 예외) | 합니다체 | 법적 정확성이 우선이라 유지해도 됨. 바꾼다면 시행일을 함께 갱신 |
| 🟡 | src/views/legal/ui/legal-page.tsx:16–24 | ramap-ui 2뎁스 헤더 | 자체 헤더가 항상 `/`로 이동하고 aria-label은 "지도로 돌아가기". 설정에서 들어와도 설정으로 돌아가지 못함 | `shared/ui/page-header`(이력이 있으면 뒤로, aria "뒤로가기")로 바꾸기 |
| 🟡 | src/views/legal/ui/legal-page.tsx:36 | 작은 글자 | 약관·방침 본문 전체가 `text-secondary`(13px) + gray-500 | 본문은 `text-body` + ink 계열 |
| 🟡 | src/views/shop-detail/ui/shop-detail-page.tsx:351 | 과한 경어 | 섹션 제목 "오시는 길" | "위치" 또는 "찾아가는 길" |
| 🟡 | src/views/shop-detail/ui/shop-detail-page.tsx:120 외 1곳(instagram-link.tsx:23) | aria-label | "원격 줄서기 ↗", "인스타그램 ↗". 화살표 기호가 그대로 읽히고 새 창으로 열린다는 안내가 없음 | 기호는 `aria-hidden` 처리하고 aria-label "원격 줄서기 (새 창)" |
| 🟡 | src/views/shop-detail/ui/shop-detail-page.tsx:120 ↔ src/views/area-list/ui/area-list-page.tsx:35 ↔ taxonomy.ts:112 | 같은 말 같은 표기 | 상세 "원격 줄서기" / 목록·분류 "원격 웨이팅" | 한쪽으로 통일("원격 줄서기"가 사용자의 말에 가까움) |
| 🟡 | src/views/shop-detail/ui/shop-detail-page.tsx:92–104 | 라벨과 내용 일치 | "편의" 행에 자가제면·본토직영(trait 계보)이 섞여 들어감 | trait은 "특징" 행으로 나누거나 "스타일" 행에 넣기 |
| 🟡 | src/views/shop-detail/ui/shop-detail-page.tsx:265–277 ↔ 66–88 | 한 화면 중복 | 서브라인 "홍대 \| 니보시, 이에케"와 국물·스타일 행에 같은 장르가 다시 나옴 | 서브라인은 지역만, 장르는 행에만 두거나 그 반대(행에는 세부 "· 진한 맛"만) |
| 🟡 | src/views/shop-detail/ui/shop-detail-page.tsx:129 | 사용자의 말 | 라벨 "오픈" + "2026.3" | "문 연 날" 또는 "개업" |
| 🟡 | src/views/shop-detail/ui/shop-detail-page.tsx:301 | ramap-ui(테두리 대신 여백) | 한 줄 소개 상자 `border border-gray-100` | 테두리를 빼고 배경 틴트나 여백으로 구획 |
| 🟡 | src/views/shop-detail/ui/detail-actions.tsx:34–36 | 에러 문구 | 공유 API가 없어 클립보드 복사로 넘어갔을 때 복사가 실패해도 아무것도 안 보임(취소와 실패가 같은 catch로 묶임) | 클립보드 실패만 따로 잡아 "링크를 복사하지 못했어요. 주소창의 링크를 길게 눌러 복사해 주세요." |
| 🟡 | src/views/shop-detail/ui/detail-actions.tsx:61 | ramap-ui 모달 시트 닫기 | 길찾기 시트에 명시적 닫기 버튼이 없음(`showClose` 미사용) | `<DrawerContent showClose>`(aria "닫기") |
| 🟡 | src/views/shop-detail/ui/photo-gallery.tsx:47 ↔ 90 | aria-label 일관성 | "사진 크게 보기 1" / "사진 1 크게 보기" | "사진 1 크게 보기"로 통일 |
| 🟡 | src/app/shop/[slug]/page.tsx:53 | 의미 없는 공백 | 지역·구가 모두 없으면 제목이 "{이름} —  라멘" | 둘 다 없으면 "{이름} — 라멘"이나 "{이름} | 라맵"으로 분기 |
| 🟡 | src/app/shop/[slug]/opengraph-image.tsx:5 | 대체 텍스트 | 공유 이미지 alt가 모든 매장에서 "라맵 매장 정보" | `generateImageMetadata`로 "{매장 이름} 사진" |
| 🟡 | src/features/report/ui/report-entry-row.tsx:16–18 (상세 하단, 제보 담당과 겹칠 수 있음) | project.md 회색 보조 설명 줄 금지 | "잘못된 정보가 있나요?" 아래 회색 줄 "수정이 필요하거나 폐업한 매장이라면 알려주세요" | 회색 줄을 지우고 제목을 "정보 수정·폐업 알리기"로 |
| 🟡 | src/views/area-list/ui/area-list-page.tsx:94–96 | 작은 글자 · 필요한 것만 | 11px(`text-caption`) gray-400 경로 "라맵 › 홍대 › 니보시". 링크가 아니라 누를 수 없고, 구조화 데이터가 이미 경로를 담고 있음 | 지우거나, 남긴다면 각 단계를 링크로 만들고 13px 이상 |
| 🟡 | src/views/area-list/ui/area-list-page.tsx:88 ↔ 152 (외 genre-guide-page.tsx:50 ↔ 118) | 같은 말 같은 표기 · 반복 | 헤더 "지도로 보기"와 본문 버튼 "지도에서 보기"가 같은 동작인데 표기가 다름 | 표기를 "지도에서 보기"로 통일. 헤더 액션은 본문 버튼이 있는 화면에서 빼는 것도 검토 |
| 🟡 | src/app/area/[area]/page.tsx:62 | Predictable hint | 지역 페이지 `mapHref="/"`라서 "지도로 보기"를 눌러도 그 지역이 아니라 기본 지도가 열림 | 지역 중심 좌표·필터를 쿼리로 넘기거나, 라벨을 "전체 지도 보기"로 |
| 🟡 | src/views/area-list/ui/area-list-page.tsx:170 | 사실과 맞는 말 | "함께 찾는 지역·장르" — 실제로는 가까운 지역과 같은 지역의 장르 목록이고 검색 데이터가 아님 | "근처 지역·다른 장르" |
| 🟡 | src/views/area-list/ui/area-list-page.tsx:176 외 2곳(style-landing-page.tsx:134·143) + 헤더 텍스트 링크(area-list-page.tsx:86 외 2곳) | 터치 영역 44px | 칩이 `py-1.5` + 13px라 높이 약 32px. 헤더 "지도로 보기" 텍스트 링크에는 여백이 없음 | 칩 `min-h-11`, 헤더 링크에 세로 여백 |
| 🟡 | src/app/area/[area]/page.tsx:30 외 1곳(style-landing-page.tsx:85) | 같은 말 같은 표기 · 사용자의 말 | "스프 계열", 통계 라벨 "스프" ↔ 상세 "국물" | "국물"로 통일 |
| 🟡 | src/views/style-landing/ui/style-landing-page.tsx:62–91 | ramap-ui 금지 패턴(통계 밴드) · 작은 글자 | 제목 위 11px 아이브로우 "스타일", 11px white/50 라벨 "등록 N곳 / 스프 돈코츠 · 쇼유" | 통계 밴드를 지우고 h1 아래 한 줄 "전국 N곳 · 주로 돈코츠쇼유"로 |
| 🟡 | src/views/style-landing/ui/style-landing-page.tsx:96–99 | 긍정형 · 경어 · 에러/빈 상태 해결책 | "아직 등록된 {스타일} 매장이 없어요. 알고 계신 곳이 있다면 제보해 주세요." 제보하라는 말만 있고 버튼이 없음 | "{스타일} 매장을 알면 알려주세요" + "매장 알리기" 버튼(제보 시트로 연결) |
| 🟡 | src/views/style-landing/ui/style-landing-page.tsx:136 | 어색한 표현 | 칩 "{이에케}란? 가이드" | "{이에케} 가이드" |
| 🟡 | src/views/genre-guide/ui/guide-index-page.tsx:29–31 | project.md 회색 보조 설명 줄 금지 | "처음이라면 여기서 취향을 찾아보세요." | 지우기 |
| 🟡 | src/app/guide/page.tsx:7 | 사실과 맞는 말 | "첫 주문 가이드" — 주문 관련 내용은 이에케·지로 2개 가이드에만 있음 | "장르별 특징과 기원" |
| 🟡 | src/views/genre-guide/ui/genre-guide-page.tsx:65 | 굵고 크게(본문 대비) | 가이드 본문 문단 전체가 gray-500 | 주 콘텐츠는 `text-ink` |
| 🟡 | src/entities/shop/model/guide-content.ts:116 | Universal words | "'담백파의 최우익'으로 불립니다" — 정치적 비유 | "가장 담백한 편으로 꼽혀요" |
| 🟡 | src/entities/shop/model/guide-content.ts:286 | 뜻이 불분명 | "小도 일반 라멘의 특성 이상입니다" — '특성'(特盛, 특대)이 '특성(特性)'으로 읽힘 | "가장 작은 사이즈도 보통 라멘 곱빼기보다 많아요" |
| 🟡 | src/entities/shop/model/taxonomy.ts:28 외 1곳(34) ↔ guide-content.ts 전체 | 같은 말 같은 표기 | 분류 설명은 "다레", 가이드는 "타레" | 한쪽으로 통일하고 처음 나올 때 "(양념)"을 붙이기 |

## 화면 문구·배치 점검 — 기록·마이·설정·로그인

범위: `src/features/records/**`, `src/features/auth/**`, `src/views/me/**`, `src/views/settings/**`, `src/views/shop-detail/ui/record-log-section.tsx`, `src/app/me|settings/page.tsx`, 그리고 이 화면에 문구를 공급하는 공용 UI(`shared/ui/discard-dialog.tsx`·`photo-picker.tsx`·`menu-list.tsx`). 코드는 고치지 않았다.

### 요약

- 🔴 7행(9곳) / 🟡 24행
- 가장 큰 문제
  1. 닫는 버튼 [취소] 3곳: 완식 기록 시트, 기록 뷰어의 지우기 확인, 회원탈퇴 시트
  2. 에러 문구 3곳에 "왜"가 빠져 있다. 완식 기록 시트의 "**저장**에 실패했어요"는 도메인 용어 "저장"(북마크)과 겹친다
  3. 수동형·한자어: "탈퇴가 완료됐어요", 버튼 "완식 기록 삭제"
  4. 합쇼체: 약관 동의 체크 문구 "동의합니다"
- 배치: 주 버튼은 화면마다 1개를 지킨다. 같은 줄 버튼 높이도 코드상 모두 같다(시트 h-13·h-13, CTA 바 12·12, 지도 카드 h-11·h-11, 뷰어 확인 h-11·h-11). 다만 완식 기록 시트의 [취소]는 배경 없는 글자 버튼이라, 높이는 같아도 눈에는 버튼으로 보이지 않는다(🟡).
- 특히 작은 글자: `text-caption` = **11px** 11곳(아래 표 1행으로 묶음). 13px(`text-secondary`) 전역 문제는 다른 작업자 범위라 제외했다.

### 판정: 완식 기록 시트 [취소][기록하기]의 [취소]는 '닫기'다

- **동작:** `record-log-sheet.tsx:147` → `requestClose`. 입력이 있으면 이탈 확인을 띄우고, 없으면 시트를 닫는다. 완식은 [기록하기]를 눌러야 확정되므로(`onVisit`은 submit 안에서만 호출), 왼쪽 버튼은 아직 저장되지 않은 시트를 닫을 뿐이고 이미 한 일을 되돌리지 않는다.
- **토스 기준:** 이런 왼쪽 버튼은 **[닫기]로 통일**한다. 이유도 원문에 있다. "취소는 사용자가 하고 있는 작업이 취소된다고 오해할 수 있어 쓰지 않아요." TDS BottomSheet `DoubleCTA` 예시도 왼쪽이 `variant="weak"` "닫기", 오른쪽이 "확인"이다.
- **라맵에서 오해가 생기는 지점:** 제목이 "3번째 완식"일 때 [취소]는 "이미 쌓인 완식을 취소한다"로 읽힐 수 있다. 토스가 경고한 오해와 같다.
- **결론:** 🔴 [닫기]로 바꾼다. 같은 이유로 기록 뷰어의 [취소][지우기], 탈퇴 시트의 [취소][탈퇴하기]도 [닫기]로 바꾼다. DiscardDialog의 [나가기][계속 쓰기]는 두 버튼 모두 결과가 드러나는 동사라 그대로 둔다.
- **주의 1:** 이 시트에는 이미 우상단 X(`DrawerContent showClose`, aria-label "닫기")가 있다. 왼쪽 버튼을 "닫기"로 바꾸면 이름이 같은 버튼이 2개가 된다. 화면에서도 중복이고(🟡 아래 표), 테스트 `getByRole("button",{name:"닫기"})`도 둘을 동시에 잡는다. X를 빼거나 하단 버튼만 남기는 쪽으로 정리해야 한다.
- **주의 2:** 바꿀 때 함께 손볼 곳이 있다. 설계 문서 `docs/modules/records/design.md:106`(시트 [취소]), `:176`(뷰어 [취소]), `:187`(탈퇴 [취소])과 테스트 `record-log-sheet.test.tsx:129`(`"취소"`), `me-page.test.tsx:168`(`"완식 기록 삭제"`)다.

### 확인한 토스 원문 근거

| 출처 | 인용 |
|---|---|
| [앱인토스 UX 가이드](https://developers-apps-in-toss.toss.im/design/consumer-ux-guide.md) | "다이얼로그 왼쪽 버튼은 **닫기**로 문구를 통일해요. **취소**는 사용자가 하고 있는 작업이 취소된다고 오해할 수 있어 쓰지 않아요." |
| 같은 문서 | "제품 안에서 최대한 **능동형 문장**을 써주세요." / "`됐어요` → `했어요`" / "'`되어요`'는 모두 '`돼요`'로 통일" / "'`{명사} + {명사}`' 쓰지 않기 … 한자어 명사를 풀어서 동사 형태로" |
| 같은 문서 | "제품 안의 모든 문구는 '해요체'로 써요." / "부정적 커뮤니케이션을 최대한 줄이고 긍정형 문장을 써주세요. 예 : 안 돼요, 없어요 (X) → ~하면 할 수 있어요 (O)" |
| [toss.tech 21021 (에러 메시지)](https://toss.tech/article/21021) | 에러 메시지에는 "지금 사용자가 어떤 상황에 처했는지(상황 설명), 그것이 왜 발생했는지(이유), 해결하려면 어떻게 해야하는지(해결책)"가 들어가야 한다. 또 "토스트는 3~5초 사이에 사라지는 컴포넌트"라서, 설명이 긴 에러는 다이얼로그로 보여 준다 |
| [toss.tech 8가지 라이팅 원칙](https://toss.tech/article/8-writing-principles-of-toss) | 의미 없는 단어·문장 제거, 다음 화면을 예상할 수 있는 힌트, 구어로 쓰지 않는 단어(한자어·전문용어) 줄이기 |
| [TDS Mobile BottomSheet](https://tossmini-docs.toss.im/tds-mobile/components/bottom-sheet/) | "BottomSheet.DoubleCTA 컴포넌트를 사용하면 버튼이 좌우로 나누어진 형태의 CTA도 사용할 수 있어요." 예시는 왼쪽 `variant="weak"` "닫기", 오른쪽 "확인" |
| TDS Mobile Toast | 하단 토스트에만 버튼을 둘 수 있고, 버튼이 있으면 3초 → 5초 |

확인하지 못한 것: TDS 다이얼로그(ConfirmDialog) 문서는 404라 다이얼로그 버튼 문법은 앱인토스 가이드 원문만 근거로 썼다. 카카오 로그인 버튼 문구 규정은 확인하지 않아 판정하지 않았다.

### 표

| 등급 | 파일:줄 | 규칙 | 현재 | 제안 |
|---|---|---|---|---|
| 🔴 | src/features/records/ui/record-log-sheet.tsx:150 외 2곳(src/views/me/ui/record-viewer-sheet.tsx:138, src/views/settings/ui/settings-page.tsx:93) | 닫는 버튼은 "닫기" | 완식 기록 시트 [취소][기록하기] · 뷰어 확인 [취소][지우기] · 탈퇴 시트 [취소][탈퇴하기] | [닫기][기록하기] · [닫기][지우기] · [닫기][탈퇴하기]. 근거는 위 판정 참고. 완식 시트는 X 버튼과 이름이 겹치니 함께 정리 |
| 🔴 | src/features/records/ui/record-log-sheet.tsx:140 | 에러 = 무슨 일·왜·어떻게 / 사용자의 말 | "저장에 실패했어요. 잠시 후 다시 시도해주세요" | "사진을 올리지 못했어요. 인터넷 연결을 확인하고 다시 눌러 주세요" 또는 "…사진을 빼면 완식만 기록할 수 있어요". "저장"은 북마크 기능 이름이라 쓰지 않는다. 실패하면 완식도 기록되지 않는다는 사실이 지금은 전달되지 않는다(design.md:111). 제보 폼의 "사진을 빼거나 다시 시도해 주세요"(`use-report-form.ts:113`)와 맞추면 일관된다 |
| 🔴 | src/features/auth/ui/consent-sheet.tsx:21 | 한자어 명사 이어 붙이기 / 에러에 '왜' | 토스트 "동의 처리에 실패했어요. 잠시 후 다시 시도해 주세요." | "동의하지 못했어요. 인터넷 연결을 확인하고 다시 눌러 주세요" |
| 🔴 | src/views/settings/ui/settings-page.tsx:105 | 에러에 '왜'·'어떻게' | 토스트 "탈퇴에 실패했어요. 잠시 후 다시 시도해 주세요." | "탈퇴하지 못했어요. 인터넷 연결을 확인하고 다시 눌러 주세요". 참고: 사진 파일 삭제(`deleteMyRecordPhotoFiles`)가 성공한 뒤 계정 삭제가 실패하면, 사진은 이미 지워졌는데 계정은 남는다. 이 상태를 알리지 않는다. 토스트 1줄로는 다 담기지 않으므로, 토스 21021 원칙대로 다이얼로그를 검토한다 |
| 🔴 | src/views/settings/ui/settings-page.tsx:109 | 능동형 / 한자어 명사 | 토스트 "탈퇴가 완료됐어요" | "탈퇴했어요" |
| 🔴 | src/features/auth/ui/consent-sheet.tsx:56 | 해요체 | "…에 동의합니다 (필수)" | "…에 동의해요 (필수)" |
| 🔴 | src/views/me/ui/record-viewer-sheet.tsx:155 | 한자어 명사 → 동사 / 버튼은 결과 동사 | 버튼 "완식 기록 삭제" | "완식 기록 지우기". 확인 문구 "지울까요?"와 버튼 [지우기]의 동사와도 맞는다. `me-page.test.tsx:168`도 함께 고친다 |
| 🟡 | src/features/records/ui/record-log-sheet.tsx:145-151 | 같은 줄 조작 요소 높이 맞춤 | [취소]는 배경 없는 글자 버튼(h-13 px-5), [기록하기]는 채운 버튼(h-13 flex-1). 코드상 높이는 같지만 눈에는 버튼 영역이 보이지 않는다 | 탈퇴 시트(`settings-page.tsx:91`)처럼 `bg-gray-050` 보조 버튼으로 바꾼다(TDS DoubleCTA 왼쪽 weak와 같은 문법) |
| 🟡 | src/features/records/ui/record-log-sheet.tsx:78 | 같은 말 되풀이 | 우상단 X(닫기)와 하단 [취소]가 같은 동작 | 하나만 남긴다. [닫기]로 바꾸면 이름도 겹친다. ramap-ui의 "명시적 닫기 버튼 병행"은 하단 [닫기]로 충족된다 |
| 🟡 | src/features/records/ui/record-log-sheet.tsx:150 | 닫는 버튼 통일 | 사진 추가 모드 [다음에][남기기] | [닫기][남기기]. `record-log-sheet.test.tsx:18,32,49`도 함께 |
| 🟡 | src/features/records/ui/record-log-sheet.tsx:171 | 한자어 명사 이어 붙이기 | 이탈 확인 제목 "기록 작성을 그만할까요?" | "기록을 그만 쓸까요?" (본문 "지금 나가면 작성한 내용이 사라져요" → "지금 나가면 쓴 내용이 사라져요"도 같은 결) |
| 🟡 | src/features/records/ui/record-log-sheet.tsx:118-136 | aria | 소개 동의 체크가 `<button>`이라 체크 상태가 화면 읽기 프로그램에 전달되지 않는다 | `role="checkbox"` + `aria-checked={consent}` (또는 네이티브 checkbox) |
| 🟡 | src/shared/ui/photo-picker.tsx:28 외 1곳(:57) | aria / 사용자의 말 | 사진 추가 타일에 접근 이름이 없어 "0/5"만 읽힌다. 사진 빼기 버튼 aria "사진 삭제", 24px(size-6) | 타일 `aria-label="사진 추가"`. 빼기 버튼은 "사진 빼기"(제보 폼 문구와 통일), 터치 영역 44px |
| 🟡 | src/features/records/ui/record-cta-bar.tsx:30 외 1곳(record-buttons.tsx:40) | aria | 저장 토글 aria-label "저장". 켜짐·꺼짐 상태가 색으로만 표현된다 | `aria-pressed={saved}` 추가 |
| 🟡 | src/features/records/ui/record-buttons.tsx:35 외 1곳(:44) | 버튼은 한눈에 들어오게 | 지도 카드 [완식][저장] 버튼 글자 13px(`text-secondary`) | 버튼은 `text-body` 이상 (높이 h-11·h-11은 일치) |
| 🟡 | src/features/records/ui/login-prompt-sheet.tsx:22-25 | 다음을 예상할 수 있는 힌트 / 핵심 메시지 | "라맵과 함께할까요? / 카카오 계정으로 3초 만에 시작해요". 완식·저장을 누른 직후인데 로그인이 왜 필요한지 말하지 않는다 | 보조 줄을 "로그인하면 완식·저장을 기록할 수 있어요"로 바꾼다. 🍜 이모지는 ramap-ui "이모지 아이콘" 금지와 충돌한다. 설계 문서(design.md:197)가 명시한 예외인지 PO 확인이 필요하다 |
| 🟡 | src/features/auth/ui/consent-sheet.tsx:29 | 긍정형 / 한자어 명사 | 제목 "시작하기 전에 동의가 필요해요" | "약관에 동의하면 바로 시작할 수 있어요" |
| 🟡 | src/features/auth/ui/consent-sheet.tsx:39 | 의미 없는 단어 | 체크 항목이 1개뿐인데 라벨이 "전체 동의" | "전체"를 빼고 한 줄로 합친다: "이용약관과 개인정보 처리방침에 동의해요 (필수)" |
| 🟡 | src/features/auth/ui/consent-sheet.tsx:65 | 조작 요소 높이 일관 | [동의하고 시작하기]는 `py-3`(약 46px)·pill. 다른 시트의 주 버튼은 h-13·card-lg | 다른 시트 주 버튼과 같은 h-13으로 맞춘다 |
| 🟡 | src/views/me/ui/me-page.tsx:296-300 | 긍정형 / 사용자의 말 | "아직 완식한 라멘집이 없어요 / 지도에서 완식을 찍으면 여기에 모여요" | "찍으면"은 사진 촬영으로 읽힌다 → "누르면". 두 줄을 한 줄로: "지도에서 완식을 누르면 여기에 모여요" + [지도 보기] |
| 🟡 | src/views/me/ui/me-page.tsx:104 외 3곳(me-page.tsx:298, record-log-section.tsx:124, login-prompt-sheet.tsx:24) | project.md "회색 보조 설명 줄 넣지 않는다" / 설명 최소 | 회색(gray-400·500) 보조 설명 줄 | 꼭 필요한 줄만 남기고 본문색으로 올리거나 지운다. 예: 비로그인 마이는 "로그인하기 ›" 제목에 의미를 담는다 |
| 🟡 | src/views/me/ui/me-page.tsx:157-176 | aria | 완식·저장 탭이 일반 `<button>`이라 선택 상태를 읽어 주지 않는다 | `role="tablist"`/`role="tab"` + `aria-selected` |
| 🟡 | src/views/me/ui/me-page.tsx:236 외 1곳(:287) | 의미 없는 단어 | "기록 더보기 (12)" — 괄호 숫자가 '남은 수'인지 분명하지 않다 | "12개 더 보기" |
| 🟡 | src/views/me/ui/record-viewer-sheet.tsx:78 외 1곳(record-log-section.tsx:107) | 사용자의 말(내부 용어) / 능동형 | 칩 "반려됨" — 운영 내부 용어이자 수동형 | 사용자가 겪는 결과로 쓴다: "나만 보여요" 등 (소개 동의 문구 "매장 페이지에 소개돼도 좋아요"와 짝) |
| 🟡 | src/views/me/ui/record-viewer-sheet.tsx:128 | 같은 말 되풀이 | "완식 N회 기록이 지워져요. 남긴 사진은 그대로 남아요" | "…올린 사진은 그대로 있어요" |
| 🟡 | src/views/shop-detail/ui/record-log-section.tsx:73-78 | 버튼은 결과 동사 / 터치 영역 | 13px 글자 버튼 "📷 남기기"(높이 지정 없음, 44px 미만) | "사진 남기기", `min-h-11` |
| 🟡 | src/views/settings/ui/settings-page.tsx:114 | 한자어 명사 | 진행 라벨 "처리 중…" | "탈퇴하는 중…" (완식 시트 "올리는 중…"과 같은 형식) |
| 🟡 | src/views/settings/ui/settings-page.tsx:81 | 의미 없는 단어 | "정말 탈퇴할까요?" | "탈퇴할까요?" (경고는 본문 "되돌릴 수 없어요"가 이미 담고 있다) |
| 🟡 | src/views/settings/ui/settings-page.tsx:22 | 구어 / 사용자의 말 | 섹션 라벨 "약관 및 정책" | "약관·정책" ("및"은 문어체) |
| 🟡 | src/features/records/ui/record-log-sheet.tsx:113 외 10곳(photo-picker.tsx:30, me-page.tsx:198·263, record-viewer-sheet.tsx:72·77·107, record-log-section.tsx:26·101·106, menu-list.tsx:24) | 본문 16px 아래로 내리지 않기 — 특히 작은 글자 | `text-caption` = 11px: 한줄평 카운터(gray-300으로 대비도 낮음), 사진 n/5, 그리드 상호, 저장일, 검토 중·반려됨 칩, "N번째 완식 · 날짜" 메타, 설정 섹션 라벨 | 최소 13px(전역 조정 때 함께). 카운터 gray-300은 gray-400 이상 |
| 🟡 | src/views/settings/ui/settings-page.tsx:84 외(record-viewer-sheet.tsx:128, record-log-sheet.tsx:140, consent-sheet.tsx:21) | 일관성 | 설명·에러 끝 마침표가 있는 곳과 없는 곳이 섞여 있다. "시도해주세요"와 "시도해 주세요" 띄어쓰기도 섞여 있다 | 한 가지로 통일 |

### 문제없음(확인만)

- 완식 시트 제목 "첫 완식"/"N번째 완식", 플레이스홀더 "한줄평 (사진을 넣으면 쓸 수 있어요)"(긍정형), "매장 페이지에 소개돼도 좋아요", "올리는 중…", DiscardDialog [나가기][계속 쓰기], 뷰어 "완식 기록을 지울까요?", 탈퇴 본문, 설정 메뉴 항목명, 헤더 aria-label("지도로 돌아가기"·"마이로 돌아가기"·"설정"), Drawer X "닫기"
- 주 버튼 1개: 지도 카드, 상세 CTA 바, 완식 시트, 뷰어(평소 [매장 보기]는 보조, 확인 중에는 [지우기]만 채움), 탈퇴 시트, 마이 빈 상태 [지도 보기] 모두 지킨다
- 설정이 동작 버튼 위: 완식 시트에서 사진·한줄평·소개 동의가 [기록하기] 위에 있고, 동의 시트에서 체크가 [동의하고 시작하기] 위에 있다. 둘 다 지킨다
- 확인 토스트 금지(project.md): 완식·저장 직후 토스트 없음. 지킨다

## 화면 문구·배치 점검 — 제보·검수 (report / admin)

범위: `src/features/report/**`, `src/views/admin/**`, `src/app/report|admin/**`, 문구 공급 `.ts`(`use-report-form.ts`, `use-report-submit.ts`, `report-payload.ts`, `report-view.ts`, `undo-toast.ts`), 공용 `shared/ui/discard-dialog.tsx`·`photo-picker.tsx`. 코드는 고치지 않았다.

### 요약

- 🔴 11 / 🟡 20 (사용자 화면 🔴 10·🟡 12, /admin 🔴 1·🟡 8). "회색 보조 설명 줄 금지"는 project.md 규칙이라 같은 🔴로 매김
- 영향이 큰 것: /admin 토스트 조사 오류("반려으로 처리했어요"), 수정 완료 화면 "지도로 돌아가기"가 실제로는 매장 상세에 남음, 에러 문구에 왜·어떻게가 없음, 완료 문구 피동형, 11px 에러·힌트 9곳

### 토스 원문 근거

- "제품 안에서 최대한 능동형 문장을 써주세요." / "과도한 경어를 쓰지 않아요." (`계시다`→`있다`, 다이얼로그 왼쪽 버튼은 [취소] 아닌 [닫기]) / "'{명사} + {명사}' 쓰지 않기" — https://developers-apps-in-toss.toss.im/design/consumer-ux-guide.md
- "다음 화면을 예상할 수 있는 힌트가 있는가?" / "이해하기 어려운 용어나 표현을 사용하지 않았는가?" — https://toss.tech/article/8-writing-principles-of-toss
- 에러 메시지는 "사용자가 다음 화면으로 무엇을 해야 할지 안내" — https://toss.tech/article/21021
- TDS TextField 라벨 "sustain: 항상 라벨이 보여 사용자가 입력 필드의 목적을 항상 명확히 알 수 있도록", hasError+도움말 — https://tossmini-docs.toss.im/tds-mobile/components/TextField/text-field/

### 사용자 화면

| 등급 | 파일:줄 | 규칙 | 현재 | 제안 |
|---|---|---|---|---|
| 🔴 | features/report/ui/new-report-form.tsx:41 | 능동형·명사 나열 | "등록 요청이 접수됐어요" | "등록 요청을 보냈어요". 외 1곳: edit-report-form.tsx:47 "수정 요청이 접수됐어요"→"고칠 내용을 보냈어요" |
| 🔴 | features/report/ui/form-controls.tsx:218 (edit-report-form.tsx:44에서 사용) | 버튼은 결과 동사 | 수정 완료 화면도 "지도로 돌아가기"인데 close()는 매장 상세에 남음 | 라벨을 prop으로. 수정 폼은 "가게 정보로 돌아가기"/"닫기" |
| 🔴 | new-report-form.tsx:138 | 능동형·명사 나열 | "위치 지정됨 · 다시 지정" | "위치를 골랐어요 · 다시 고르기" |
| 🔴 | model/use-report-form.ts:100 | 긍정형·영어 약어 | "링크 형식이 아니에요. 주소창의 URL을 붙여넣어 주세요." | "주소창에 있는 주소를 그대로 붙여넣어 주세요" |
| 🔴 | model/use-report-submit.ts:31 | 명사 나열·약어 | "접수 준비 중이에요. 인스타그램 DM으로 보내주세요." | "지금은 인스타그램 메시지로 보내 주세요. 입력한 내용은 그대로 있어요." |
| 🔴 | model/use-report-submit.ts:32 | 에러(왜·어떻게)·명사 | "전송에 실패했어요. 잠시 후 다시 시도해 주세요." | "보내지 못했어요. 인터넷 연결을 확인하고 다시 보내 주세요." 외 2곳: use-report-form.ts:113·177 사진 업로드 실패 |
| 🔴 | edit-report-form.tsx:155 | 과한 경어 | "알고 계신 내용을 자유롭게 적어주세요" | "아는 내용을 적어 주세요". 외 1곳: new-report-form.tsx:171 |
| 🔴 | ui/pin-picker.tsx:40 | 닫는 버튼은 "닫기" | "취소" | "닫기" |
| 🔴 | edit-report-form.tsx:60-62 | 회색 보조 줄 금지(project.md) | "해당하는 것을 모두 선택해 주세요" | 삭제, 라벨 "무엇이 달라졌나요?". 외 2곳: edit-report-form.tsx:88-90, report-entry-row.tsx:16-18 |
| 🔴 | new-report-form.tsx:52-54 | 같은 말 반복 | 제목 "새 라멘집 등록" + 리드 "아직 라맵에 없는 라멘집을 알려주세요." | 리드 삭제 |
| 🔴 | form-controls.tsx:37 | 작은 글자(11px) | 필드 에러 text-caption | 13px 이상. 외 8곳: form-controls:39, new:55·107·112, edit:60·88, pin-picker:63, shared/ui/photo-picker.tsx:30 |
| 🟡 | new-report-form.tsx:55-57 | 필요한 것만 | "* 필수" 범례 + `*` + "(선택)" 이중 표시 | 한 방식만 |
| 🟡 | new-report-form.tsx:87 | aria-label | 링크 입력에 접근 가능한 이름 없음 | label 연결·aria-label. 외 2곳: edit:82, new:168 |
| 🟡 | new-report-form.tsx:176 | 결과 동사 | "등록하기"(실제로는 요청) | "보내기" |
| 🟡 | edit-report-form.tsx:48 | 설명 한 줄 | "라맵이 확인한 뒤 반영해 드려요. 폐업·휴업은 한 번 더 확인해요." | "확인하고 고쳐 둘게요" |
| 🟡 | edit-report-form.tsx:57 | 명사 나열 | "수정 항목" | "무엇이 달라졌나요?" |
| 🟡 | edit-report-form.tsx:151 | 한자어 | "상세 내용" | "더 알려줄 내용" |
| 🟡 | edit-report-form.tsx:85 | placeholder를 라벨로 씀 | "근거 링크 — 인스타 공지, 리뷰 등" | 라벨 "확인할 수 있는 링크(선택)" + placeholder |
| 🟡 | edit-report-form.tsx:109 | 한자어→동사 | "…13,000원으로 인상" | "…13,000원으로 올랐어요" |
| 🟡 | model/report-payload.ts:42 | 의미 없는 말 | "기타" | "다른 게 달라요" |
| 🟡 | edit-report-form.tsx:151-170 | 배치 일관성 | 수정 폼은 상세→사진, 등록 폼은 사진→자유 입력 | 순서 통일 |
| 🟡 | pin-picker.tsx:64 | 필요한 것만 | 좌표 노출 | 숨기기. 외 2곳: pin-picker:72 "이 위치로 지정"→"이 위치로 정하기", new:139 "지도에서 위치 지정"→"…고르기" |
| 🟡 | ui/report-entry-row.tsx:14-18 | 긍정형 | "잘못된 정보가 있나요?" / "…폐업한 매장이라면…" | "정보가 달라졌다면 알려주세요" |
| 🟡 | new-report-form.tsx:146 | 터치 영역 44px | 핀 삭제 X 28px | 44px. 외 3곳: new:100, new:117·128, photo-picker.tsx:59 |

### /admin

| 등급 | 파일:줄 | 규칙 | 현재 | 제안 |
|---|---|---|---|---|
| 🔴 | views/admin/ui/report-card.tsx:103 | 조사 오류·명사형 | "반려으로 처리했어요", "반영함으로 처리했어요" | 결과별 문장: "반영했어요" / "중복으로 닫았어요" / "반려했어요" |
| 🟡 | report-card.tsx:93 | 에러(왜·어떻게) | "처리에 실패했어요" | "처리하지 못했어요. 새로고침하고 다시 눌러 주세요." 외 4곳: report-card:98·110, photo-card:26·34 |
| 🟡 | ui/reject-panel.tsx:54 | 닫는 버튼은 "닫기" | "취소" | "닫기" |
| 🟡 | reject-panel.tsx:62 | 명사 나열 | "반려 확정" | "반려하기" |
| 🟡 | report-card.tsx:300 | 버튼 동사 | "반영함" | "반영하기"(배지는 유지) |
| 🟡 | model/report-view.ts:189 | 한자어 | "N일 경과" | "N일 전" |
| 🟡 | ui/admin-page.tsx:115 | 긍정형 | "검수할 사진이 없어요" | "사진을 모두 확인했어요". 외 1곳: :158 |
| 🟡 | report-card.tsx:160-163 | 일관성 | "같은 제보 N건 더" / "외 N건", 필터 "처리됨" | 표기 통일 |
| 🟡 | report-card.tsx:279 | placeholder에 설명 넣지 않기 | "메모 (반영함·중복과 함께 저장)" | "메모" |
| 🟡 | report-card.tsx:297 | 주 버튼 1개 | 카드마다 채운 버튼. 외 1곳: photo-card:84 | 회색 보조 검토 |
| 🟡 | report-card.tsx:155 | 11px | 메타·배지·경과일. 외 3곳(+ photo-card:60·64) | 13px 이상 |
| 🟡 | model/report-view.ts:171-180 | 사용자 노출 대비 | 반려 사유 칩이 명사·부정형 | #19·#20에서 사용자용 문장으로 매핑. `composeReason`이 칩과 자유 입력을 합쳐 저장하니 칩을 따로 저장하는지 확인 필요 |

지적 없음: report-sheet "닫기" aria-label, discard-dialog [나가기][계속 쓰기], 하단 CTA·핀 확정 바(주 버튼 1개, h-12).

