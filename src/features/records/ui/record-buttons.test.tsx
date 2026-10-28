import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RecordButtons } from "./record-buttons";

const action = vi.hoisted(() => ({
  get: vi.fn(
    () => null as null | { visited: boolean; saved: boolean; count: number },
  ),
  visit: vi.fn(),
  undoVisit: vi.fn(),
  visitOrdinal: null,
  save: vi.fn(),
  authPrompt: false,
  closeAuthPrompt: vi.fn(),
  logPrompt: false,
  closeLogPrompt: vi.fn(),
}));

vi.mock("../model/use-visit-action", () => ({
  useVisitAction: () => action,
}));

describe("RecordButtons", () => {
  beforeEach(() => {
    action.get.mockReturnValue(null);
    action.visit.mockClear();
    action.save.mockClear();
  });

  it("완식·저장 버튼이 핸들러를 부른다", async () => {
    const user = userEvent.setup();
    render(<RecordButtons shopId="kinka" />);
    await user.click(screen.getByRole("button", { name: "완식" }));
    expect(action.visit).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "저장" }));
    expect(action.save).toHaveBeenCalledOnce();
  });

  it("완식 후에도 채워진 버튼으로 '한 그릇 더'와 횟수를 보여 준다 — 눌린 모양이면 다시 누르지 않는다", () => {
    action.get.mockReturnValue({ visited: true, saved: false, count: 3 });
    render(<RecordButtons shopId="kinka" />);
    const button = screen.getByRole("button", { name: /한 그릇 더/ });
    expect(button).toHaveTextContent("3회");
    expect(button.className).toContain("bg-ramen");
    expect(button.className).not.toContain("border-ramen");
    expect(
      screen.getByRole("button", { name: "저장" }).className,
    ).not.toContain("border-ramen");
  });
});
