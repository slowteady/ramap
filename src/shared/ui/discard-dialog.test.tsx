import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DiscardDialog } from "./discard-dialog";

describe("DiscardDialog", () => {
  it("닫혀 있으면 렌더하지 않는다", () => {
    const { container } = render(
      <DiscardDialog
        open={false}
        title="기록 작성을 그만할까요?"
        onLeave={() => {}}
        onStay={() => {}}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("나가기·계속 쓰기가 각각 핸들러를 부른다", async () => {
    const user = userEvent.setup();
    const onLeave = vi.fn();
    const onStay = vi.fn();
    render(
      <DiscardDialog
        open
        title="기록 작성을 그만할까요?"
        onLeave={onLeave}
        onStay={onStay}
      />,
    );
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(
      screen.getByText("지금 나가면 작성한 내용이 사라져요"),
    ).toBeInTheDocument();

    const dialog = within(screen.getByRole("alertdialog"));
    await user.click(dialog.getByRole("button", { name: "나가기" }));
    expect(onLeave).toHaveBeenCalledOnce();
    await user.click(dialog.getByRole("button", { name: "계속 쓰기" }));
    expect(onStay).toHaveBeenCalledOnce();
  });

  it("백드롭 탭은 계속 쓰기(안전한 쪽)로 처리한다", async () => {
    const user = userEvent.setup();
    const onStay = vi.fn();
    render(
      <DiscardDialog
        open
        title="제보 작성을 그만할까요?"
        onLeave={() => {}}
        onStay={onStay}
      />,
    );
    /* 백드롭은 다이얼로그 밖의 "계속 쓰기" 라벨 버튼 */
    const backdrop = screen
      .getAllByRole("button", { name: "계속 쓰기" })
      .find((el) => !screen.getByRole("alertdialog").contains(el))!;
    await user.click(backdrop);
    expect(onStay).toHaveBeenCalledOnce();
  });
});
