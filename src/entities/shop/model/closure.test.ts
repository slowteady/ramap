import { describe, expect, it } from "vitest";
import { closurePublicState, type ClosureLedger } from "./closure";

const ledger: ClosureLedger = {
  a: { verdict: "closed", checkedAt: "2026-10-19", evidence: ["국세청 폐업"] },
  b: {
    verdict: "moved",
    checkedAt: "2026-10-19",
    evidence: ["이전 공지"],
    movedTo: "b2",
  },
};

describe("closurePublicState — 검증된 폐업만 공개", () => {
  it("영업 매장은 그대로 open", () => {
    expect(closurePublicState({ id: "x", status: "open" }, ledger)).toBe(
      "open",
    );
  });

  it("폐업 상태여도 검증 장부에 없으면 hidden — 확인 안 된 폐업 표시는 내보내지 않는다", () => {
    expect(closurePublicState({ id: "x", status: "closed" }, ledger)).toBe(
      "hidden",
    );
  });

  it("장부에서 폐업 확정이면 closed, 이전이면 moved", () => {
    expect(closurePublicState({ id: "a", status: "closed" }, ledger)).toBe(
      "closed",
    );
    expect(closurePublicState({ id: "b", status: "closed" }, ledger)).toBe(
      "moved",
    );
  });
});
