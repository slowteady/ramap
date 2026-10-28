---
status: 유효
date: 2026-09-05
---

# 얇은 매장 페이지는 색인에서 뺀다

## 맥락

시드 데이터의 상당수 매장은 이름·주소·장르뿐이다(2026-09-05 기준 414곳). 이런 페이지 수백 개를 한꺼번에 색인시키면 구글 스팸 정책의 scaled content(대량 저품질 콘텐츠) 대상이 된다.

## 결정

- `isThinShop(shop)`: 영업시간·메뉴·스프 세부·사진·한줄소개가 모두 없으면 얇은 페이지(아부라소바 형태는 예외로 얇지 않음)
- 얇은 매장은 metadata `robots: { index: false }` + 사이트맵 제외. 페이지와 내부 링크는 유지
- 데이터가 보강되면 다음 빌드에서 자동으로 색인 대상에 복귀
- 색인 제외 기준은 정보 부족뿐이다(`shouldNoindexShop` = `isThinShop`). 폐업 여부는 기준이 아니다 → [0012](0012-closed-shop-page-indexing.md)

## 근거

- 2026-09-05 SEO 딥리서치: 구글 spam-policies(scaled content abuse)·helpful-content
- 데이터 보강이 곧 색인 확대가 되도록 규칙을 데이터에서 계산한다(수동 플래그 없음)
