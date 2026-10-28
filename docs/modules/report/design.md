---
status: 유효
updated: 2026-10-28
---

# report 설계

제보 시트(새 라멘집 등록·정보 수정), 지도 핀 피커, `/admin` 검수(제보·완식 사진)가 지금 어떻게 만들어져 있는지.

## 코드 위치

| 경로 | 역할 |
|---|---|
| `src/features/report/ui/report-sheet.tsx` | 풀스크린 시트 껍데기(헤더·이탈 확인·폼 분기) |
| `src/features/report/ui/new-report-form.tsx` | 새 라멘집 등록 폼 |
| `src/features/report/ui/edit-report-form.tsx` | 정보 수정 폼 |
| `src/features/report/ui/pin-picker.tsx` | 지도 핀 피커 오버레이 |
| `src/features/report/ui/report-entry-row.tsx` | 매장 상세 "잘못된 정보가 있나요?" 행 |
| `src/features/report/ui/form-controls.tsx` | 필드·체크 행·칩 그리드·하단 CTA·완료 화면 |
| `src/features/report/model/report-payload.ts` | 초안 타입, 제출 가능 판정(`canSubmitNew`·`canSubmitEdit`), 페이로드 빌더, 행 변환(`toReportRow`), `isLikelyUrl`, `MAX_LINKS=3`·`MAX_PHOTOS=5` |
| `src/features/report/model/report-query.ts` · `use-report-query.ts` | URL 쿼리 파서·열기/닫기 훅 |
| `src/features/report/model/use-report-form.ts` · `use-report-submit.ts` | 폼 view-model 훅, 제출 단계 |
| `src/features/report/model/report-sink.ts` | `reports` insert |
| `src/features/report/model/photo-upload.ts` | `report-photos` 업로드 |
| `src/features/report/model/report-options.ts` | 수정 폼 장르·편의 선택지 |
| `src/features/report/model/pin-pick.ts` · `use-pin-picker.ts` | 조준점 계산·줌 게이트·좌표 반올림, 피커 훅 |
| `src/app/report/page.tsx` | `/?report=new` 리다이렉트 |
| `src/views/admin/` | `/admin` 페이지, 제보·사진 카드, 반려 패널, 되돌리기 토스트 |
| `src/views/admin/model/admin-api.ts` | 관리자 조회·처리 API |
| `src/views/admin/model/report-view.ts` | 순수 함수: `linkLabel`·`parseDetails`·`groupReports`·`editRows`·`sortGroups`·`ageLabel`·`composeReason`·`toAdminShops`, 반려 사유 칩 |
| `src/app/admin/page.tsx` | 서버에서 `toAdminShops(getShops())`를 내려 현재 값 비교에 사용 |
| `supabase/schema.sql` | `reports`, `report-photos` 버킷, `profiles.role`·`is_admin()`, 관리자 정책 |

## 진입과 URL

| 유형 | 진입점 | URL |
|---|---|---|
| 새 라멘집 등록 | 홈 필터 행 오른쪽 [라멘집 등록](레드 pill), 검색 결과 없음 "찾는 라멘집이 라맵에 없다면 알려주세요" [라멘집 등록하기] | `?report=new` |
| 핀 피커 | 등록 폼의 [지도에서 위치 지정] (홈에서만) | `?report=new&pick=1` |
| 정보 수정 | 매장 상세 "잘못된 정보가 있나요? / 수정이 필요하거나 폐업한 매장이라면 알려주세요" › (완식 기록 섹션 아래) | `/shop/{id}?report=edit&shop={id}` |

- 열기는 `push`(뒤로가기 = 닫기), 닫기는 `replace`. 등록을 열면 `search` 파라미터를 지운다.
- `/report`는 `/?report=new`로 리다이렉트.

