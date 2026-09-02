import { describe, expect, it } from "vitest";
import type { LocalDataRow } from "./localdata";
import {
  candidatesToSheetTsv,
  discoverByName,
  mergeCandidates,
  normalizeShopName,
} from "./merge-candidates";
import type { SanggwonRow } from "./sanggwon";

const local = (over: Partial<LocalDataRow>): LocalDataRow => ({
  name: "멘야준",
  roadAddress: "서울 마포구 어울마당로 1",
  status: "open",
  category: "일식",
  x: 192000,
  y: 450000,
  ...over,
});

const sang = (over: Partial<SanggwonRow>): SanggwonRow => ({
  name: "멘야준",
  branch: "",
  smallCode: "I20301",
  district: "마포구",
  dong: "서교동",
  roadAddress: "서울 마포구 어울마당로 1",
  lat: null,
  lng: null,
  ...over,
});

describe("normalizeShopName", () => {
  it("공백·기호·법인 표기를 제거한다", () => {
    expect(normalizeShopName("(주) 멘야 준!")).toBe("멘야준");
  });
});

describe("mergeCandidates", () => {
  it("정규화 부분 매칭으로 병합하고 출처를 합친다", () => {
    const merged = mergeCandidates(
      [local({ name: "쇼부" })],
      [sang({ name: "쇼부일본라멘", branch: "강남점" })],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].sources).toEqual(["인허가", "상가"]);
  });

  it("미매칭 상가 행은 신규 후보로 추가한다", () => {
    const merged = mergeCandidates(
      [local({})],
      [
        sang({
          name: "아오리의행방불명",
          smallCode: "I20303",
          lat: 37.65,
          lng: 127.06,
        }),
      ],
    );
    expect(merged).toHaveLength(2);
    expect(merged[1].sources).toEqual(["상가I20303"]);
    expect(merged[1].lat).toBe(37.65);
  });

  it("1자 이름은 부분 매칭하지 않는다 (2자부터 허용 — 쇼부·킨카)", () => {
    const merged = mergeCandidates(
      [local({ name: "준" })],
      [sang({ name: "멘야준" })],
    );
    expect(merged).toHaveLength(2);
  });

  it("같은 이름이라도 500m 밖이면 별도 매장 (체인 다지점 보존)", () => {
    const merged = mergeCandidates(
      [],
      [
        sang({
          name: "아오리의행방불명",
          smallCode: "I20303",
          lat: 37.65,
          lng: 127.06,
        }),
        sang({
          name: "아오리의행방불명",
          smallCode: "I20303",
          lat: 37.5,
          lng: 127.03,
        }),
      ],
    );
    expect(merged).toHaveLength(2);
  });

  it("좌표 없으면 주소의 구가 다를 때 별도 매장", () => {
    const merged = mergeCandidates(
      [
        local({
          x: null,
          y: null,
          roadAddress: "서울특별시 마포구 어울마당로 1",
        }),
      ],
      [sang({ roadAddress: "서울 강남구 테헤란로 4" })],
    );
    expect(merged).toHaveLength(2);
  });

  it("근접 좌표(150~500m)는 병합하되 좌표 불일치 플래그", () => {
    const merged = mergeCandidates(
      [],
      [
        sang({ name: "킨카", lat: 37.55, lng: 127.0 }),
        sang({ name: "킨카", lat: 37.552, lng: 127.0 }),
      ],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].coordMismatch).toBe(true);
  });
});

describe("candidatesToSheetTsv", () => {
  it("I20303 단독 발굴·좌표 불일치를 메모에 담는다", () => {
    const tsv = candidatesToSheetTsv(
      mergeCandidates(
        [],
        [sang({ name: "산쪼메", smallCode: "I20303", lat: 37.5, lng: 127.0 })],
      ),
    );
    expect(tsv).toContain("I20303 발굴");
    expect(tsv).toContain("시딩v2(상가I20303)");
  });
});

describe("discoverByName", () => {
  it("후보 풀 밖의 이름을 인허가에서 완전 일치로 발굴한다", () => {
    const candidates = mergeCandidates([local({ name: "멘야준" })], []);
    const added = discoverByName(
      candidates,
      [
        local({ name: "담 택" }),
        local({ name: "담택별관", status: "open" }),
        local({ name: "류진", status: "closed" }),
      ],
      ["담택", "류진"],
    );
    expect(added).toBe(1);
    expect(candidates.map((c) => c.name)).toContain("담 택");
  });
});

describe("인허가 내부 중복", () => {
  it("같은 이름·같은 자리 재인허가 2행은 1건으로 합친다", () => {
    const merged = mergeCandidates(
      [local({ name: "유즈라멘" }), local({ name: "유즈라멘" })],
      [],
    );
    expect(merged).toHaveLength(1);
  });
});
