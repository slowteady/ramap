import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EMPTY_FILTERS } from "../model/filter";
import { FilterChips } from "./filter-chips";

const baseProps = {
  onOpenAxis: vi.fn(),
  onApply: vi.fn(),
  hideVisited: null,
  onToggleHideVisited: vi.fn(),
  hasNew: false,
};

describe("FilterChips", () => {
  it("필터 없으면 초기화 버튼이 없다", () => {
    render(<FilterChips {...baseProps} filters={EMPTY_FILTERS} />);
    expect(screen.queryByLabelText("필터 초기화")).not.toBeInTheDocument();
  });

  it("활성 필터가 있으면 초기화 버튼이 나타나고 EMPTY로 되돌린다", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    render(
      <FilterChips
        {...baseProps}
        onApply={onApply}
        filters={{ ...EMPTY_FILTERS, soups: ["tonkotsu"] }}
      />,
    );
    await user.click(screen.getByLabelText("필터 초기화"));
    expect(onApply).toHaveBeenCalledWith(EMPTY_FILTERS);
  });

  it("축 칩을 누르면 해당 축 시트가 열린다", async () => {
    const user = userEvent.setup();
    const onOpenAxis = vi.fn();
    render(
      <FilterChips
        {...baseProps}
        onOpenAxis={onOpenAxis}
        filters={EMPTY_FILTERS}
      />,
    );
    await user.click(screen.getByRole("button", { name: /국물/ }));
    expect(onOpenAxis).toHaveBeenCalledWith("soup");
  });

  it("특성 칩(자가제면 등)은 lineages 토글로 적용된다", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    render(
      <FilterChips {...baseProps} onApply={onApply} filters={EMPTY_FILTERS} />,
    );
    const traitChip = screen.getByRole("button", { name: "자가제면" });
    await user.click(traitChip);
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({ lineages: ["jikaseimen"] }),
    );
  });

  it("저장 기록이 없으면 저장한 곳 칩이 없고, 있으면 눌러서 토글한다", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <FilterChips {...baseProps} filters={EMPTY_FILTERS} />,
    );
    expect(
      screen.queryByRole("button", { name: "저장한 곳" }),
    ).not.toBeInTheDocument();
    const onToggleSavedOnly = vi.fn();
    rerender(
      <FilterChips
        {...baseProps}
        filters={EMPTY_FILTERS}
        savedOnly={false}
        onToggleSavedOnly={onToggleSavedOnly}
      />,
    );
    const chip = screen.getByRole("button", { name: "저장한 곳" });
    expect(chip).toHaveAttribute("aria-pressed", "false");
    await user.click(chip);
    expect(onToggleSavedOnly).toHaveBeenCalled();
  });
});
