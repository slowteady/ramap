# 라맵 (Ramap)

한국 라멘을 장르로 찾는 지도 — ramap.kr. Next.js(App Router) + TS + Tailwind v4 + shadcn/ui.

## 스펙 (단일 원천)

`docs/planning/` 01~17이 모든 결정의 원천이다. 코드와 충돌하면 문서를 먼저 확인하고, 결정 변경은 문서 갱신과 함께.
구현 계획: `docs/plans/`. 아이디에이션 레포의 03.라맵은 동결 스냅샷 — 참조 금지.

## 필수 규칙

- **UI 코드 작성·수정 시 ramap-ui 스킬 필수** (.claude/skills/ramap-ui)
- **주석 금지**: 코드가 표현 못 하는 제약(약관 금지, 비자명한 수치 근거)만 허용. 서사형·자명·출처 주석 전부 금지
- **토큰 외 값 금지**: 색·radius·폰트는 globals.css @theme 토큰만. 브랜드 레드는 시맨틱 `primary`, 원시값은 `ramen`
- 다크모드 금지 (라이트 고정 — 카카오맵 다크 타일 부재)
- 지도사(카카오·네이버) 지오코딩 API 결과의 저장·DB화 금지 — 약관 위반, 서비스 중단 사유. 좌표는 공공데이터·수동 핀만
- 네이버·카카오 플랫폼 데이터 크롤링 금지. 타사는 아웃바운드 링크·사실 기록까지만 (docs/planning/09 경계선)
- 기록(완식·위시) 접근은 RecordStore 인터페이스 경유만 — localStorage 직접 호출 금지 (로그인 도입 대비 이음새)

## 개발 컨벤션

- **아키텍처: FSD(Feature-Sliced Design) 필수.** 레이어: `src/app`(Next 라우팅+전역, 얇게) → `src/views`(FSD pages — Next 충돌 회피 명명) → `src/widgets` → `src/features` → `src/entities` → `src/shared`. **import는 상위→하위 방향만**, 역방향·동일 레이어 슬라이스 간 금지. 슬라이스는 `index.ts` public API로만 외부 노출. shadcn은 `src/shared/ui`, 유틸 `src/shared/lib`, 도메인은 `entities/shop`·`entities/record`. `data`(정적 데이터)·`scripts`(파이프라인)는 src 밖
- **브랜치:** 작업 단위마다 `feat/`·`fix/`·`chore/` 브랜치 → 완료 시 main에 squash 없이 머지 후 브랜치 삭제. main 직접 커밋 금지 (docs·설정 1파일 수정만 예외)
- **네이밍:** 파일 kebab-case(`shop-card.tsx`), 컴포넌트 PascalCase, 함수·변수 camelCase, 상수 UPPER_SNAKE. 도메인 용어는 코드에선 영어(soup, form, lineage), UI 문자열만 한국어
- **타입:** `type` 기본. `interface`는 구현체가 여럿 생길 계약(RecordStore 등 이음새)에만
- **import:** `@/` 절대경로만, 상대경로는 같은 폴더 내부만 허용
- **테스트:** 대상 파일 옆에 `*.test.ts` co-location. 로직(lib·scripts)은 테스트 필수, 컴포넌트는 로직 분리로 대응
- **포맷:** Prettier 기본 설정 — 스타일 논쟁 금지, `npm run format`으로 통일

## 명령

- `npm run dev` / `npm run build` / `npm test` (vitest) / `npm run format`

## 커밋

한국어 컨벤셔널 스타일 (`feat:`, `chore:`, `docs:`), 푸터에 `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`
