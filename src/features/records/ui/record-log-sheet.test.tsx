import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RecordLogSheet } from "./record-log-sheet";

vi.mock("../model/record-photos", () => ({
  submitRecordPhoto: vi.fn(async () => true),
}));
vi.mock("../model/use-records", () => ({
  useRecords: () => ({ recordRevisit: vi.fn() }),
}));

describe("RecordLogSheet — 미저장 이탈 확인", () => {
  it("입력 없으면 '다음에'로 즉시 닫힌다", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <RecordLogSheet shopId="kinka" open revisit={false} onClose={onClose} />,
    );
    await user.click(screen.getByRole("button", { name: "다음에" }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("한줄평을 쓰다 닫으면 이탈 확인이 뜨고, 나가기로 닫힌다", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <RecordLogSheet shopId="kinka" open revisit={false} onClose={onClose} />,
    );
    await user.type(screen.getByPlaceholderText(/한줄평/), "국물이 진하다");
    await user.click(screen.getByRole("button", { name: "다음에" }));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText("기록 작성을 그만할까요?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "나가기" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("계속 쓰기를 누르면 시트와 입력이 유지된다", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <RecordLogSheet shopId="kinka" open revisit={false} onClose={onClose} />,
    );
    await user.type(screen.getByPlaceholderText(/한줄평/), "재방문 예정");
    await user.click(screen.getByRole("button", { name: "다음에" }));
    const dialogButtons = screen.getAllByRole("button", {
      name: "계속 쓰기",
    });
    await user.click(dialogButtons[dialogButtons.length - 1]);
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue("재방문 예정")).toBeInTheDocument();
  });

  it("사진 없이는 남기기 버튼이 비활성", () => {
    render(
      <RecordLogSheet shopId="kinka" open revisit={false} onClose={() => {}} />,
    );
    expect(screen.getByRole("button", { name: "남기기" })).toBeDisabled();
  });
});
