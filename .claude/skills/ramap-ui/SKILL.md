---
name: ramap-ui
description: Use when writing, editing, or reviewing any UI code (components, styles, pages, Tailwind config) in the ramap repository
---

# 라맵 UI 규율

## 토큰 (예외 사용 금지 — tailwind config가 유일한 출처)

- 색: 흰 배경 + 그레이 4단 + 액센트 라멘 레드 1색(+틴트 2단) + 시맨틱 그린. 새 색 추가 금지. 태그 칩 유채는 1차 축(국물)에만 — 값별 다색 금지(2026-08-28 조사: 9값>구분 한계·색약 병합·학습 불가)
- 텍스트 근흑(#1A1B1F 계열), 순흑 금지
- radius: 카드 8~12px(`rounded-card`/`-lg`) / 컨트롤 칩·버튼 pill(`rounded-pill`) / 태그 배지(장르·편의) 5px(`rounded-chip`, 무신사식 콘텐츠·컨트롤 형태 분리) / 그 외 금지
- 폰트: Pretendard, 스케일 5~6단 고정, 위계는 크기보다 굵기(400/600/700)
- 카드 구획은 그림자·테두리 대신 여백. 아이콘은 lucide 단일 세트
- 2뎁스 페이지(신규 오픈·가이드·지역·계보·마이·약관) 헤더는 `shared/ui/page-header`(뒤로가기 + 우측 보조 액션 1개)만 — 로고·홈 링크 헤더 금지, 뒤로가기는 이력 있으면 back, 없으면 홈
- 클릭 요소는 `<button>`/`<a>`로만 (div·span에 onClick 금지). 커서는 globals.css base 레이어가 일괄 pointer 처리 — 개별 `cursor-pointer` 유틸 금지, 예외(투명 백드롭 등)만 `cursor-default`
- `cn()`은 커스텀 텍스트 스케일이 등록된 `shared/lib/utils`의 것만 사용 — `tailwind-merge`를 직접 import 금지 (text-body가 색으로 오인돼 삭제됨)

## 스타일 금지 시그니처

Inter/기본폰트 · 그라데이션 배경(예외: 가로 스크롤 에지 페이드 마스크 `mask-fade-r` — keeper FadeEdgesScrollView 실측) · rounded-2xl 남발 · 이모지 아이콘 ·
유리효과 · 테두리+그림자 이중 카드 · shadcn 기본 팔레트 잔재 · 보라-파랑 액센트

## 구조 금지 패턴 (AI 단골 레이아웃)

아이콘+제목+설명 3열 특징 그리드 → 에디토리얼 인라인으로 · 중앙정렬 히어로 ·
통계 밴드 · 섹션 제목 위 pill 배지 · 아이콘 원형 파스텔 배경 ·
동일 리듬 섹션 반복 · 페이지 끝 CTA 밴드 · 3단계 스텝퍼

## 대원칙

1. 모든 레이아웃 패턴은 실측 레퍼런스 출처(기획 레포 03.라맵/13.UI설계원칙.md)를
   댈 수 있어야 한다. 출처를 못 대면 반사신경 — 제거하라
2. 완성 판정: "이 화면이 어느 서비스 것인지 가릴 수 있는가" — 가려지면 실패
3. shadcn 컴포넌트는 토큰 테마로 덮기 전 사용 금지

## 벤치마크 배정

앱 구조·검색·카드=캐치테이블 / 지도=호갱노노 / 바텀 카드·탭=오늘의집 / 토큰 규율=토스

## 바텀시트 제스처 규율 (2026-09-02 BP 확정 — HIG·M3·vaul 소스 근거)

- **콘텐츠 스와이프 = 시트 이동이 표준.** HIG 원문 "A resizable sheet expands when people scroll its contents or drag the grabber" — 핸들 전용 드래그(handleOnly) 금지. 내부 스크롤은 마지막 스냅에서만 열리는 것이 사양이지 결함이 아니다
- **플릭 스킵은 vaul 기본(켜둔다).** `snapToSequentialPoint` 사용 금지 — 강한 플릭(velocity>2px/ms)은 중간 스냅을 건너뛰어 접힘→풀 1제스처 도달. 이것이 "풀까지 가는 마찰"의 해법이며 중간 스냅에서 스크롤을 여는 게 아니다
- **지속형 시트(홈 목록)**: 비모달 + `dismissible=false`(하향 플릭이 close 대신 첫 스냅으로) + 핸들은 vaul `Handle`(탭 시 스냅 순환 — HIG grabber 규정)
- **모달 시트(폼·확인)**: 스냅 없이 단일 높이(HIG compose 규칙 — 중간 detent 금지), 하향 스와이프+명시적 닫기 버튼 병행(NN/g — 스와이프 단독 의존 금지). 미저장 입력이 있는 폼은 이탈 확인 절차 검토
- 시트 내 가로 스크롤·슬라이더는 `data-vaul-no-drag`로 드래그 충돌 제외
