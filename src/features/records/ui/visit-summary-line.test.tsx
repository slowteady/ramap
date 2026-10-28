import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VisitSummaryLine } from "./visit-summary-line";

const record = vi.hoisted(() => ({
  value: null as null | { visited: boolean; count: number; lastAt: null },
}));
vi.mock("../model/use-records", () => ({
  useRecords: () => ({ get: () => record.value }),
}));

describe("VisitSummaryLine", () => {
  it("완식 전엔 아무것도 그리지 않는다", () => {
    record.value = null;
    const { container } = render(<VisitSummaryLine shopId="menkoji" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("완식 후엔 횟수를 상태 줄로 보여 준다", () => {
    record.value = { visited: true, count: 3, lastAt: null };
    render(<VisitSummaryLine shopId="menkoji" />);
    expect(screen.getByText("완식 3회")).toBeInTheDocument();
  });
});
