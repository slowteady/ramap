import { describe, expect, it } from "vitest";
import { visitSummary } from "./visit-summary";

const now = new Date("2026-10-28T12:00:00+09:00");

describe("visitSummary", () => {
  it("완식 전이면 null — 버튼 밖 상태 줄을 그리지 않는다", () => {
    expect(visitSummary(null, now)).toBeNull();
    expect(
      visitSummary({ visited: false, count: 0, lastAt: null }, now),
    ).toBeNull();
  });

  it("횟수와 최근 날짜 — 올해면 월.일", () => {
    expect(
      visitSummary(
        { visited: true, count: 3, lastAt: "2026-10-28T06:14:38.000Z" },
        now,
      ),
    ).toBe("완식 3회 · 최근 10.28");
  });

  it("지난해면 연도까지, 날짜가 없으면 횟수만", () => {
    expect(
      visitSummary(
        { visited: true, count: 1, lastAt: "2025-03-02T03:00:00.000Z" },
        now,
      ),
    ).toBe("완식 1회 · 최근 2025.3.2");
    expect(visitSummary({ visited: true, count: 2, lastAt: null }, now)).toBe(
      "완식 2회",
    );
  });
});
