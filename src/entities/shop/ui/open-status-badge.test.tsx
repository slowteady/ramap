import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OpenStatusBadge } from "./open-status-badge";

const base = { hours: "11:00-21:00", breakTime: null, closedDays: null };

describe("OpenStatusBadge", () => {
  it("영업 매장은 영업시간 원문을 보여준다", () => {
    render(<OpenStatusBadge status="open" {...base} closedDays="월" />);
    expect(screen.getByText("11:00-21:00 · 월 휴무")).toBeInTheDocument();
  });

  it("휴업 매장은 '휴업 중'", () => {
    render(<OpenStatusBadge status="paused" {...base} />);
    expect(screen.getByText("휴업 중")).toBeInTheDocument();
  });

  it("폐업 매장은 영업시간 대신 '폐업'을 보여준다 — 행은 보존되므로 상세에서 상태가 드러나야 한다", () => {
    render(<OpenStatusBadge status="closed" {...base} />);
    expect(screen.getByText("폐업")).toBeInTheDocument();
    expect(screen.queryByText(/11:00/)).not.toBeInTheDocument();
  });

  it("영업 매장인데 시간 정보가 없으면 아무것도 그리지 않는다", () => {
    const { container } = render(
      <OpenStatusBadge
        status="open"
        hours={null}
        breakTime={null}
        closedDays={null}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
