import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RecordLogSheet } from "./record-log-sheet";

const submitRecordPhotos = vi.hoisted(() =>
  vi.fn(async (): Promise<{ ok: true } | { ok: false; step: "upload" }> => ({
    ok: true,
  })),
);
vi.mock("../model/record-photos", () => ({ submitRecordPhotos }));

describe("RecordLogSheet — 미저장 이탈 확인", () => {
  it("입력 없으면 '다음에'로 즉시 닫힌다", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<RecordLogSheet shopId="kinka" open onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "다음에" }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("한줄평을 쓰다 닫으면 이탈 확인이 뜨고, 나가기로 닫힌다", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<RecordLogSheet shopId="kinka" open onClose={onClose} />);
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
    render(<RecordLogSheet shopId="kinka" open onClose={onClose} />);
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
    render(<RecordLogSheet shopId="kinka" open onClose={() => {}} />);
    expect(screen.getByRole("button", { name: "남기기" })).toBeDisabled();
  });
});

describe("RecordLogSheet — 다중 사진 제출", () => {
  it("사진 여러 장을 고르면 한 번에 제출된다", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<RecordLogSheet shopId="kinka" open onClose={onClose} />);
    const input = document.querySelector('input[type="file"]')!;
    const files = [
      new File(["a"], "a.jpg", { type: "image/jpeg" }),
      new File(["b"], "b.jpg", { type: "image/jpeg" }),
    ];
    await user.upload(input as HTMLInputElement, files);
    await user.click(screen.getByRole("button", { name: "남기기" }));
    expect(submitRecordPhotos).toHaveBeenCalledWith(
      expect.objectContaining({
        shopId: "kinka",
        files: expect.arrayContaining([expect.any(File), expect.any(File)]),
      }),
    );
    expect(onClose).toHaveBeenCalled();
  });
});

describe("RecordLogSheet — 완식 직후 되돌리기", () => {
  it("완식 버튼으로 열리면 몇 번째 완식인지 알리고 되돌리기를 준다", async () => {
    const user = userEvent.setup();
    const onUndo = vi.fn();
    render(
      <RecordLogSheet
        shopId="kinka"
        open
        ordinal={3}
        onUndo={onUndo}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText("3번째 완식으로 기록했어요")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "되돌리기" }));
    expect(onUndo).toHaveBeenCalledOnce();
  });

  it("완식 기록 섹션에서 열면 되돌리기가 없다 — 횟수를 바꾸지 않는 사진 추가", () => {
    render(<RecordLogSheet shopId="kinka" open onClose={() => {}} />);
    expect(
      screen.queryByRole("button", { name: "되돌리기" }),
    ).not.toBeInTheDocument();
  });
});

describe("RecordLogSheet — 업로드 실패", () => {
  it("실패하면 '올리는 중'에 머물지 않고 다시 시도할 수 있다", async () => {
    submitRecordPhotos.mockResolvedValueOnce({ ok: false, step: "upload" });
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<RecordLogSheet shopId="kinka" open onClose={onClose} />);
    const input = document.querySelector('input[type="file"]')!;
    await user.upload(
      input as HTMLInputElement,
      new File(["a"], "a.jpg", { type: "image/jpeg" }),
    );
    await user.click(screen.getByRole("button", { name: "남기기" }));
    expect(screen.getByText(/저장에 실패했어요/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "남기기" })).toBeEnabled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
