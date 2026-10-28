import { describe, expect, it } from "vitest";
import type { ShopRecord } from "./types";
import {
  mergeRecord,
  mergeRecords,
  normalizeRecord,
  toggledSaved,
  visitAdded,
  visitCleared,
} from "./record-ops";

const record = (over: Partial<ShopRecord>): ShopRecord => ({
  shopId: "kinka",
  visited: false,
  saved: false,
  count: 0,
  firstAt: null,
  lastAt: null,
  ...over,
});

describe("visitAdded", () => {
  it("첫 완식은 visited on, count 1, 날짜 기록", () => {
    const next = visitAdded(null, "kinka", new Date("2026-08-26"));
    expect(next).toMatchObject({ visited: true, saved: false, count: 1 });
    expect(next.firstAt).toBe("2026-08-26T00:00:00.000Z");
  });

  it("다시 누르면 count 증가 — 해제되지 않는다, firstAt 보존·lastAt 갱신", () => {
    const next = visitAdded(
      record({ visited: true, count: 2, firstAt: "2026-01-01T00:00:00.000Z" }),
      "kinka",
      new Date("2026-09-01"),
    );
    expect(next).toMatchObject({ visited: true, count: 3 });
    expect(next.firstAt).toBe("2026-01-01T00:00:00.000Z");
    expect(next.lastAt).toBe("2026-09-01T00:00:00.000Z");
  });

  it("저장만 돼 있던 매장은 saved 보존 + count 1", () => {
    expect(visitAdded(record({ saved: true }), "kinka")).toMatchObject({
      visited: true,
      saved: true,
      count: 1,
    });
  });
});

describe("visitCleared", () => {
  it("saved 없으면 행 삭제(null), 있으면 saved만 남는다", () => {
    expect(visitCleared(record({ visited: true, count: 3 }))).toBeNull();
    expect(
      visitCleared(record({ visited: true, saved: true, count: 3 })),
    ).toMatchObject({ visited: false, saved: true, count: 0 });
  });

  it("기록이 없으면 null", () => {
    expect(visitCleared(null)).toBeNull();
  });
});

describe("toggledSaved", () => {
  it("완식한 매장도 저장할 수 있다 (공존)", () => {
    const next = toggledSaved(record({ visited: true, count: 1 }), "kinka");
    expect(next).toMatchObject({ visited: true, saved: true, count: 1 });
  });

  it("저장 해제 — visited 없으면 null, 있으면 visited 유지", () => {
    expect(toggledSaved(record({ saved: true }), "kinka")).toBeNull();
    expect(
      toggledSaved(record({ visited: true, saved: true, count: 1 }), "kinka"),
    ).toMatchObject({ visited: true, saved: false });
  });
});

describe("mergeRecord / mergeRecords", () => {
  it("visited·saved는 OR, count는 max, 날짜는 min/max", () => {
    const merged = mergeRecord(
      record({
        visited: true,
        count: 1,
        firstAt: "2026-02-01T00:00:00.000Z",
        lastAt: "2026-02-01T00:00:00.000Z",
      }),
      record({
        saved: true,
        count: 2,
        firstAt: "2026-01-01T00:00:00.000Z",
        lastAt: "2026-03-01T00:00:00.000Z",
      }),
    );
    expect(merged).toEqual({
      shopId: "kinka",
      visited: true,
      saved: true,
      count: 2,
      firstAt: "2026-01-01T00:00:00.000Z",
      lastAt: "2026-03-01T00:00:00.000Z",
    });
  });

  it("mergeRecords는 id별 병합", () => {
    const merged = mergeRecords(
      [record({ shopId: "a", visited: true, count: 1 })],
      [
        record({ shopId: "a", saved: true }),
        record({ shopId: "b", saved: true }),
      ],
    );
    const byId = Object.fromEntries(merged.map((r) => [r.shopId, r]));
    expect(byId.a).toMatchObject({ visited: true, saved: true });
    expect(byId.b).toMatchObject({ visited: false, saved: true });
  });
});

describe("normalizeRecord (구 포맷 호환)", () => {
  it("v1 status 포맷을 변환한다", () => {
    expect(
      normalizeRecord({
        shopId: "kinka",
        status: "visited",
        count: 2,
        firstAt: null,
        lastAt: null,
      }),
    ).toMatchObject({ visited: true, saved: false, count: 2 });
    expect(
      normalizeRecord({
        shopId: "kinka",
        status: "want",
        count: 0,
        firstAt: null,
        lastAt: null,
      }),
    ).toMatchObject({ visited: false, saved: true });
  });

  it("둘 다 false거나 형식이 틀리면 null", () => {
    expect(normalizeRecord({ shopId: "kinka" })).toBeNull();
    expect(normalizeRecord("junk")).toBeNull();
  });
});
