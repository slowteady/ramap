import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createNavigationStub } from "@/shared/testing/next-navigation";
import { AdminPage } from "./admin-page";

const nav = vi.hoisted(() => ({
  current: null as never as ReturnType<typeof createNavigationStub>,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => nav.current.handlers.useRouter(),
  usePathname: () => nav.current.handlers.usePathname(),
  useSearchParams: () => nav.current.handlers.useSearchParams(),
}));

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
      message: "브레이크타임 15:00-17:00",
      details: { shopId: "kinka", items: ["hours"], fields: {} },
      photoUrls: [],
      createdAt: "2026-09-03T09:00:00Z",
      status: "open" as const,
      resolution: null,
      note: null,
      resolvedAt: null,
    },
    {
      id: 7,
      type: "new" as const,
      shopName: "히노아지 부산대점",
      location: "https://map.naver.com/p/entry/place/2023153907?c=15",
      message: null,
      details: {
        links: ["https://map.naver.com/p/entry/place/2023153907?c=15"],
        pin: { lat: 35.23, lng: 129.08 },
      },
      photoUrls: [],
      createdAt: "2026-10-23T04:11:00Z",
      status: "open" as const,
      resolution: null,
      note: null,
      resolvedAt: null,
    },
    {
      id: 6,
      type: "new" as const,
      shopName: "히노아지",
      location: "https://map.naver.com/p/entry/place/2023153907?c=15",
      message: null,
      details: {
        links: ["https://map.naver.com/p/entry/place/2023153907?c=15"],
      },
      photoUrls: [],
      createdAt: "2026-10-23T04:10:00Z",
      status: "open" as const,
      resolution: null,
      note: null,
      resolvedAt: null,
    },
  ]),
  reviewPhoto: vi.fn(async () => true),
  resolveReports: vi.fn(async () => true),
  reopenReports: vi.fn(async () => true),
}));
vi.mock("../model/admin-api", () => api);

const SHOPS = [
  {
    id: "kinka",
    name: "킨카",
    branch: null,
    address: "서울 성동구 연무장길 1",
    hours: "11:00-21:00",
    breakTime: null,
    closedDays: null,
  },
];

describe("AdminPage", () => {
  beforeEach(() => {
    nav.current = createNavigationStub();
    profile.isAdmin = false;
    api.reviewPhoto.mockClear();
  });

  it("운영자가 아니면 안내만 보인다", () => {
    render(<AdminPage shops={SHOPS} />);
    expect(screen.getByText("운영자만 볼 수 있어요")).toBeInTheDocument();
    expect(screen.queryByText("사진 검수")).not.toBeInTheDocument();
  });

  it("운영자는 검수 대기 사진을 보고 승인할 수 있다", async () => {
    profile.isAdmin = true;
    const user = userEvent.setup();
    render(<AdminPage shops={SHOPS} />);
    expect(await screen.findByText("진한 국물")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "승인" }));
    expect(api.reviewPhoto).toHaveBeenCalledWith(1, "approved", undefined);
  });

  it("반려는 사유 입력 후 확정된다", async () => {
    profile.isAdmin = true;
    const user = userEvent.setup();
    render(<AdminPage shops={SHOPS} />);
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

  it("수정 제보는 현재 값과 함께 보이고 반영 처리된다", async () => {
    profile.isAdmin = true;
    const user = userEvent.setup();
    render(<AdminPage shops={SHOPS} />);
    await screen.findByText("진한 국물");
    await user.click(screen.getByRole("button", { name: /제보/ }));
    expect(screen.getByText("브레이크타임 15:00-17:00")).toBeInTheDocument();
    expect(screen.getByText("현재 11:00-21:00")).toBeInTheDocument();
    const card = screen.getByText("킨카").closest("li")!;
    await user.click(within(card).getByRole("button", { name: "반영함" }));
    expect(api.resolveReports).toHaveBeenCalledWith([9], "applied", undefined);
  });

  it("같은 링크의 신규 제보는 한 카드로 묶여 함께 처리된다", async () => {
    profile.isAdmin = true;
    const user = userEvent.setup();
    render(<AdminPage shops={SHOPS} />);
    await screen.findByText("진한 국물");
    await user.click(screen.getByRole("button", { name: /제보/ }));
    expect(screen.getByRole("button", { name: "대기 2" })).toBeInTheDocument();
    const card = screen.getByText("히노아지 부산대점").closest("li")!;
    expect(within(card).getByText(/같은 제보 1건 더/)).toBeInTheDocument();
    expect(
      within(card).getByRole("link", { name: "네이버 지도" }),
    ).toBeInTheDocument();
    await user.click(within(card).getByRole("button", { name: "중복" }));
    expect(api.resolveReports).toHaveBeenCalledWith(
      [7, 6],
      "duplicate",
      undefined,
    );
  });
});
