import { describe, expect, it } from "vitest";
import { checkedMonthLabel, michelinLabel, splitAreaPicks } from "./area-picks";

const shops = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];

describe("splitAreaPicks — 추천 구역과 나머지 목록", () => {
  it("추천은 데이터 순서대로, 나머지는 원래 순서에서 추천을 뺀다", () => {
    const { picks, rest } = splitAreaPicks(shops, ["c", "a"]);
    expect(picks.map((s) => s.id)).toEqual(["c", "a"]);
    expect(rest.map((s) => s.id)).toEqual(["b", "d"]);
  });

  it("이 지역 목록에 없는 추천 id는 건너뛴다 — 폐업·지역 변경", () => {
    const { picks, rest } = splitAreaPicks(shops, ["x", "b"]);
    expect(picks.map((s) => s.id)).toEqual(["b"]);
    expect(rest).toHaveLength(3);
  });

  it("추천이 없으면 전부 나머지", () => {
    const { picks, rest } = splitAreaPicks(shops, []);
    expect(picks).toEqual([]);
    expect(rest).toEqual(shops);
  });
});

describe("문구", () => {
  it("미쉐린 표시는 선정 연도를 붙인다", () => {
    expect(michelinLabel(2026)).toBe("미쉐린 빕 구르망 2026");
  });

  it("확인 시점은 연·월로", () => {
    expect(checkedMonthLabel("2026-11-01")).toBe("2026년 11월");
  });

  it("확인 날짜가 없으면 빈 문자열", () => {
    expect(checkedMonthLabel("")).toBe("");
  });
});
