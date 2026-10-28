---
status: 유효
updated: 2026-10-28
---

# records 설계

완식·저장 기록, 완식 사진·한줄평, 마이(`/me`)·설정(`/settings`), 카카오 로그인·약관 동의가 지금 어떻게 만들어져 있는지.

## 코드 위치

| 경로 | 역할 |
|---|---|
| `src/entities/record/model/types.ts` | `ShopRecord`, `RecordStore` 인터페이스 |
| `src/entities/record/model/record-ops.ts` | 기록 의미론 순수 함수: `visitAdded`·`visitCleared`·`toggledSaved`·`mergeRecord(s)`·`normalizeRecord`(구 `status` 형식 호환) |
| `src/entities/record/model/local-store.ts` | localStorage 구현체(키 `ramap.records.v1`), `clearLocalRecords` |
| `src/entities/record/model/synced-store.ts` | Supabase write-through 구현체, `fetchRecords`·`pushRecords`·`supabaseSink` |
| `src/entities/record/model/row-mapping.ts` | `ShopRecord` ↔ `records` 행 |
| `src/features/records/model/use-records.ts` | 기록 view-model 훅. 스토어 싱글턴, auth 구독, 로그인 시 병합 이관(adopt) |
| `src/features/records/model/use-visit-action.ts` | 완식·저장 버튼 훅: 로그인 게이트, 기록 시트 열기, `nextOrdinal` |
| `src/features/records/model/record-photos.ts` | 사진 제출(`submitRecordPhotos`), 조회(`fetchShopRecordPhotos`·`fetchMyRecordPhotos`), 탈퇴용 파일 삭제 |
| `src/features/records/model/record-photo-ops.ts` | 사진 순수 함수: `normalizeComment`·`visitOrdinals`·`visibleLogEntries`·`withEntryMeta`, `COMMENT_MAX=30`·`RECORD_PHOTO_MAX=5` |
| `src/features/records/model/visit-summary.ts`·`visit-ordinal.ts` | 상태 줄 문구, 서수 라벨("첫"/"N번째") |
| `src/features/records/ui/record-buttons.tsx` | 지도 카드 버튼 행 [✓ 완식][저장] |
| `src/features/records/ui/record-cta-bar.tsx` | 매장 상세 하단 고정 CTA |
| `src/features/records/ui/record-log-sheet.tsx` | 완식 기록 시트 |
| `src/features/records/ui/visit-summary-line.tsx` | 상태 줄 `VisitSummaryLine` |
| `src/features/records/ui/login-prompt-sheet.tsx` | 로그인 유도 시트 |
| `src/features/records/index.ts` / `index.client.ts` | 공개 API(컴포넌트·훅·순수 함수) / 클라이언트 전용(Supabase 조회) |
| `src/views/shop-detail/ui/record-log-section.tsx` | 상세 "완식 기록" 섹션 |
| `src/views/me/` | 마이 페이지, 기록 뷰어 시트, `paging.ts`·`sort-records.ts` |
| `src/views/settings/` | 설정 페이지(약관·문의·로그아웃·회원탈퇴) |
| `src/features/auth/` | `use-auth`(세션·로그인·로그아웃·탈퇴), `use-profile`(닉네임·동의·role), `consent-sheet` |
| `src/views/home/ui/auth-entry.tsx` | 홈 헤더 프로필 아이콘 |
| `src/shared/api/supabase.ts` | env 게이트 클라이언트 싱글턴(env 없으면 `null`), `signInWithKakao` |
| `src/shared/lib/with-timeout.ts` | `withTimeout`(사진 제출 단계별 제한) |
| `src/shared/lib/image.ts` | `toJpegBlob` — 긴 변 1600px 리사이즈 + JPEG(품질 0.82) 재인코딩 = EXIF 제거 |
| `src/shared/config/legal.ts` | `TERMS_VERSION`·`PRIVACY_VERSION`·`CONTACT_EMAIL` |
| `src/views/legal/model/legal-content.ts` | 약관·방침 본문(제7조 이용자 제보와 콘텐츠 = 사진·글 이용허락) |
| `supabase/schema.sql` | `records`·`profiles`·`record_photos` 테이블, RLS, 트리거, `record-photos` 버킷, `delete_own_account` |

