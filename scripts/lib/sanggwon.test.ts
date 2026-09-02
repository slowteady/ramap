import { describe, expect, it } from "vitest";
import { isRamenBySanggwon, parseSanggwon, type SanggwonRow } from "./sanggwon";

const CSV = `"상가업소번호","상호명","지점명","상권업종소분류코드","시군구명","행정동명","도로명주소","경도","위도"
"1","멘야준","","I20301","마포구","서교동","서울 마포구 어울마당로 1","126.92","37.55"
"2","수유리우동집","","I20303","강북구","수유동","서울 강북구 도봉로 2","127.02","37.63"
"3","아오리의행방불명","","I20303","노원구","상계동","서울 노원구 동일로 3","127.06","37.65"
"4","분식왕","","I21001","강남구","역삼동","서울 강남구 테헤란로 4","127.03","37.50"`;

describe("parseSanggwon", () => {
  it("헤더 매핑·좌표 파싱", () => {
    const rows = parseSanggwon(CSV);
    expect(rows).toHaveLength(4);
    expect(rows[0]).toMatchObject({
      name: "멘야준",
      smallCode: "I20301",
      lat: 37.55,
      lng: 126.92,
    });
  });
});

describe("isRamenBySanggwon", () => {
  const rows = parseSanggwon(CSV);
  const by = Object.fromEntries(rows.map((r) => [r.name, r]));

  it("키워드는 소분류 무관 통과 (I20303 밖 오분류 커버)", () => {
    expect(isRamenBySanggwon(by["멘야준"])).toBe(true);
  });

  it("I20303이라도 제외어(우동)는 탈락", () => {
    expect(isRamenBySanggwon(by["수유리우동집"])).toBe(false);
  });

  it("I20303 + 제외어 없음은 발굴 후보로 통과", () => {
    expect(isRamenBySanggwon(by["아오리의행방불명"])).toBe(true);
  });

  it("키워드도 I20303도 아니면 탈락", () => {
    expect(isRamenBySanggwon(by["분식왕"])).toBe(false);
  });

  it("지점명에 키워드가 있어도 통과", () => {
    const row: SanggwonRow = {
      name: "쇼부",
      branch: "일본라멘강남점",
      smallCode: "I21001",
      district: "서초구",
      dong: "반포동",
      roadAddress: "",
      lat: null,
      lng: null,
    };
    expect(isRamenBySanggwon(row)).toBe(true);
  });
});
