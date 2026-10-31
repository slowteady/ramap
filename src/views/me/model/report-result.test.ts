import { describe, expect, it } from "vitest";
import { countNewResults, reportResult } from "./report-result";
import type { MyReport } from "./my-reports";

const report = (over: Partial<MyReport>): MyReport => ({
  id: 1,
  type: "new",
  shopName: "히노아지",
  shopId: null,
  createdAt: "2026-10-30T10:00:00+09:00",
  status: "open",
  resolution: null,
  rejectReason: null,
  resolvedAt: null,
  ...over,
});

describe("reportResult", () => {
  it("처리 전이거나 다시 열린 제보는 검토 중", () => {
    expect(reportResult(report({})).label).toBe("검토 중");
    expect(
      reportResult(report({ status: "open", resolution: "applied" })).label,
    ).toBe("검토 중");
  });

  it("반영된 정보 수정 제보는 라멘집 페이지로 이어진다", () => {
    const result = reportResult(
      report({
        type: "edit",
        shopId: "menten",
        status: "done",
        resolution: "applied",
      }),
    );
    expect(result).toEqual({
      label: "반영됨",
      message: "지도에 반영했어요",
      shopHref: "/shop/menten",
    });
  });

  it("반영된 새 라멘집 제보는 링크가 없다", () => {
    expect(
      reportResult(report({ status: "done", resolution: "applied" })).shopHref,
    ).toBeNull();
  });

  it("중복은 거절이 아니라 중립 문구로", () => {
    expect(
      reportResult(report({ status: "done", resolution: "duplicate" })),
    ).toEqual({
      label: "이미 있는 정보",
      message: "이미 라맵에 있는 정보예요",
      shopHref: null,
    });
  });

  it("반려 사유 칩은 탓하지 않는 문장으로, 모르는 사유는 문장 없이", () => {
    const rejected = (rejectReason: string | null) =>
      reportResult(
        report({ status: "done", resolution: "rejected", rejectReason }),
      );
    expect(rejected("확인 불가")).toEqual({
      label: "반영 안 됨",
      message: "보내 준 정보로는 확인하지 못했어요",
      shopHref: null,
    });
    expect(rejected("라멘집 아님").message).toBe(
      "라멘을 내는 곳이 아니라서 지도에 올리지 않았어요",
    );
    expect(rejected("정보 불일치").message).toBe(
      "확인한 정보와 달라서 반영하지 않았어요",
    );
    expect(rejected(null).message).toBeNull();
    expect(rejected("운영자 메모").message).toBeNull();
  });
});

describe("countNewResults", () => {
  const done = (resolvedAt: string) =>
    report({ status: "done", resolution: "applied", resolvedAt });

  it("마지막 확인 뒤에 나온 결과만 센다", () => {
    const rows = [
      done("2026-10-29T10:00:00+09:00"),
      done("2026-10-31T10:00:00+09:00"),
      report({}),
    ];
    expect(countNewResults(rows, "2026-10-30T10:00:00+09:00")).toBe(1);
  });

  it("확인한 적이 없으면 나온 결과 전부", () => {
    expect(
      countNewResults([done("2026-10-29T10:00:00+09:00"), report({})], null),
    ).toBe(1);
  });
});
