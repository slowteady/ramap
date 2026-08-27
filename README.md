# 라맵 (Ramap)

한국 라멘을 장르로 찾는 지도 — ramap.kr

- **배포: https://ramap-delta.vercel.app** (Vercel, main 자동 배포 — ramap.kr 연결 예정)
- **기획·설계 문서: [docs/planning](docs/planning)** (01 서비스개요 ~ 18 데이터전략) — 이 레포가 단일 원천
- 탐색·검증 리서치: [docs/research](docs/research)

배포 주의: 새 도메인 연결 시 Keeper 앱 JS SDK 도메인·Supabase Auth Redirect URLs에 추가 필요.

## 개발

- `npm run dev` — 개발 서버
- `npm test` — 단위 테스트 (vitest)

## 데이터 파이프라인

1. `npm run seed-candidates -- <localdata.csv>` — 인허가 데이터에서 라멘 후보 TSV 추출 (파트너 시트에 붙여넣기)
2. 파트너 태깅 후 시트를 TSV로 내보내 `npm run sync-sheet -- <시트.tsv>` — 검증 통과 시 data/shops.json 갱신
3. `npm run diff-localdata -- <이전.csv> <최신.csv>` — 신규 오픈·폐업 감지 (월 1~2회)
