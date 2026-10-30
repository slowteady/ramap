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
    {
      id: 3,
      type: "edit" as const,
      shopName: "우마이365라멘",
      location: "김해",
      message: "14:30-16:30 브레이크타임",
      details: { shopId: "umai", items: ["hours"], fields: {} },
      photoUrls: [],
      createdAt: "2026-10-23T16:43:00Z",
      status: "done" as const,
      resolution: "applied" as const,
      note: "브레이크 14:30-16:30 반영",
      resolvedAt: "2026-10-27T03:00:00Z",
    },
  ]),
  reviewPhoto: vi.fn(async () => true),
  resetPhoto: vi.fn(async () => true),
  resolveReports: vi.fn(async () => true),
  setReportsStatus: vi.fn(async () => true),
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
    api.resolveReports.mockClear();
    api.setReportsStatus.mockClear();
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

  it("사진 반려는 사유 칩·직접 입력을 고른 뒤에만 확정된다", async () => {
    profile.isAdmin = true;
    const user = userEvent.setup();
    render(<AdminPage shops={SHOPS} />);
    await screen.findByText("진한 국물");
    await user.click(screen.getByRole("button", { name: "반려" }));
    const confirm = screen.getByRole("button", { name: "반려하기" });
    expect(confirm).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "본인 촬영 아님" }));
    await user.type(screen.getByPlaceholderText("직접 입력 (선택)"), "캡처");
    await user.click(confirm);
    expect(api.reviewPhoto).toHaveBeenCalledWith(
      1,
      "rejected",
      "본인 촬영 아님 — 캡처",
    );
  });

  it("수정 제보는 현재 값과 함께 보이고 반영 처리된다", async () => {
    profile.isAdmin = true;
    const user = userEvent.setup();
    render(<AdminPage shops={SHOPS} />);
    await screen.findByText("진한 국물");
    await user.click(screen.getByRole("button", { name: /제보/ }));
    expect(screen.getByText("브레이크타임 15:00-17:00")).toBeInTheDocument();
    expect(screen.getByText("11:00-21:00")).toBeInTheDocument();
    const card = screen.getByText("킨카").closest("li")!;
    await user.click(within(card).getByRole("button", { name: "반영하기" }));
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
    expect(within(card).getByText(/같은 제보 1건/)).toBeInTheDocument();
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

  it("메모를 펼쳐 반영과 함께 저장한다", async () => {
    profile.isAdmin = true;
    const user = userEvent.setup();
    render(<AdminPage shops={SHOPS} />);
    await screen.findByText("진한 국물");
    await user.click(screen.getByRole("button", { name: /제보/ }));
    const card = screen.getByText("킨카").closest("li")!;
    await user.click(within(card).getByRole("button", { name: "+ 메모 추가" }));
    await user.type(within(card).getByRole("textbox"), "전화 확인");
    await user.click(within(card).getByRole("button", { name: "반영하기" }));
    expect(api.resolveReports).toHaveBeenCalledWith(
      [9],
      "applied",
      "전화 확인",
    );
  });

  it("처리됨은 결과·메모를 보이고 다시 열기는 메뉴 안에서 상태만 바꾼다", async () => {
    profile.isAdmin = true;
    const user = userEvent.setup();
    render(<AdminPage shops={SHOPS} />);
    await screen.findByText("진한 국물");
    await user.click(screen.getByRole("button", { name: /제보/ }));
    await user.click(screen.getByRole("button", { name: "처리됨 1" }));
    const card = screen.getByText("우마이365라멘").closest("li")!;
    expect(
      within(card).getByText("메모: 브레이크 14:30-16:30 반영"),
    ).toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: "반영하기" })).toBeNull();
    expect(screen.queryByText("다시 열기")).toBeNull();
    await user.click(within(card).getByRole("button", { name: "더보기" }));
    await user.click(
      await screen.findByRole("menuitem", { name: "다시 열기" }),
    );
    expect(api.setReportsStatus).toHaveBeenCalledWith([3], "open");
  });
});
