import { describe, it, expect } from "vitest";
import type { ShopRecord } from "./types";
import {
  mergeRecords,
  shouldReplace,
  visitedNext,
  wantNext,
} from "./record-ops";

const record = (over: Partial<ShopRecord>): ShopRecord => ({
  shopId: "kinka",
  status: "visited",
  count: 1,
  firstAt: null,
  lastAt: null,
  ...over,
});

describe("visitedNext", () => {
  it("신규는 count 1로 시작한다", () => {
    expect(visitedNext(undefined, "kinka")).toMatchObject({
      status: "visited",
      count: 1,
    });
  });

  it("want는 visited count 1로 전이한다", () => {
    expect(visitedNext(record({ status: "want", count: 0 }), "kinka")).toMatchObject({
      status: "visited",
      count: 1,
    });
  });

  it("visited는 count를 올리고 firstAt을 보존한다", () => {
    const next = visitedNext(
      record({ count: 2, firstAt: "2026-01-01T00:00:00.000Z" }),
      "kinka",
      new Date("2026-08-27"),
    );
    expect(next.count).toBe(3);
    expect(next.firstAt).toBe("2026-01-01T00:00:00.000Z");
    expect(next.lastAt).toBe("2026-08-27T00:00:00.000Z");
  });
});

describe("wantNext", () => {
  it("visited면 null을 반환한다 (변경 없음)", () => {
    expect(wantNext(record({}), "kinka")).toBeNull();
  });

  it("신규는 want 레코드를 만든다", () => {
    expect(wantNext(undefined, "kinka")).toMatchObject({ status: "want", count: 0 });
  });
});

describe("shouldReplace / mergeRecords", () => {
  it("count 큰 쪽과 want→visited 승격만 교체한다", () => {
    expect(shouldReplace(record({ count: 2 }), record({ count: 3 }))).toBe(true);
    expect(shouldReplace(record({ count: 3 }), record({ count: 2 }))).toBe(false);
    expect(
      shouldReplace(record({ status: "want", count: 0 }), record({ count: 1 })),
    ).toBe(true);
  });

  it("병합은 base 위에 incoming을 규칙대로 얹는다", () => {
    const base = [record({ shopId: "a", count: 3 }), record({ shopId: "b", count: 1 })];
    const incoming = [
      record({ shopId: "a", count: 1 }),
      record({ shopId: "b", count: 5 }),
      record({ shopId: "c", count: 1 }),
    ];
    const merged = mergeRecords(base, incoming);
    const byId = Object.fromEntries(merged.map((r) => [r.shopId, r.count]));
    expect(byId).toEqual({ a: 3, b: 5, c: 1 });
  });
});
