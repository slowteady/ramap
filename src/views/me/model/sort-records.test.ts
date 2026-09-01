import { describe, expect, it } from "vitest";
import type { ShopRecord } from "@/entities/record";
import { sortRecordsByRecent } from "./sort-records";

const record = (over: Partial<ShopRecord>): ShopRecord => ({
  shopId: "kinka",
  status: "visited",
  count: 1,
  firstAt: null,
  lastAt: null,
  ...over,
});

describe("sortRecordsByRecent", () => {
  it("lastAt 우선 최신순, 없으면 firstAt, 둘 다 없으면 뒤로", () => {
    const sorted = sortRecordsByRecent([
      record({ shopId: "a", firstAt: "2026-08-01T00:00:00.000Z" }),
      record({ shopId: "b" }),
      record({ shopId: "c", lastAt: "2026-09-01T00:00:00.000Z" }),
      record({
        shopId: "d",
        firstAt: "2026-01-01T00:00:00.000Z",
        lastAt: "2026-08-15T00:00:00.000Z",
      }),
    ]);
    expect(sorted.map((r) => r.shopId)).toEqual(["c", "d", "a", "b"]);
  });
});
