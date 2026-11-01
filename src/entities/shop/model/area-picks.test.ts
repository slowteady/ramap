import { describe, expect, it } from "vitest";
import { EMPTY_AREA_PICKS, toAreaPicks } from "./area-picks";

describe("toAreaPicks — 추천 데이터 내로잉", () => {
  it("올바른 데이터는 그대로 읽는다", () => {
    const raw = {
      checkedAt: "2026-11-01",
      areas: { 망원: ["huiok", "ryujin"] },
      michelinBibGourmand: { damtaek: 2026 },
    };
    expect(toAreaPicks(raw)).toEqual(raw);
  });

  it("객체가 아니면 빈 추천", () => {
    expect(toAreaPicks(null)).toEqual(EMPTY_AREA_PICKS);
    expect(toAreaPicks("x")).toEqual(EMPTY_AREA_PICKS);
  });

  it("형식이 틀린 지역·미쉐린 항목은 버린다", () => {
    const picks = toAreaPicks({
      checkedAt: "2026-11-01",
      areas: { 망원: ["huiok", 3], 홍대: "mennyasu" },
      michelinBibGourmand: { damtaek: 2026, sarukame: "2026" },
    });
    expect(picks.areas).toEqual({ 망원: ["huiok"] });
    expect(picks.michelinBibGourmand).toEqual({ damtaek: 2026 });
  });

  it("확인 날짜가 없으면 빈 문자열", () => {
    expect(toAreaPicks({ areas: {} }).checkedAt).toBe("");
  });
});
