import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminPage } from "./admin-page";

const profile = vi.hoisted(() => ({ isAdmin: false, profileLoaded: true }));
vi.mock("@/features/auth", () => ({
  useAuth: () => ({ ready: true }),
  useProfile: () => profile,
}));

const api = vi.hoisted(() => ({
  fetchPendingPhotos: vi.fn(async () => [
    {
      id: 1,
      shopId: "kinka",
      comment: "진한 국물",
      nickname: "라멘러버",
      createdAt: "2026-09-03T10:00:00Z",
      url: null,
    },
  ]),
  fetchReports: vi.fn(async () => [
    {
      id: 9,
      type: "edit" as const,
      shopName: "킨카",
      location: "성수",
      message: "영업시간 변경",
      details: {},
      photoUrls: [],
      createdAt: "2026-09-03T09:00:00Z",
      status: "open" as const,
    },
  ]),
  reviewPhoto: vi.fn(async () => true),
  setReportStatus: vi.fn(async () => true),
}));
vi.mock("../model/admin-api", () => api);

describe("AdminPage", () => {
  beforeEach(() => {
    profile.isAdmin = false;
    api.reviewPhoto.mockClear();
  });

  it("운영자가 아니면 안내만 보인다", () => {
    render(<AdminPage />);
    expect(screen.getByText("운영자만 볼 수 있어요")).toBeInTheDocument();
    expect(screen.queryByText("사진 검수")).not.toBeInTheDocument();
  });

  it("운영자는 검수 대기 사진을 보고 승인할 수 있다", async () => {
    profile.isAdmin = true;
    const user = userEvent.setup();
    render(<AdminPage />);
    expect(await screen.findByText("진한 국물")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "승인" }));
    expect(api.reviewPhoto).toHaveBeenCalledWith(1, "approved", undefined);
  });

  it("반려는 사유 입력 후 확정된다", async () => {
    profile.isAdmin = true;
    const user = userEvent.setup();
    render(<AdminPage />);
    await screen.findByText("진한 국물");
    await user.click(screen.getByRole("button", { name: "반려" }));
    await user.type(
      screen.getByPlaceholderText("반려 사유"),
      "라멘이 주인공이 아니에요",
    );
    await user.click(screen.getByRole("button", { name: "반려 확정" }));
    expect(api.reviewPhoto).toHaveBeenCalledWith(
      1,
      "rejected",
      "라멘이 주인공이 아니에요",
    );
  });

  it("제보 탭에서 제보를 처리 완료로 넘긴다", async () => {
    profile.isAdmin = true;
    const user = userEvent.setup();
    render(<AdminPage />);
    await screen.findByText("진한 국물");
    await user.click(screen.getByRole("button", { name: /제보/ }));
    expect(screen.getByText("영업시간 변경")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "처리 완료로" }));
    expect(api.setReportStatus).toHaveBeenCalledWith(9, "done");
  });
});