요구: [제보 폼](requirements.md#제보-폼)

## 시트 공통

- `fixed inset-0`, 앱 폭, z-60(홈 상시 시트 z-50 위), 아래→위 슬라이드(모바일 작성 플로우 관례). 홈 상시 시트와 겹치므로 vaul Drawer를 쓰지 않는다.
- 헤더 [X] + 제목("새 라멘집 등록" / "정보 수정").
- 입력이 있는 채로 닫으면 이탈 확인 "라멘집 등록을 그만할까요?" / "정보 수정을 그만할까요?". 빈 폼은 바로 닫힘.
- 하단 고정 CTA. 제출 중 비활성.
- 완료 화면: 제목 + 설명 + [지도로 돌아가기].
- Supabase 미설정이면 토스트 "접수 준비 중이에요. 인스타그램 DM으로 보내주세요.", 전송 실패면 "전송에 실패했어요. 잠시 후 다시 시도해 주세요.", 사진 업로드 실패면 "사진 업로드에 실패했어요. 사진을 빼거나 다시 시도해 주세요." — 모두 입력 유지.

## 새 라멘집 등록 폼

위에서 아래로:

1. 리드 "아직 라맵에 없는 라멘집을 알려주세요." + 우측 "* 필수"
2. 가게 이름* (2/3 폭) + 지점명(선택, 1/3 폭)
3. 링크 — 핀이 없을 때만 `*`. 최대 3행, 첫 행은 삭제 없음, [+ 링크 추가]. blur 후 형식이 틀리면 "링크 형식이 아니에요. 주소창의 URL을 붙여넣어 주세요." 힌트 "인스타그램, 카카오맵, 네이버 지도 중 하나면 충분해요"
4. [📍 지도에서 위치 지정] / 지정 후 "위치 지정됨 · 다시 지정"(레드) + [X] 삭제
5. 사진(선택) 최대 5장
6. 자유 입력(라벨 없음, 플레이스홀더 "더 알려주실 내용이 있다면 자유롭게 적어주세요", 500자)
7. CTA [등록하기] — 가게 이름 + (형식 맞는 링크 1개 이상 또는 핀)일 때만 활성

완료: "등록 요청이 접수됐어요 / 라맵이 확인한 뒤 지도에 등록해 드려요."

- 라벨은 "제보하기"가 아니라 "라멘집 등록" — "제보"는 폐업·수정까지 뭉뚱그리는 말이고, 신규는 카카오맵·네이버 "신규 장소 등록" 관례를 따른다.
- 리드에는 로그인·검수 같은 시스템 사정을 넣지 않고, CTA 아래 설명 캡션도 두지 않는다(HIG). 검수 안내는 완료 화면에만 → [요구사항](requirements.md#제보-폼)

요구: [제보 폼](requirements.md#제보-폼)

## 핀 피커

- 시트는 투명·`pointer-events-none`으로 바뀌고 폼은 숨겨지기만 한다(입력 보존). 뒤의 홈 지도(`ShopMap`)를 그대로 조준면으로 쓴다(홈이 `containerRef`·`view`·`setLevel`·`panTo`·`coordsAt`를 내려줌).
- 지도 위 영역(헤더·필터)은 흰 반투명으로 덮어 비활성.
- 조준점: 하단 바(88px)를 뺀 높이의 40% 지점, 가로 중앙. 십자선 + 원형 표적, 위에 입력한 가게 이름 뱃지.
- 진입 시 임계보다 축소돼 있으면 확대를 강제하고, 이미 지정한 핀이 있으면 그 위치로 이동한다. 지도 레벨이 `PIN_PICK_MAX_LEVEL`(4)보다 크면 확정 비활성 + "조금 더 확대해 주세요". 확정 가능하면 좌표(소수 6자리) 표시.
- 하단 바 [이 위치로 지정], 좌상단 [취소]. 시스템 뒤로가기는 피커만 닫는다.
- 좌표는 소수 6자리(≈0.1m)로 반올림해 `details.pin`에 저장. 주소 표시 없음.
- 좌표 → 컨테이너 변환은 지도 어댑터의 `coordsAt`(카카오 `coordsFromContainerPoint`) → [map 설계](../map/design.md)

왜 이 모양인지:

- 십자선 고정 + 지도 이동: 핀 드래그는 손가락이 목표를 가리고, 탭-투-드롭은 하단 바에 가린 곳을 못 찍는다. 조준점을 40%로 올린 것도 엄지·바에 안 가리게.
- 폼을 언마운트하지 않는다: 초안이 훅 상태라 언마운트하면 날아간다.
- 홈 지도를 재사용한다: SDK 인스턴스 중복·relayout·타일 재요청이 없고, 기존 마커가 보여 중복 제보가 준다.
- 줌은 소프트 게이트다: 하드 블록은 "왜 안 움직이지?" 혼란을 낳는다.
- 주소 표시·주소 검색이 없다: 역지오코딩 저장 금지 → [타사 플랫폼 데이터 경계](../../decisions/0002-third-party-data-boundary.md). 주소 검색은 카카오 로컬 API가 필요하다. 링크 우선 모델이라 핀은 운영자가 동네를 찾아갈 힌트로 충분하다.
- 카카오맵·네이버지도 제보는 앱 전용이라 모바일 웹 선례가 없다. OSM 노트(패널이 지도를 위 55%로 누른 채 정확한 위치를 요구)는 반면교사.

## 정보 수정 폼

1. "수정 항목 / 해당하는 것을 모두 선택해 주세요" — 2열 체크: 폐업·휴업했어요 · 영업시간이 달라요 · 메뉴·가격이 달라요 · 장르가 달라요 · 편의 정보가 달라요 · 위치가 달라요 · 기타
2. 체크한 항목의 필드만:
   - 폐업·휴업: [폐업|휴업] 선택 + 근거 링크(플레이스홀더 "근거 링크 — 인스타 공지, 리뷰 등") + "폐업·휴업은 한 번 더 확인하고 반영해요."
   - 영업시간: "예) 11:30-21:00, 월 휴무"
   - 메뉴·가격: "예) 니보시 시오 13,000원으로 인상"
   - 장르: 국물·종류·스타일 칩(홈 필터와 같은 가시성 — `etc-*`와 trait 제외)
   - 편의: 편의 칩
   - 위치: "새 주소 또는 지도 링크"
3. 상세 내용(500자, "기타"를 고르면 필수)
4. 사진(선택) 최대 5장
5. CTA [보내기] — 항목 1개 이상 + 고른 항목마다 값이 있거나 상세 내용이 있을 때 활성(폐업·휴업은 선택 자체가 값)

완료: "수정 요청이 접수됐어요 / 라맵이 확인한 뒤 반영해 드려요. 폐업·휴업은 한 번 더 확인해요."

- 매장은 진입한 상세 페이지로 정해진다. 자유 텍스트 하나(캐치테이블식)로 받지 않는 이유 → [요구사항](requirements.md#제보-폼)

## 제출과 데이터

1. 사진이 있으면 `toJpegBlob`(1600px·JPEG·EXIF 제거) → `report-photos/{new|edit}/{uuid}.jpg` 업로드
2. `reports` insert

| 컬럼 | 신규 | 수정 |
|---|---|---|
| `type` | `new` | `edit` |
| `shop_name` | 가게 이름 | 대상 매장 상호 |
| `location` | 첫 링크 → 없으면 `lat,lng` | 매장 주소 → 동네 → id |
| `message` | 자유 입력 | 상세 내용 |
| `details` | `{ type, shopName, branch?, links?, pin?, photos?, message? }` | `{ type, shopId, shopName, items, fields: { closed?: {status, evidence?}, hours?, menu?, location?, genre?: {soups?, forms?, lineages?}, amenities? }, photos?, message? }` |

`reports` 나머지 컬럼: `id`, `created_at`, `status`(`open`/`done`, 기본 open), `resolution`(`applied`/`duplicate`/`rejected`), `note`, `resolved_at`. `type` check에 `closed`가 남아 있지만 쓰지 않는다.

권한(RLS):

| 대상 | 정책 |
|---|---|
| `reports` | 누구나 insert, 관리자만 select·update |
| `report-photos` 버킷(비공개, 5MB, `image/jpeg`) | anon·authenticated 업로드, 관리자만 열람 |

- 접수는 외부 폼(구글 폼 등) 임베드가 아니라 앱 안 자체 폼 + Supabase `reports`다(UX, Supabase 스택 → [기술 스택](../../decisions/0001-tech-stack-lite-fsd.md)).
- 컬럼은 늘리지 않고 유형별 구조는 `details` jsonb에 둔다. 사람이 바로 읽을 값(`shop_name`·`location`)만 컬럼에 두고, 폼을 바꿔도 마이그레이션이 필요 없다.

## 검수 `/admin`

- noindex, 앱 내 링크 없음. 프로필 로드 전엔 빈 화면, `role != admin`이면 "운영자만 볼 수 있어요" + [지도로 가기].
- 헤더(뒤로가기) + "운영" + 탭 [사진 검수 N][제보 N](대기 건수, 레드). 기본 탭은 사진 검수.

요구: [검수](requirements.md#검수)

### 사진 검수 탭

- `record_photos`의 pending만, 오래된 순.
- 카드: 사진(서명 URL 1시간) / 매장명(새 탭 매장 링크) / 닉네임 · `M.D HH:mm` / 우측 "N일 경과"(당일은 "오늘") / 한줄평 인용.
- [✓ 승인] / 오른쪽 끝 [반려] → 반려 패널: 사유 칩(라멘이 안 보임·본인 촬영 아님·부적절) + 직접 입력(선택) → [반려 확정](칩·입력 중 하나 이상 필요, 칩과 입력은 " — "로 합침), [취소].
- 처리 후 토스트 "승인했어요"/"반려했어요" + 10초 [되돌리기] → pending 복귀, 사유 삭제.
- 처리된 사진 목록은 없다.

### 제보 탭

- 필터 [대기 N][처리됨 N].
- 묶음: 대기·처리됨 각각에서 신규는 첫 링크의 호스트+경로(링크 없으면 공백 제거·소문자 가게 이름), 수정은 매장 id가 같으면 한 카드. 최신 1건이 대표, 메타에 "같은 제보 N건 더"(처리됨은 "외 N건"). 처리는 묶음 전체 id에 적용.
- 정렬: 대기는 묶음의 최초 접수가 오래된 순, 처리됨은 처리 시각 최신순.
- 카드 머리: (처리됨) 결과 배지 → 유형 배지(신규 레드 틴트 / 수정 회색) → 가게명 + 지점(이름에 없을 때) / 메타 `M.D HH:mm · #id`(처리됨은 `M.D 처리 · 접수 M.D · #id`) / 우측 경과일(대기) 또는 ⋯ 메뉴(처리됨).
- 처리됨: "메모: …" 표시, 액션 없음.
- 신규 본문: 링크 칩(네이버 지도·카카오맵·인스타그램·그 외 도메인, 새 탭) + [핀 위치](카카오맵 `map.kakao.com/link/map/{이름},{lat},{lng}`) + 메시지 인용.
- 수정 본문: 매장 주소(새 탭 매장 링크) → 메시지 → 항목별 상자 "항목명 / 현재 {값|정보 없음}(제보 값이 있으면 취소선) / 제보 {값}". 현재 값은 영업시간(시간 · 브레이크 · 휴무)과 위치(주소)만 비교, 나머지는 "정보 없음".
- 사진 썸네일(80px, 새 탭 원본).
- 액션(대기): [+ 메모 추가] → 입력 / [✓ 반영함] [중복] … 오른쪽 끝 [반려] → 반려 패널(확인 불가·라멘집 아님·정보 불일치·스팸 + 직접 입력). 반려를 반영함과 떨어뜨리는 것은 결과가 다른 버튼을 붙여 두지 않기 위해서다(NN/g).
- 처리 → `status=done`·결과·메모·처리 시각 기록, 토스트 "{결과}으로 처리했어요" + 10초 [되돌리기](→ open).
- 다시 열기(⋯ 메뉴) → `status=open`만 변경(결과·메모·처리일 보존), 토스트 "다시 열었어요" + [되돌리기](→ done).
- 실패 시 토스트 "처리에 실패했어요".

- 수정 제보는 현재 값 대비 제보 값으로 판단한다(Stack Overflow suggested edits·OSMCha 태그 비교). 링크는 원문 URL 대신 서비스 칩 — 긴 URL이 가게명을 한 글자씩 접히게 밀어냈다. 넘침은 flex 자식 `min-w-0`, URL `wrap-anywhere`, 배지 `shrink-0 whitespace-nowrap`로 막는다.
- 처리(제보·사진)와 다시 열기는 확인 창 없이 즉시 실행하고 10초 되돌리기 토스트를 띄운다. 연달아 처리하는 검수자에게 확인 창은 느리고 습관적으로 눌러 실수도 막지 못한다(NN/g, Polaris 액션 토스트 ≥10초).

요구: [검수](requirements.md#검수)

## 운영 흐름

```
제보 접수 → reports (status open)
    ↓ 파트너가 /admin에서 검수
    ├─ 반영함 → 매장 시트에 반영(신규: 태깅 포함 / 수정: 해당 필드 + 최종확인일) → 동기화로 사이트 반영
    ├─ 중복 → 메모 선택
    └─ 반려 → 사유 필수
```

- "반영함"은 처리 기록일 뿐 매장 데이터를 바꾸지 않는다. 실제 반영은 파트너가 매장 시트에 하고 동기화가 사이트에 올린다 → [data 설계](../data/design.md)
- 신규는 실존 확인 후 시딩과 같은 태깅 절차(확신도 `추정`으로 시작 가능), 폐업·휴업은 2차 확인 후 → [폐업 2차 확인](decisions/0014-closure-report-second-check.md)
- 완식 사진 승인은 status만 바꾸며 그 순간 다른 사람에게 보인다 → [records 설계](../records/design.md)

## 이용 통계 이벤트

`report_opened`(type new/edit) · `report_submitted`(type, 성공 여부). 규칙은 [platform 설계](../platform/design.md)

## 알려진 한계

- 스팸 방어(IP 속도 제한·허니팟)가 구현돼 있지 않다 — `reports` 익명 insert에 레이트리밋 없음. 스팸이 생기면 캡차·엣지 검토.
- 제보 결과 통지(마이 "제보" 탭)가 아직 구현되지 않았다 → [검수 결과 피드백](requirements.md#검수-결과-피드백)
- 처리 이력은 마지막 결과만 남는다(재처리 시 덮어씀).
- 처리된 완식 사진을 다시 볼 목록이 없다.
- 수정 제보의 현재 값 비교는 영업시간·위치만.

## 테스트

| 계층 | 파일 |
|---|---|
| 순수 함수 | `features/report/model/{report-payload,report-query,report-options,pin-pick}.test.ts`, `views/admin/model/report-view.test.ts` |
| 훅·컴포넌트 | `use-report-form.test.tsx`, `use-pin-picker.test.tsx`, `admin-page.test.tsx` |
| 시나리오 | `e2e/report.spec.ts` — 수정 제보 이탈 확인·나가기, 빈 폼 즉시 닫힘, 핀 피커(지정 후 입력 보존·제출 활성, 뒤로가기는 피커만 닫음, 취소) |
