import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OpenStatusLine } from "./open-status-line";

/* 2026-08-28은 금요일 */
beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date("2026-08-28T14:00:00"));
});
afterEach(() => vi.useRealTimers());

describe("OpenStatusLine", () => {
  it("영업 중이면 마감 시각과 함께 표시한다", () => {
    render(
      <OpenStatusLine hours="11:00-21:00" breakTime={null} closedDays={null} />,
    );
    expect(screen.getByText("영업중 · 21:00까지")).toBeInTheDocument();
  });

  it("휴무 요일('금요일' 표기 포함)이면 오늘 휴무", () => {
    render(
      <OpenStatusLine
        hours="11:00-21:00"
        breakTime={null}
        closedDays="금요일"
      />,
    );
    expect(screen.getByText("오늘 휴무")).toBeInTheDocument();
  });

  it("브레이크 시간이면 재개 시각을 알린다", () => {
    render(
      <OpenStatusLine
        hours="11:00-21:00"
        breakTime="14:00-17:00"
        closedDays={null}
      />,
    );
    expect(screen.getByText("브레이크 · 17:00부터")).toBeInTheDocument();
  });

  it("파싱 불가한 영업시간이면 아무것도 그리지 않는다", () => {
    const { container } = render(
      <OpenStatusLine hours="매일 다름" breakTime={null} closedDays={null} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
