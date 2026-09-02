import { describe, expect, it } from "vitest";
import { areaLabelOf, dongOf, inheritNearestArea } from "./area-label";

describe("dongOf", () => {
  it("괄호부 첫 토큰에서 법정동을 뽑는다", () => {
    expect(dongOf("서울특별시 강남구 테헤란로4길 6, 지상1층 (역삼동)")).toBe(
      "역삼동",
    );
    expect(dongOf("서울특별시 중구 만리재로 217 (만리동1가, 1층)")).toBe(
      "만리동1가",
    );
    expect(dongOf("서울특별시 영등포구 선유로49길 30-1, 1층 (양평동4가)")).toBe(
      "양평동4가",
    );
  });

  it("괄호가 없거나 동이 아니면 null", () => {
    expect(dongOf("서울특별시 용산구 이태원로 230-1")).toBeNull();
    expect(dongOf("서울특별시 구로구 디지털로 288 (A동)")).toBeNull();
    expect(dongOf(null)).toBeNull();
  });
});

describe("areaLabelOf", () => {
  it("구+법정동으로 상권 라벨을 찾는다", () => {
    expect(areaLabelOf("서울 마포구 어울마당로 (서교동)", "마포구")).toBe(
      "홍대",
    );
    expect(areaLabelOf("서울 광진구 능동로 (자양동)", "광진구")).toBe("건대");
    expect(areaLabelOf("서울 중구 만리재로 (만리동1가)", "중구")).toBe(
      "서울역",
    );
  });

  it("동명이 중복돼도 구로 구분한다", () => {
    expect(areaLabelOf("서울 강남구 도산대로 (신사동)", "강남구")).toBe("신사");
    expect(areaLabelOf("서울 은평구 연서로 (신사동)", "은평구")).toBeNull();
  });

  it("사전에 없으면 null", () => {
    expect(areaLabelOf("서울 어딘가 (없는동)", "강남구")).toBeNull();
    expect(
      areaLabelOf("서울특별시 용산구 이태원로 230-1", "용산구"),
    ).toBeNull();
  });
});

describe("inheritNearestArea", () => {
  it("라벨 없는 매장은 1.5km 내 최근접 라벨을 상속한다", () => {
    const rows = [
      { lat: 37.556, lng: 126.922, areaLabel: "홍대" },
      { lat: 37.557, lng: 126.925, areaLabel: null },
    ];
    expect(inheritNearestArea(rows)[1].areaLabel).toBe("홍대");
  });

  it("1.5km 밖이면 상속하지 않는다", () => {
    const rows = [
      { lat: 37.556, lng: 126.922, areaLabel: "홍대" },
      { lat: 37.51, lng: 127.06, areaLabel: null },
    ];
    expect(inheritNearestArea(rows)[1].areaLabel).toBeNull();
  });

  it("좌표 없는 매장과 기존 라벨은 그대로 둔다", () => {
    const rows = [
      { lat: 37.556, lng: 126.922, areaLabel: "홍대" },
      { lat: null, lng: null, areaLabel: null },
      { lat: 37.5561, lng: 126.9221, areaLabel: "연남" },
    ];
    const out = inheritNearestArea(rows);
    expect(out[1].areaLabel).toBeNull();
    expect(out[2].areaLabel).toBe("연남");
  });
});
