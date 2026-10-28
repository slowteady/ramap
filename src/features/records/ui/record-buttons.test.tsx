import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RecordButtons } from "./record-buttons";

const action = vi.hoisted(() => ({
  get: vi.fn(
    () => null as null | { visited: boolean; saved: boolean; count: number },
  ),
  visit: vi.fn(),
  commitVisit: vi.fn(),
  nextOrdinal: 1,
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

  it("완식 후에도 버튼은 같은 동사·채운 모양 — 횟수는 버튼 밖 상태 줄로(Untappd·Swarm)", () => {
    action.get.mockReturnValue({ visited: true, saved: false, count: 3 });
    render(<RecordButtons shopId="kinka" />);
    const button = screen.getByRole("button", { name: "완식" });
    expect(button.className).toContain("bg-ramen");
    expect(button.className).not.toContain("border-ramen");
  });
});
