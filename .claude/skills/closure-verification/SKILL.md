---
name: closure-verification
description: Use when deciding whether a ramap shop is permanently closed, moved, or still open — before setting 상태=폐업, before publishing a closed shop page, when LOCALDATA reports a closure, or when a user report says a shop closed
---

# 폐업 검증 (라맵)

## 왜 엄격한가

폐업이 아닌 가게를 "폐업"으로 공개하면 영업 방해·명예훼손 소지가 있다(2026-10-19 PO). 2026-10 라운드에서 "검색 흔적 없음"만으로 폐업 처리한 매장 중 4곳 이상이 실제로 영업 중이었다(모리라멘&돈카츠·호랭이라멘·993라멘 등 — 인허가가 명의변경·재인허가로 '폐업'이 찍힌 경우).

**원칙: 폐업은 직접 증거로만 확정한다. 흔적이 없다는 사실은 증거가 아니다.**

공개 규칙(코드로 강제): `data/closure-verification.json` 장부에 있는 매장만 `[폐업]`/`[이전]` 페이지가 열린다. 장부에 없는 `상태=폐업` 매장은 페이지 404·사이트맵 제외(`closurePublicState`, `src/entities/shop/model/closure.ts`).

## 절차

1. **대상 모으기** — LOCALDATA 폐업 전이(`refresh-closed.tsv`), 사용자 폐업 제보, 재검증할 기존 폐업 매장
2. **증거 수집** — 대상 TSV(헤더 `상호 지점명 주소 게재 폐업일자 관리번호 같은건물영업중`, 게재=Y)를 디렉터리에 두고
   `npm run collect-evidence -- <디렉터리> <출력.json>` → `<출력>.txt` 요약을 처음부터 끝까지 읽는다
3. **항목별 판정** — 아래 판정표. 판정마다 근거(출처 종류·날짜·URL/문구)를 남긴다
4. **반영**
   - 확정 폐업 → `data/closure-verification.json`에 `{"verdict":"closed","checkedAt","evidence":[…]}` + candidates `상태=폐업`·`상태변경일`
   - 이전 → `{"verdict":"moved",…,"movedTo":"<새 매장 id>"}` (새 주소가 우리 데이터에 없으면 신규 후보로 추가)
   - 영업 중(오판) → candidates `상태=영업`으로 되돌리고 메모에 근거. 장부에서 삭제
   - 미확정 → 장부에 넣지 않는다(페이지는 계속 비공개). 다음 라운드 재검증 목록에 남긴다
5. **재생성·검수** — `npm run enrich-candidates -- data/out/candidates.tsv data/enrichment/*.json` → `npm run sync-sheet -- data/out/seed.tsv` → shops.json diff로 의도한 매장만 바뀌었는지 확인

## 판정표

### 영업 중 (폐업 아님) — 하나라도 있으면

- Daum 장소 카드가 **같은 주소(도로명+번호, 같은 건물·호수)** 로 "영업중" 또는 "영업종료"(= 오늘 영업 마감, 폐업 아님)와 영업시간 표기
- **폐업일 이후 날짜의 방문 후기**(블로그·카페 본문, 메뉴·방문 서술이 있는 글)
- 가게 공식 채널(인스타 등)의 폐업일 이후 영업 게시물

### 이전 — 아래를 모두

- 같은 상호의 장소 카드·후기가 **다른 주소**에서 영업 중
- "이전", "이전오픈", "자리를 옮겼다" 등 이전을 직접 말하는 글, 또는 구 주소의 폐업 + 신 주소의 같은 시기 신규 인허가

### 확정 폐업 — 직접 증거 1개 이상 **그리고** 반대 증거 0개

직접 증거:
- 국세청 기준 "폐업" 표기와 폐업일(꾸다체크 등 사업자 조회 결과)
- 같은 자리(같은 호수)에 **다른 가게**가 영업 중임이 확인됨(새 인허가 + 그 가게 장소 카드·후기). "○○가 있던 자리" 같은 서술
- 가게 공식 채널의 폐업 공지
- 라멘갤 등 커뮤니티의 구체적 폐업 서술(날짜·주소 특정, "마지막 영업일" 등)
- (도입 시) Google Places `businessStatus = CLOSED_PERMANENTLY`

반대 증거가 하나라도 있으면 확정하지 않는다(영업 중 또는 미확정).

### 미확정 — 위에 해당하지 않으면 전부

"장소 카드 없음 + 후기 없음"은 미확정이다. 개업 직후·검색 노출 부족·명의변경과 구별할 수 없다.

## 증거로 쓰지 않는 것

- 순위닷·메디컬맵·카맵·지역누리·타운커넥트·다이닝코드 목록 등 **인허가 재게시 디렉터리**(날짜가 최근이어도 무효 — 영업·폐업 어느 쪽 근거도 아님)
- 검색어가 되돌아온 제목·광고 문구
- 날짜 없는 후기 조각
- LOCALDATA 폐업 신고 단독(트리거일 뿐, 명의변경·재인허가로도 찍힌다)

## 장부 형식

```json
{
  "kanda-soba-x": {
    "verdict": "closed",
    "checkedAt": "2026-10-19",
    "evidence": ["꾸다체크 국세청 기준 2022-11-10 폐업", "같은 자리 '모모라멘' 영업(블로그 2026-09-18)"]
  },
  "tamu-ramen-hwasun": {
    "verdict": "moved",
    "checkedAt": "2026-10-19",
    "evidence": ["Daum 장소 카드가 사계남로 155-1로만 노출, 블로그 '이전'"],
    "movedTo": "tamuramen-2"
  }
}
```

## 보고

PR·답변에는 판정별 건수 표와, 영업 중으로 되돌린 매장·이전 매장 목록을 근거와 함께 적는다. 미확정은 "비공개 유지, 다음 라운드 재검증"으로 명시한다.
