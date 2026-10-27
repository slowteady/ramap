import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OpenStatusBadge } from "./open-status-badge";

const base = { hours: "11:00-21:00", breakTime: null, closedDays: null };

describe("OpenStatusBadge", () => {
  it("영업 매장은 영업시간 원문을 보여준다", () => {
    const { container } = render(
      <OpenStatusBadge status="open" {...base} closedDays="월" />,
    );
    expect(container).toHaveTextContent("11:00-21:00 · 월 휴무");
  });

  it("휴무는 놓치면 헛걸음이라 강조색으로 따로 표시한다", () => {
    render(<OpenStatusBadge status="open" {...base} closedDays="월" />);
    expect(screen.getByText("월 휴무")).toHaveClass("text-ramen");
  });

  it("휴무만 있어도 구분자 없이 강조해 보여준다", () => {
    const { container } = render(
      <OpenStatusBadge
        status="open"
        hours={null}
        breakTime={null}
        closedDays="일"
      />,
    );
    expect(container).toHaveTextContent(/^일 휴무$/);
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

  it("폐업 시점이 있으면 '폐업 · 2026년 10월'처럼 함께 보여준다 — 타베로그식 폐업 정보 제공", () => {
    render(<OpenStatusBadge status="closed" {...base} closedAt="2026-10-06" />);
    expect(screen.getByText("폐업 · 2026년 10월")).toBeInTheDocument();
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
