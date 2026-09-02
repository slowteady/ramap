import { describe, expect, it } from "vitest";
import { fromRow, toRow } from "./row-mapping";

const record = {
  shopId: "kinka",
  visited: true,
  saved: false,
  count: 2,
  firstAt: "2026-08-01T12:00:00.000Z",
  lastAt: "2026-09-01T12:00:00.000Z",
};

describe("row-mapping", () => {
  it("toRow → fromRow 왕복이 손실 없다", () => {
    const row = toRow(record, "user-1");
    expect(row.user_id).toBe("user-1");
    expect(row.updated_at).toBeTruthy();
    expect(fromRow(row)).toEqual(record);
  });

  it("완식도 저장도 아닌 행은 null (기록 해제 상태)", () => {
    expect(
      fromRow({
        user_id: "u",
        shop_id: "kinka",
        visited: false,
        saved: false,
        count: 0,
        first_at: null,
        last_at: null,
      }),
    ).toBeNull();
  });
});