## 기록 모델

`ShopRecord = { shopId, visited, saved, count, firstAt, lastAt }`

| 연산 | 결과 |
|---|---|
| `addVisit(shopId, at)` | `visited=true`, `count` = (이미 완식이면 기존 count) + 1, `firstAt`은 처음 값 유지, `lastAt` = at |
| `clearVisit(shopId)` | 저장이 있으면 `visited=false, count=0`으로 저장만 남김, 없으면 행 삭제 |
| `toggleSaved(shopId)` | 저장 on/off. 저장을 끌 때 완식도 없으면 행 삭제 |
| `mergeRecord(a, b)` | visited·saved는 OR, count는 큰 쪽, firstAt은 이른 쪽, lastAt은 늦은 쪽 |

`records` 테이블: PK `(user_id, shop_id)`, `visited`·`saved`·`count`·`first_at`·`last_at`·`updated_at`, 제약 `visited or saved`. RLS: 본인 행만 조회·삭제, 추가·수정은 본인 + `profiles.agreed_at is not null`.

결정: [공존](decisions/0019-visit-save-coexist.md)

## 저장소와 로그인 전환

화면은 `useRecords()`만 쓴다. 저장소는 `RecordStore` 이음새 뒤에 있다 → [platform 설계](../platform/design.md)

| 상황 | 활성 저장소 |
|---|---|
| Supabase env 없음(로컬 개발) | localStorage — 로그인 UI 숨김, 완식은 시트 없이 바로 +1 |
| env 있음 + 비로그인 | localStorage(빈 상태). 완식·저장을 누르면 로그인 시트 |
| 로그인 | Supabase write-through(메모리 + fire-and-forget upsert/delete) |

로그인 시 이관(adopt):

1. auth 이벤트로 새 user id를 감지하면 토큰을 선점하고 다음 틱에 실행(콜백 안 Supabase 호출은 내부 락과 교착 가능 — supabase-js 문서)
2. 서버 기록 조회(10초 제한). 실패하면 중단하고 로컬 유지 — 빈 기록과 실패를 구분해 서버를 덮어쓰지 않음
3. 로컬 = 스토리지 재읽기 + 메모리 병합 → 서버와 병합 → 일괄 upsert(10초 제한). 실패하면 중단
4. 이관 중 조작은 큐에 쌓았다가 새 스토어에 재적용(저장은 목표 상태로 멱등 적용)
5. 서버 스토어로 교체, 로컬 스토리지 비움

로그아웃: 이관 중단, 로컬 스토어(빈 상태)로 복귀. 서버 기록은 그대로.

결정: [서버 저장과 병합](decisions/0012-server-records-login-merge.md), [로그인 필수](decisions/0013-records-require-login.md)

## 완식 흐름

### 버튼

| 위치 | 컴포넌트 | 모양 |
|---|---|---|
| 지도 카드(홈 바텀시트 매장 모드) | `RecordButtons` | [✓ 완식] 레드 채움 pill + [저장](저장 시 레드 테두리·틴트) |
| 매장 상세 하단 고정 | `RecordCtaBar` | 저장 아이콘 버튼(48px) + [✓ 완식] 주 버튼 |

- 완식 버튼 문구·모양은 고정이다(완식 여부·횟수로 바뀌지 않음).
- 저장은 바로 토글된다(로그인 필요).
- 완식을 누르면: 비로그인 → `LoginPromptSheet` / 로그인 → `RecordLogSheet`(visit 모드).

결정: [기록 시트](decisions/0021-visit-confirm-in-sheet.md)

### 기록 시트 `RecordLogSheet`

| | visit 모드(완식 버튼) | 사진 추가 모드(상세 [남기기]) |
|---|---|---|
| 제목 | "첫 완식" / "N번째 완식" (`nextOrdinal` = 완식이면 count+1, 아니면 1) | "완식 기록 남기기" |
| 사진 | 선택, 최대 5장 | 1장 이상 필수 |
| 버튼 | [취소] [기록하기] | [다음에] [남기기] |
| 결과 | 사진 업로드 성공 후 `addVisit`(+1, 날짜 기록) | 사진만 추가, 횟수 불변 |

