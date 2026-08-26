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

## 명령

- `npm run dev` / `npm run build` / `npm test` (vitest)

## 커밋

한국어 컨벤셔널 스타일 (`feat:`, `chore:`, `docs:`), 푸터에 `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`
