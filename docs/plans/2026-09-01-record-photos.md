# 완식 기록 (사진·한줄평) — 구현 계획

2026-09-01 확정. BP 딥다이브(아래 근거) 후 PO 결정 완료. 이 문서만 읽고 다른 에이전트가 구현을 이어받을 수 있어야 한다.

## 결정 요약 (원안 대비 변경)

| 항목 | 원안 (report-redesign 미결 기록) | 확정 |
| --- | --- | --- |
| 사진+한줄평 | 완식의 필수 인증 | **선택 부가물** — 완식 토글은 현행 그대로, 직후 시트로 유도만 |
| 등급 표현 | 인증/무인증 마커 2색 | **마커 불변.** 부가물 있는 완식만 매장 상세 콘텐츠로 승격(집계 게이트) |
| 섹션 네이밍 | (미정) | **"완식 기록"** |
| 한줄평 | (미정) | 선택 입력, **30자** — 태그라인 인용구 한 줄 분량 |
| 본인 노출 | (미정) | 제출 즉시 본인에게 표시하되 **"검토 중" 라벨 필수**, 타인 노출은 검수 승인 후 |
| 완식 누적 | 문서 스펙(누적)·구현(토글 1회) 불일치 | 버튼은 토글 유지, **재제출 시 records.count +1** — "N번째 완식" 원천, 연타 어뷰징 구조 차단 |

### 근거 (2026-09-01 BP 딥다이브 3갈래)

1. **국내 실측** (네이버 플레이스·캐치테이블·배민·오늘의집): 전부 "인증은 필수, 콘텐츠(사진·텍스트)는 선택". 사진은 강제 대신 노출 우위·차등 보상으로 유도. 인증 표시는 배지가 아닌 메타 한 줄(`8.10.월 · 1번째 방문 · 영수증`). 매장 페이지는 사진 그리드 우선.
2. **해외 체크인 문헌** (Untappd·Letterboxd·Beli·Vivino·Swarm·ramendb): 기록(체크인)은 무조건 가볍게, 사진·평은 선택 — 예외 0. 인증의 하드 등급(마커 색) 전례 0, 표준은 "인증분만 장소 페이지 공용 콘텐츠로 승격". Foursquare 교훈: 기록을 막은 Gowalla는 실패, 기록 허용+보상만 검증 연동이 생존.
3. **검수 운영** (Bazaarvoice·구글 리뷰·Reddit): 리뷰 장르는 선검수가 표준(SLA 72h — 지연이 이탈 요인이 안 되는 기대치), "본인 즉시 노출 + 타인 검수 후"는 가시성 플래그로 검증된 패턴. 1인 운영이면 하루 1회 일괄 검수로 충분.

planning/14 정합성: 기록 체계 형태 불변(완식 토글 유지), 배지·레벨 금지(보상은 "내 기록 풍부화"까지만), 별점 금지(별점 없음), 리뷰는 "완식 부속 코멘트의 선택적 공개"(공개 동의 체크로 구현).

## 스펙

### 1. "완식 기록 남기기" 시트 (신규 클라이언트 섬)

- 트리거: 완식 토글 **off→on 직후** 1회 자동 표시. 이미 완식한 매장에선 상세 "완식 기록" 섹션의 [남기기] 버튼으로 재진입(재제출 = count +1).
- 입력: 사진 1장(시트 내에서는 필수) + 한줄평(선택, **최대 30자**) + "매장 페이지에 소개돼도 좋아요" 체크(기본 on) + [다음에] 버튼(건너뛰기 — 완식은 이미 저장된 상태).
- 체크 off 제출분은 검수 큐로 가지 않고 본인 기록에만 남는다.
- 비로그인은 완식 자체가 로그인 게이트이므로 추가 처리 불필요.

### 2. 매장 상세 "완식 기록" 섹션

- 위치·상세 레이아웃은 구현 시 ramap-ui 스킬 + 레퍼런스 실측(네이버 리뷰 탭 문법: 사진 그리드 우선) 후 확정.
- 내용: 승인분 사진 그리드 + 한줄평, 항목 메타는 조용한 한 줄 `닉네임 · N번째 완식 · YYYY.M.D`.
- 본인 제출분은 pending도 표시하되 `검토 중` 회색 칩. 거절분은 본인에게 사유와 함께 표시.
- 이 한줄평 풀 = 태그라인 추출 원천 (수동 큐레이션, 시트의 tagline 열).

### 3. /me

- 완식 목록 항목에 대표 사진 썸네일 (본인 제출분, pending 포함).

### 4. 검수 운영

- Supabase 대시보드에서 수동 (제보 검수와 동일 동선), 하루 1회 일괄.
- 공개 사진 가이드 3항 (시트 하단 안내 + 거절 사유 근거): 라멘이 주인공 / 직접 찍은 사진 / 다른 사람 얼굴이 안 나오게. (구글 지도 UGC 정책 축약)
- 승인 = status를 approved로 변경 (그 순간 스토리지 RLS가 타인 노출 개방 — 파일 이동 없음). 거절 = rejected + 사유 텍스트.

### 5. 약관 개정 (views/legal)

- 이용허락 조항 추가 (국내 표준 문구, 당근 약관 계열): 저작권은 작성자 귀속 / 서비스 노출에 필요한 범위 내 무상·비독점 이용(수정·복제·편집 포함) / 언제든 삭제·비공개 요청 가능. TERMS_VERSION 갱신 필요(`shared/config/legal.ts`).