- 한줄평 입력은 사진을 넣기 전엔 비활성(플레이스홀더 "한줄평 (사진을 넣으면 쓸 수 있어요)" → "한줄평 (선택)"), 30자 카운터.
- "매장 페이지에 소개돼도 좋아요" 체크, 기본 on.
- 제출 중 버튼 "올리는 중…". 실패하면 "저장에 실패했어요. 잠시 후 다시 시도해주세요" 표시 후 재시도 가능, 완식은 기록되지 않음.
- 입력이 있는 채로 닫으면 이탈 확인 "기록 작성을 그만할까요?". 입력이 없으면 바로 닫힘. 닫으면 기록 없음.
- 기록 직후 토스트·보조 설명 문구 없음.

### 사진 제출 `submitRecordPhotos`

단계별 20초 제한(`SUBMIT_STEP_TIMEOUT_MS`): `auth`(세션 확인) → `encode`(JPEG 변환) → `upload`(스토리지) → `insert`(행 추가). 결과는 `SubmitResult = { ok: true } | { ok: false, step }`. 실패 단계는 이용 통계 `record_log_submitted.failed_step`으로 보낸다.

- 한 번의 제출 = 묶음 하나(`entry_id` 공유). 한줄평은 첫 행에만. 부분 실패는 전체 실패.
- 경로 `{user_id}/{uuid}.jpg`, 버킷 `record-photos`.

### 상태 줄 `VisitSummaryLine`

완식한 가게에만 "✓ 완식 3회 · 최근 10.28"(레드). 최근 날짜가 올해면 `M.D`, 아니면 `YYYY.M.D`, 날짜 없으면 "완식 N회"만. 위치: 매장 상세 영업 상태 아래, 지도 카드 메타 아래.

## 사진 데이터

`record_photos`: `id`, `user_id`, `shop_id`, `photo_path`, `comment`(≤30자), `consent`(기본 true), `status`(`pending`/`approved`/`rejected`, 기본 pending), `reject_reason`, `created_at`, `entry_id`(묶음 키, 구 데이터는 null = 행 단독).

| 경로 | 정책 |
|---|---|
| 조회 | 본인 전부, 타인·비로그인은 `approved and consent`만. 관리자 전부 |
| 추가 | 본인 + `status='pending'` 고정 + 약관 동의 유저 |
| 수정 | 관리자만(`is_admin()`) — 승인·반려는 /admin |
| 삭제 | 본인 것 |

스토리지 `record-photos`(비공개, 5MB, `image/jpeg`): 업로드는 본인 폴더만, 조회는 본인 폴더 또는 승인·동의 행이 있는 파일 또는 관리자, 삭제는 본인 폴더. 승인 시 파일 이동 없이 status만 바뀐다. 렌더는 서명 URL(1시간).

- 닉네임 표시: `profiles`를 비로그인도 조회 가능(닉네임·동의 시각뿐) — 사진 행의 user id를 모아 2번째 쿼리로 조인.
- 차수: 같은 유저의 묶음을 오래된 순으로 센다(`visitOrdinals`, 묶음 1개 = 1완식).
- 검수는 report 모듈의 /admin 사진 검수 탭 → [report 설계](../report/design.md)

결정: [부가물·검수 승격](decisions/0015-optional-photo-note-review.md)

## 상세 "완식 기록" 섹션 `RecordLogSection`

- 위치: 매장 상세, "잘못된 정보가 있나요?" 행 위.
- 보이는 조건: 보여줄 항목이 있거나 내가 완식한 가게.
- 제목 "완식 기록" + (로그인·완식한 경우) [📷 남기기] → 사진 추가 모드 시트.
- 목록: 가로 스크롤 카드(폭 160px, 드래그 스크롤). 타인 승인·동의분 + 본인 전부, 최신순.
- 카드: 정사각 사진, 본인 것은 "검토 중"(pending)·"반려됨"(rejected) 칩. 묶음 첫 장에만 한줄평과 메타 `닉네임 · N번째 완식 · YYYY.M.D`.
- 항목이 없으면 "첫 완식 기록을 남겨보세요".

