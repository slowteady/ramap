import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Shop } from "@/entities/shop";
import { createNavigationStub } from "@/shared/testing/next-navigation";
import { MePage } from "./me-page";

const nav = vi.hoisted(() => ({
  current: null as never as ReturnType<typeof createNavigationStub>,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => nav.current.handlers.useRouter(),
  usePathname: () => nav.current.handlers.usePathname(),
  useSearchParams: () => nav.current.handlers.useSearchParams(),
}));

vi.mock("@/features/auth", () => ({
  useAuth: () => ({
    user: { id: "u1" },
    ready: true,
    signOut: vi.fn(),
    deleteAccount: vi.fn(),
  }),
  useProfile: () => ({ displayName: "라멘 러버", profileLoaded: true }),
}));

const RECORD_TOTAL = 45;
vi.mock("@/features/records", () => ({
  useRecords: () => ({
    records: Array.from({ length: 45 }, (_, i) => ({
      shopId: `shop-${i}`,
      visited: true,
      saved: false,
      count: 1,
      firstAt: "2026-09-01T12:00:00.000Z",
      lastAt: `2026-09-01T12:00:${String(i % 60).padStart(2, "0")}.000Z`,
    })),
  }),
  LoginPromptSheet: () => null,
}));
vi.mock("@/features/records/index.client", () => ({
  fetchMyRecordPhotos: vi.fn(async () => null),
  deleteMyRecordPhotoFiles: vi.fn(async () => true),
}));

const shops = Array.from({ length: RECORD_TOTAL }, (_, i) => ({
  id: `shop-${i}`,
  name: `라멘집${i}`,
  areaLabel: "홍대",
  soups: ["tonkotsu"],
  forms: ["ramen"],
  lineages: [],
})) as unknown as Shop[];

describe("MePage — 기록 목록 점진 렌더", () => {
  it("초기 20개만 렌더하고 더보기에 남은 개수를 보여준다", () => {
    nav.current = createNavigationStub();
    render(<MePage shops={shops} />);
    expect(screen.getAllByText(/^라멘집\d+$/)).toHaveLength(20);
    expect(
      screen.getByRole("button", { name: "기록 더보기 (25)" }),
    ).toBeInTheDocument();
  });

  it("더보기를 누르면 20개씩 늘고 다 보이면 버튼이 사라진다", async () => {
    const user = userEvent.setup();
    nav.current = createNavigationStub();
    render(<MePage shops={shops} />);
    await user.click(screen.getByRole("button", { name: /기록 더보기/ }));
    expect(screen.getAllByText(/^라멘집\d+$/)).toHaveLength(40);
    await user.click(screen.getByRole("button", { name: "기록 더보기 (5)" }));
    expect(screen.getAllByText(/^라멘집\d+$/)).toHaveLength(45);
    expect(
      screen.queryByRole("button", { name: /기록 더보기/ }),
    ).not.toBeInTheDocument();
  });
});
