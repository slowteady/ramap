import { describe, expect, it } from "vitest";
import { areaMapHref } from "./map-href";

describe("areaMapHref", () => {
  it("지역 페이지는 그 지역을 지도에 띄운다", () => {
    expect(areaMapHref("성수")).toBe(`/?area=${encodeURIComponent("성수")}`);
  });

  it("지역×장르 페이지는 장르 필터와 지역을 함께 넘긴다", () => {
    const params = new URLSearchParams(
      areaMapHref("홍대·합정", { soup: "tonkotsu" }).slice(2),
    );
    expect(params.get("soup")).toBe("tonkotsu");
    expect(params.get("area")).toBe("홍대·합정");
  });
});