## 마이 `/me`

SSG 껍데기(`getShops()`를 서버에서 내려줌) + 클라이언트 섬. noindex. 목록은 현재 매장 데이터에 있는 가게만.

- 헤더: [←](지도) / [⚙](설정). 2뎁스 헤더 규칙 → [ui 설계](../ui/design.md)
- 비로그인: "로그인하기 ›"(탭 → 로그인 시트) + "로그인하면 완식·저장 기록이 여기에 모여요".
- 로그인: "{닉네임}님"(로딩 중 스켈레톤, 닉네임 없으면 "라멘 러버") / "완식 N · 저장 N" + 우측 [장르 가이드] 링크(`/guide`).
- 탭 [완식][저장] — sticky, URL `?tab=saved`(기본 완식), `replace`로 전환.
- 완식 탭: 3열 정사각 그리드. 내 사진 중 첫 장, 사진이 여러 장이면 겹침 아이콘. 사진 없으면 라멘 아이콘 타일 + 상호. 탭 → 기록 뷰어.
- 저장 탭: 리스트 — 상호 · 지역 · 기록 날짜(`YYYY.M.D`) + 장르 칩 → 매장 상세.
- 정렬: 최근순(`lastAt ?? firstAt`, 날짜 없으면 뒤로).
- 두 탭 모두 20개씩, [기록 더보기 (남은 수)].
- 빈 상태: "아직 완식한(저장한) 라멘집이 없어요 / 지도에서 완식(저장)을 찍으면 여기에 모여요 / [지도 보기]".

결정: [사진 그리드](decisions/0022-visit-tab-photo-grid.md), [더보기](decisions/0020-record-list-load-more.md)

### 기록 뷰어 `RecordViewerSheet`

- 제목 = 상호, 부제 "완식 N회".
- 사진 가로 스와이프(스냅) + 도트, 본인 사진의 "검토 중"·"반려됨" 칩.
- 현재 사진의 한줄평 + "N번째 완식 · YYYY.M.D".
- [매장 보기] → 매장 상세.
- [완식 기록 삭제] → 인라인 확인 "완식 기록을 지울까요? / 완식 N회 기록이 지워져요. 남긴 사진은 그대로 남아요" [취소](기본 포커스) [지우기] → `clearVisit`.

## 설정 `/settings`

noindex. 헤더 [←](마이) + "설정".

| 섹션 | 항목 | 노출 |
|---|---|---|
| 약관 및 정책 | 이용약관(`/terms`) · 개인정보 처리방침(`/privacy`) · 문의하기(`mailto:` 제목 "[라맵] 문의") | 항상 |
| 계정 | 로그아웃(→ 홈) · 회원탈퇴 | 로그인 시 |

회원탈퇴 시트: "정말 탈퇴할까요? / 완식·저장 기록과 남긴 사진이 모두 지워지고 되돌릴 수 없어요." [취소][탈퇴하기]. 실행 = 본인 `record-photos` 파일 삭제 → `delete_own_account()` RPC → 로컬 세션 종료 → 토스트 "탈퇴가 완료됐어요" → 홈. 실패 시 토스트 "탈퇴에 실패했어요. 잠시 후 다시 시도해 주세요."

결정: [설정 페이지](decisions/0023-settings-separate-page.md), [탈퇴](decisions/0017-drop-export-account-deletion.md)

## 로그인·약관 동의·프로필

