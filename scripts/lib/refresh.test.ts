import { describe, expect, it } from "vitest";
import type { LocalDataRow } from "./localdata";
import { classifyRefresh, type KnownRow } from "./refresh";

const fresh = (over: Partial<LocalDataRow>): LocalDataRow => ({
  name: "잇짱라멘",
  roadAddress:
    "서울특별시 강남구 학동로4길 20, 명진빌딩 지상1층 101호 (논현동)",
  status: "open",
  category: "일식",
  x: 203000,
  y: 445000,
  ...over,
});

const known = (over: Partial<KnownRow>): KnownRow => ({
  name: "잇짱라멘",
  branch: "",
  roadAddress:
    "서울특별시 강남구 학동로4길 20, 명진빌딩 지상1층 101호 (논현동)",
  published: true,
  ...over,
});

describe("classifyRefresh — LOCALDATA 최신본과 기지 후보 대조", () => {
  it("기지 후보가 최신본에서도 영업 중이면 아무 변화도 보고하지 않는다", () => {
    const r = classifyRefresh([fresh({})], [known({})]);
    expect(r.newCandidates).toEqual([]);
    expect(r.closed).toEqual([]);
    expect(r.unmatched).toEqual([]);
  });

  it("상세 호수·괄호부가 달라도 같은 도로명 건물번호면 같은 매장으로 본다", () => {
    const r = classifyRefresh(
      [fresh({ roadAddress: "서울특별시 강남구 학동로4길 20, 2층 (논현동)" })],
      [known({})],
    );
    expect(r.newCandidates).toEqual([]);
    expect(r.unmatched).toEqual([]);
  });

  it("기지 후보의 최신 행이 폐업이면 closed로 보고한다", () => {
    const closedRow = fresh({ status: "closed" });
    const r = classifyRefresh([closedRow], [known({})]);
    expect(r.closed).toEqual([{ known: known({}), fresh: closedRow }]);
    expect(r.newCandidates).toEqual([]);
  });

  it("폐업 행과 영업 행이 같은 자리에 공존하면(재인허가) 영업으로 본다", () => {
    const r = classifyRefresh(
      [fresh({ status: "closed" }), fresh({ status: "open" })],
      [known({})],
    );
    expect(r.closed).toEqual([]);
  });

  it("게재 매장이 최신본에서 아예 사라지면 unmatched로 보고하고, 미게재 후보는 무시한다", () => {
    const r = classifyRefresh(
      [],
      [known({}), known({ name: "보류라멘", published: false })],
    );
    expect(r.unmatched).toEqual([known({})]);
  });

  it("라멘 키워드 상호인데 기지 후보에 없는 영업 행은 신규 후보다", () => {
    const row = fresh({
      name: "멘야하나비 성수점",
      roadAddress: "서울특별시 성동구 연무장길 10 (성수동2가)",
    });
    const r = classifyRefresh([row], [known({})]);
    expect(r.newCandidates).toEqual([row]);
  });

  it("같은 이름이라도 주소가 다르면 별도 지점이라 신규 후보다", () => {
    const row = fresh({
      roadAddress: "서울특별시 송파구 올림픽로 300 (신천동)",
    });
    const r = classifyRefresh([row], [known({})]);
    expect(r.newCandidates).toEqual([row]);
  });

  it("키워드 없는 상호·폐업 행·업태 무관 행은 신규 후보에서 제외한다", () => {
    const r = classifyRefresh(
      [
        fresh({ name: "김밥천국", roadAddress: "서울특별시 중구 세종대로 1" }),
        fresh({
          name: "라멘연구소",
          roadAddress: "서울특별시 중구 세종대로 2",
          status: "closed",
        }),
      ],
      [],
    );
    expect(r.newCandidates).toEqual([]);
  });

  it("행정구역 개편으로 주소 접두부가 바뀌어도 도로명+건물번호가 같으면 같은 매장이다", () => {
    const k = known({
      name: "코이라멘",
      branch: "평택고덕점",
      roadAddress: "경기도 평택시 고덕여염10길 88",
    });
    const row = fresh({
      name: "코이라멘평택고덕점",
      roadAddress: "경기도 평택시 고덕면 고덕여염10길 88, 1층",
    });
    const r = classifyRefresh([row], [k]);
    expect(r.newCandidates).toEqual([]);
    expect(r.unmatched).toEqual([]);
  });

  it("시군구가 없는 세종(시도 중복 표기 포함)은 시도만 같아도 같은 건물로 본다", () => {
    const k = known({
      name: "멘야시오",
      roadAddress: "세종특별자치시 세종특별자치시 한누리대로 287",
    });
    const row = fresh({
      name: "멘야시오",
      roadAddress:
        "세종특별자치시 한누리대로 287, 세종포레뷰1 1층 103호 (나성동)",
    });
    const r = classifyRefresh([row], [k]);
    expect(r.newCandidates).toEqual([]);
    expect(r.unmatched).toEqual([]);
  });

  it("도로명+번호만 같고 지역 토큰이 하나도 안 겹치면 다른 매장이다", () => {
    const k = known({
      name: "라멘연구소",
      roadAddress: "서울특별시 중구 세종대로 1",
    });
    const row = fresh({
      name: "라멘연구소",
      roadAddress: "경기도 성남시 수정구 세종대로 1",
    });
    const r = classifyRefresh([row], [k]);
    expect(r.newCandidates).toEqual([row]);
    expect(r.unmatched).toEqual([k]);
  });

  it("신규 후보 안의 중복(같은 이름+같은 건물)은 하나로 접는다", () => {
    const a = fresh({
      name: "라멘연구소",
      roadAddress: "서울특별시 중구 세종대로 2, 1층 (태평로1가)",
    });
    const b = fresh({
      name: "라멘연구소",
      roadAddress: "서울특별시 중구 세종대로 2, 2층 (태평로1가)",
    });
    const r = classifyRefresh([a, b], []);
    expect(r.newCandidates).toEqual([a]);
  });
});
