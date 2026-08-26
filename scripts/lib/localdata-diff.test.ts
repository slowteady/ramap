import { describe, it, expect } from "vitest";
import type { LocalDataRow } from "./localdata";
import { diffLocalData } from "./localdata-diff";

const row = (
  name: string,
  status: "open" | "closed" = "open",
): LocalDataRow => ({
  name,
  roadAddress: `서울 어딘가 ${name}`,
  status,
  category: "일식",
  x: null,
  y: null,
});

describe("diffLocalData", () => {
  it("최신에만 있는 라멘 후보를 신규로 감지한다", () => {
    const prev = [row("킨카라멘")];
    const next = [row("킨카라멘"), row("신상라멘")];
    const d = diffLocalData(prev, next);
    expect(d.opened.map((r) => r.name)).toEqual(["신상라멘"]);
    expect(d.closed).toHaveLength(0);
  });

  it("영업→폐업 전이를 폐업으로 감지한다", () => {
    const prev = [row("킨카라멘"), row("멘야무겐")];
    const next = [row("킨카라멘"), row("멘야무겐", "closed")];
    const d = diffLocalData(prev, next);
    expect(d.closed.map((r) => r.name)).toEqual(["멘야무겐"]);
    expect(d.opened).toHaveLength(0);
  });

  it("무변화면 아무것도 보고하지 않는다", () => {
    const rows = [row("킨카라멘")];
    const d = diffLocalData(rows, rows);
    expect(d.opened).toHaveLength(0);
    expect(d.closed).toHaveLength(0);
  });

  it("라멘 후보가 아닌 신규는 무시한다", () => {
    const d = diffLocalData([], [row("스시야")]);
    expect(d.opened).toHaveLength(0);
  });
});