- 진입: 홈 헤더 프로필 아이콘은 항상 `/me`로 간다(env 없으면 아이콘 숨김). 완식·저장을 누른 비로그인 사용자는 로그인 시트.
- 로그인 시트: 🍜 "라맵과 함께할까요? / 카카오 계정으로 3초 만에 시작해요" + [카카오로 계속하기](카카오 브랜드 색 `#FEE500` — 유일 유채색 원칙의 명시적 예외). OAuth 후 현재 화면으로 돌아온다(`redirectTo` = 현재 URL).
- 약관 동의 시트(`ConsentSheet`, 루트 레이아웃에 전역 마운트): 프로필이 로드됐고 `agreed_at`이 없으면 닫을 수 없는 시트 "시작하기 전에 동의가 필요해요" / [전체 동의] 체크(이용약관·개인정보 처리방침 링크, 필수) / [동의하고 시작하기] → `agreed_at`·`agreed_terms_version`·`agreed_privacy_version` 기록. 실패 시 토스트.
- `profiles`: `user_id`, `nickname`(2~12자, 유일), `nickname_updated_at`, `agreed_at`, 약관·방침 버전, `role`(`user`/`admin`), `created_at`. 생성은 `auth.users` 트리거(`handle_new_user` → `generate_nickname`)만, 클라이언트 insert 불가. 수정은 본인 행, 닉네임 불변 강제.
- 닉네임 사전: 형용사 30개(수줍은·씩씩한·…·콧테리·앗사리) × 명사 30개(돈코츠·쇼유·…·토쿠세이). 중복 시 10회 재시도 → 4자리 접미사 10회(12자 이하) → 폴백 `라멘` + 8자리.
- 운영자(`role=admin`)는 이용 통계에서 제외된다 → [platform 설계](../platform/design.md)

결정: [가입 확정·닉네임](decisions/0018-signup-terms-auto-nickname.md)

## 이용 통계 이벤트

`record_toggled`(kind visited/saved, 완식은 기록 확정 시) · `record_log_submitted`(사진 수·한줄평 여부·재방문 여부·성공 여부·실패 단계) · `login_started` · `account_deleted`. 규칙은 [platform 설계](../platform/design.md)

## 외부 설정

- Supabase Auth에 카카오 프로바이더 등록(카카오 ramap 앱 REST 키). 카카오 동의항목에서 닉네임·프로필사진을 요청하지 않는다.
- env `NEXT_PUBLIC_SUPABASE_URL`·`NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- 스키마 변경은 `supabase/schema.sql`에 멱등으로 쓰고 대시보드 SQL Editor에서 실행한다. RLS 정책을 바꾼 뒤에는 `pg_policies`로 조회·추가·수정·삭제 4경로를 모두 재검증한다(중복 정책 drop으로 select·delete 커버리지가 통째로 사라진 사고가 있었다).

## 알려진 한계

- 여러 탭에서 동시에 완식하면 count가 덮어써질 수 있다 — 원자 증가 RPC 필요.
- 여러 탭: 이관·비움 후에도 옛 탭의 메모리 캐시가 병합 입력에 들어가 옛 기록이 부활할 수 있다(스토리지 불가 환경 보존의 대가). 완전 해결은 storage 이벤트 기반 캐시 무효화.
- 병합 규칙에 삭제 표시(tombstone)가 없어, 두 로컬 소스가 어긋난 극단 케이스에서 삭제가 재업로드될 수 있다.
- 이관 상태 기계(큐·토큰)가 모듈 전역이라 단위 테스트가 안 된다 — 순수 리듀서 추출은 리팩터 부채.
- 다른 탭발 계정 전환(로그아웃 없는 u1→u2) 시 전환 중 조작이 양쪽 계정에 기록될 수 있다(UI에 전환 경로 없음).
- `fetchRecords`에 페이지네이션이 없다 — PostgREST 기본 상한 1000행을 넘으면 잘린다.
- 반려 사유(`reject_reason`)는 본인 화면에 나오지 않는다(칩 "반려됨"만).

## 테스트

| 계층 | 파일 |
|---|---|
| 순수 함수 | `entities/record/model/*.test.ts`, `features/records/model/{record-photo-ops,record-photos,visit-ordinal,visit-summary}.test.ts`, `views/me/model/{paging,sort-records}.test.ts` |
| 훅·컴포넌트 | `use-visit-action.test.ts`, `record-buttons.test.tsx`, `record-log-sheet.test.tsx`, `visit-summary-line.test.tsx`, `me-page.test.tsx`, `settings-page.test.tsx` |
| 시나리오 | 없음 — 로그인 여정은 카카오 OAuth라 자동화 불가 |
