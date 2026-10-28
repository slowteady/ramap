# 라맵 문서 색인

문서 규칙은 `.claude/rules/docs.md`. 지금 유효한 사실은 각 모듈의 `requirements.md`·`design.md`에만 있다. 할지 말지 정할 후보는 [백로그](backlog.md).

## 모듈

| 모듈 | 다루는 것 | 언제 읽나 |
|---|---|---|
| [product](modules/product/README.md) | 서비스 정의·문제·타겟·가치·사업 구조·MVP 범위·성장 전략 | 기능의 필요성·범위를 판단할 때 |
| [ui](modules/ui/README.md) | 디자인 토큰·정보 구조(내비게이션·라우트·헤더)·공통 라벨·화면 품질 게이트 | 화면을 만들거나 바꿀 때 |
| [map](modules/map/README.md) | 홈 지도·목록 바텀시트·매장 카드·필터·검색·마커·클러스터 | 홈(`/`)을 건드릴 때 |
| [shop-pages](modules/shop-pages/README.md) | 매장 상세, 지역·지역×장르·계보·장르 가이드 랜딩, 구조화 데이터·사이트맵·색인 | 상세·랜딩 페이지나 SEO를 건드릴 때 |
| [records](modules/records/README.md) | 완식·저장 기록, 완식 사진·한줄평, 마이·설정, 카카오 로그인·동의 | 기록·로그인·마이를 건드릴 때 |
| [report](modules/report/README.md) | 사용자 제보와 운영자 검수(`/admin`) | 제보 폼·검수 화면을 건드릴 때 |
| [data](modules/data/README.md) | 택소노미, 시트 스키마, 시딩·보강·동기화 파이프라인, 무결성·폐업·인스타·휴무 | 매장 데이터나 `scripts/`를 건드릴 때 |
| [platform](modules/platform/README.md) | 스택, 지도 SDK·어댑터, Supabase, 라이브러리, 테스트, 이용 통계, 환경 변수 | 기술 기반·라이브러리·테스트·이벤트를 건드릴 때 |

## 모듈을 넘는 결정

| 문서 | 언제 읽나 |
|---|---|
| [0001-tech-stack-lite-fsd](decisions/0001-tech-stack-lite-fsd.md) | 코드 위치·레이어·import 방향을 정할 때 |
| [0002-third-party-data-boundary](decisions/0002-third-party-data-boundary.md) | 좌표·타사 데이터·사진·링크를 다룰 때 |
| [0003-light-mode-only](decisions/0003-light-mode-only.md) | 테마·색을 건드릴 때 |
| [0004-library-adoption-triggers](decisions/0004-library-adoption-triggers.md) | 새 라이브러리를 넣으려 할 때 |
| [0005-issue-based-workflow](decisions/0005-issue-based-workflow.md) | 작업 단위·머지·배포 권한을 확인할 때 |
| [0006-docs-module-structure](decisions/0006-docs-module-structure.md) | 옛 `docs/planning`·`docs/plans` 문서가 어디로 갔는지 찾을 때 |
| [0007-shared-git-rules](decisions/0007-shared-git-rules.md) | 커밋·머지 형식을 확인할 때 |
| [0008-no-auto-pr-review](decisions/0008-no-auto-pr-review.md) | 보일러플레이트를 다시 복사하거나 PR 리뷰 방식을 바꿀 때 |

## 공통 조사

| 문서 | 언제 읽나 |
|---|---|
| [2026-09-03-post-nationwide-remaining-work](research/2026-09-03-post-nationwide-remaining-work.md) | 백로그 "backlog §N" 근거를 볼 때 |
| [2026-09-05-competitor-benchmark](research/2026-09-05-competitor-benchmark.md) | 경쟁 서비스 기능·백로그 "benchmark" 근거를 볼 때 |
| [2026-10-27-map-detail-review](research/2026-10-27-map-detail-review.md) | 지도·상세 개선 후보, 백로그 "research M·D·F" 근거를 볼 때 |
