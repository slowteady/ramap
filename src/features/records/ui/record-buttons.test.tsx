import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RecordButtons } from "./record-buttons";

const action = vi.hoisted(() => ({
  get: vi.fn(() => null as null | { visited: boolean; saved: boolean }),
  visit: vi.fn(),
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

  it("완식 상태면 활성 스타일(테두리형)로 바뀐다", () => {
    action.get.mockReturnValue({ visited: true, saved: false });
    render(<RecordButtons shopId="kinka" />);
    expect(screen.getByRole("button", { name: "완식" }).className).toContain(
      "border-ramen",
    );
    expect(
      screen.getByRole("button", { name: "저장" }).className,
    ).not.toContain("border-ramen");
  });
});