## 데이터

### record_photos 테이블 (supabase/schema.sql에 추가)

```sql
create table if not exists public.record_photos (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  shop_id text not null,
  photo_path text not null,
  comment text check (char_length(comment) <= 30),
  consent boolean not null default true,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reject_reason text,
  created_at timestamptz not null default now()
);
```

- RLS: select = 본인 것 전부 or `status = 'approved' and consent`(타인·anon 포함 — 열람 개방 원칙) / insert = 본인 + `status = 'pending'` 고정 + 동의 게이트(`profiles.agreed_at is not null`) / delete = 본인 것. **update 정책 없음** — status·reject_reason은 대시보드(service role)만.
- 스토리지: **단일 비공개 버킷 `record-photos` + RLS로 노출 제어** — 업로드 경로 `{user_id}/{uuid}.jpg`, select는 본인 경로 or record_photos에 approved·consent 행 존재. 승인 시 파일 이동 없이 status 변경만으로 타인 노출 (운영 1스텝). 렌더는 createSignedUrls.
- **records.count 증가**: 재제출 시 클라이언트가 `records.count + 1` upsert (write-through 경로 재사용). count는 완식 토글 on 시 1, 재제출마다 +1.
- **확장 이음새 (2026-09-01 PO 검토)**: record_photos는 개념상 "완식 이벤트 + 부가물"이다. 사진 없는 재방문 체크인(풀 이벤트 로그)이 필요해지면 photo_path를 nullable로 완화하는 것만으로 전환된다 — 테이블 재설계 불요. 풀 누적을 지금 안 하는 이유: 버튼 토글 UX 파괴(취소 vs 재방문 구분), 무인증 연타 누적 재개방, 수요 미실증.
- **주의 — RLS 정책 적용 시 반드시 적용 후 pg_policies로 CRUD 4경로(조회·추가·수정·삭제)를 전부 재검증할 것.** 2026-09-01 사고: schema.sql과 실DB 정책이 어긋난 상태에서 중복 정책을 drop해 records의 select/delete 커버리지가 통째로 사라졌었다 (schema.sql 말미 복구 블록 참조).

## 기존 코드 포인터 (수정·재사용 대상)

| 파일 | 역할 |
| --- | --- |
| `src/features/report/model/photo-upload.ts` | `toJpegBlob`(리사이즈+EXIF 제거)·업로드 패턴 — **entities 또는 shared로 승격해 재사용** (BUCKET 파라미터화) |
| `src/features/records/model/use-visit-action.ts` | 완식 토글 훅 — on 전환 감지 후 시트 오픈 신호 추가 지점 |
| `src/features/records/ui/record-cta-bar.tsx` · `record-buttons.tsx` | 완식 버튼 2곳 — 시트 마운트 |
| `src/entities/record/model/*` | visited/saved 모델(2026-09-01 공존 전환됨). count 증가는 toggledVisited가 아닌 별도 경로로 (토글 의미 보존) |
| `src/views/shop-detail/ui/shop-detail-page.tsx` | "완식 기록" 섹션 삽입 지점 (근처 라멘집 위) |
| `src/views/me/ui/me-page.tsx` | 완식 목록 썸네일 |
| `src/views/legal/model/legal-content.ts` + `src/shared/config/legal.ts` | 약관 조항·버전 |
| `supabase/schema.sql` | 스키마 단일 기록처 — 적용은 대시보드 SQL Editor(Playwright 세션) |
| `src/features/report/ui/report-sheet.tsx` | 바텀시트 폼 문법(vaul Drawer) 참조 |

## 검증

- `npm test` (record_photos 관련 순수 함수 — 제출 가능 조건·count 계산 — Vitest 필수), `npx tsc --noEmit`, `npm run build`
- Supabase 적용 후: pg_policies로 CRUD 4경로 검증 + 실브라우저 E2E (제출→본인 즉시 표시(검토 중)→대시보드 승인→타인 세션 노출→count 증가)

## 작업 절차

1. `feat/record-photos` 브랜치 (main에서)
2. 스키마·스토리지 → 업로드 파이프라인 승격 → 시트 → 상세 섹션 → /me → 약관 → planning/14 개정(아래) 순
3. 로컬 검수 후 사용자 OK 시에만 머지·푸시

## planning/14 개정안 (구현 브랜치에 포함)

- 1단 스펙 1 갱신: "재방문 카운트 증가"의 경로를 완식 기록 재제출로 명시 (버튼은 토글)
- 1단 스펙 2 갱신: "별점·메모 MVP 배제" → 한줄평(선택 30자)은 완식 기록 부가물로 도입, 별점은 계속 배제
- 3단-3 갱신: "완식 부속 개인 코멘트의 선택적 공개"가 완식 기록의 공개 동의 체크로 구현됨을 기록

## 백로그 (이번 스코프 제외)

- 라멘판 키워드 칩 (국물 농도·면 익힘 — 네이버의 별점 대체 문법, 매장 페이지 집계 바 재활용)
- 재방문 "N번째 완식" 강조 UI, 신고 버튼(유저 증가 시 사후 검수 전환)
- 사진 자동 필터(ML) — 초기엔 수동 검수로 충분
