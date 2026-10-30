import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DoneView } from "./form-controls";

describe("DoneView", () => {
  it("닫기 버튼은 닫은 뒤 보일 화면에 맞는 라벨을 쓴다", async () => {
    const onClose = vi.fn();
    render(
      <DoneView
        title="수정 요청이 접수됐어요"
        description="확인하고 고쳐 둘게요"
        closeLabel="닫기"
        onClose={onClose}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "지도로 돌아가기" }),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
