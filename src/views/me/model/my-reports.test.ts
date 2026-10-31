import { describe, expect, it } from "vitest";
import { parseMyReports } from "./my-reports";

describe("parseMyReports", () => {
  it("함수 응답을 앱 타입으로 바꾸고 모양이 다른 행은 버린다", () => {
    expect(
      parseMyReports([
        {
          id: 3,
          type: "edit",
          shop_name: "멘텐",
          shop_id: "menten",
          created_at: "2026-10-30T01:00:00Z",
          status: "done",
          resolution: "rejected",
          reject_reason: "정보 불일치",
          resolved_at: "2026-10-31T01:00:00Z",
        },
        { id: "x" },
        null,
      ]),
    ).toEqual([
      {
        id: 3,
        type: "edit",
        shopName: "멘텐",
        shopId: "menten",
        createdAt: "2026-10-30T01:00:00Z",
        status: "done",
        resolution: "rejected",
        rejectReason: "정보 불일치",
        resolvedAt: "2026-10-31T01:00:00Z",
      },
    ]);
  });

  it("배열이 아니면 빈 목록", () => {
    expect(parseMyReports(null)).toEqual([]);
  });
});
