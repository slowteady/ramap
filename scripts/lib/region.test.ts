import { describe, expect, it } from "vitest";
import { regionDistrictOf, sidoOf } from "./region";

describe("sidoOf", () => {
  it("주소 첫 토큰에서 시도를 뽑는다", () => {
    expect(sidoOf("서울특별시 마포구 어울마당로 136-13")).toBe("서울");
    expect(sidoOf("경기도 수원시 팔달구 정조로 800")).toBe("경기");
    expect(sidoOf("경기도 오산시 궐동로 8")).toBe("경기");
    expect(sidoOf("인천광역시 연수구 송도동 1")).toBe("인천");
  });

  it("판별 불가면 null", () => {
    expect(sidoOf("")).toBeNull();
    expect(sidoOf("어딘가 12")).toBeNull();
  });
});

describe("regionDistrictOf", () => {
  it("서울은 구 단위", () => {
    expect(regionDistrictOf("서울특별시 마포구 어울마당로 136-13")).toBe(
      "마포구",
    );
  });

  it("경기는 시·군 단위 (구가 있어도 시로)", () => {
    expect(regionDistrictOf("경기도 수원시 팔달구 정조로 800")).toBe("수원시");
    expect(regionDistrictOf("경기도 오산시 궐동로 8")).toBe("오산시");
    expect(regionDistrictOf("경기도 양평군 양평읍 양근로 1")).toBe("양평군");
  });

  it("판별 불가면 null", () => {
    expect(regionDistrictOf("")).toBeNull();
  });
});
