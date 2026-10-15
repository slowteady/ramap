import { describe, expect, it } from "vitest";
import type { LocalDataRow } from "./localdata";
import {
  classifyRefresh,
  isTemporaryVenue,
  type ExclusionRow,
  type KnownRow,
} from "./refresh";

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

  it("이미 폐업 처리된 기지 후보는 폐업 전이로 다시 보고하지 않는다", () => {
    const r = classifyRefresh(
      [fresh({ status: "closed" })],
      [known({ alreadyClosed: true })],
    );
    expect(r.closed).toEqual([]);
    expect(r.unmatched).toEqual([]);
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

  it("축제장·행사장·푸드트럭 같은 임시 영업장은 신규 후보 대신 excluded로 보고한다", () => {
    const festival = fresh({
      name: "후우미라멘",
      roadAddress: "경상북도 구미시 송정동 505 2026 구미푸드페스티벌 축제장 내",
    });
    const r = classifyRefresh([festival], []);
    expect(r.newCandidates).toEqual([]);
    expect(r.excluded).toEqual([{ row: festival, reason: "임시 영업장" }]);
  });

  it("제외 목록(상호+같은 건물)에 있는 행은 사유와 함께 excluded로 보고하고 다시 신규로 올리지 않는다", () => {
    const dup = fresh({
      name: "초이라멘",
      roadAddress: "서울특별시 종로구 새문안로5길 13, 지하1층 제35호 (당주동)",
    });
    const exclusions: ExclusionRow[] = [
      {
        name: "초이라멘",
        roadAddress: "서울특별시 종로구 새문안로5길 13",
        reason: "광화문점 인허가 이형(세종대로23길 54와 동일 매장)",
      },
    ];
    const r = classifyRefresh([dup], [], exclusions);
    expect(r.newCandidates).toEqual([]);
    expect(r.excluded).toEqual([
      { row: dup, reason: "광화문점 인허가 이형(세종대로23길 54와 동일 매장)" },
    ]);
  });

  it("제외 목록은 같은 상호라도 다른 건물이면 적용하지 않는다", () => {
    const other = fresh({
      name: "초이라멘",
      roadAddress: "강원특별자치도 원주시 건강로 21-1, 1층 107호 (반곡동)",
    });
    const r = classifyRefresh(
      [other],
      [],
      [
        {
          name: "초이라멘",
          roadAddress: "서울특별시 종로구 새문안로5길 13",
          reason: "중복",
        },
      ],
    );
    expect(r.newCandidates).toEqual([other]);
    expect(r.excluded).toEqual([]);
  });
});

describe("isTemporaryVenue — 주소·상호로 드러나는 임시 영업장", () => {
  it.each([
    [
      "경상북도 구미시 송정동 505 2026 구미푸드페스티벌 축제장 내",
      "후우미라멘",
    ],
    ["서울특별시 송파구 올림픽로 25, 행사장 부스 12 (잠실동)", "라멘부스"],
    ["경기도 수원시 팔달구 효원로 1 (푸드트럭)", "트럭라멘"],
    ["부산광역시 해운대구 해운대해변로 264", "박람회 라멘관"],
  ])("%s / %s 는 임시 영업장이다", (addr, name) => {
    expect(isTemporaryVenue(addr, name)).toBe(true);
  });

  it("일반 상가 주소는 임시 영업장이 아니다", () => {
    expect(
      isTemporaryVenue(
        "서울특별시 동작구 신대방11길 35, 1층 우측 2호 A호 (신대방동)",
        "카잇푸도라멘",
      ),
    ).toBe(false);
  });
});
