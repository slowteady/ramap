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

  it("광역시는 구·군 단위", () => {
    expect(regionDistrictOf("인천광역시 부평구 부평대로 1")).toBe("부평구");
    expect(regionDistrictOf("부산광역시 해운대구 우동 1")).toBe("해운대구");
    expect(regionDistrictOf("부산광역시 기장군 기장읍 1")).toBe("기장군");
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

describe("전국 시도", () => {
  it("특별자치도·통합특별시 명칭을 인식한다", () => {
    expect(sidoOf("강원특별자치도 춘천시 중앙로 1")).toBe("강원");
    expect(regionDistrictOf("강원특별자치도 춘천시 중앙로 1")).toBe("춘천시");
    expect(sidoOf("전북특별자치도 전주시 완산구 전주객사3길 22")).toBe("전북");
    expect(regionDistrictOf("전북특별자치도 전주시 완산구 A")).toBe("전주시");
    expect(sidoOf("전남광주통합특별시 완도군 완도읍 개포로145번길 23")).toBe(
      "전남광주",
    );
    expect(
      regionDistrictOf("전남광주통합특별시 완도군 완도읍 개포로145번길 23"),
    ).toBe("완도군");
    expect(sidoOf("제주특별자치도 제주시 관덕로 1")).toBe("제주");
  });
});
