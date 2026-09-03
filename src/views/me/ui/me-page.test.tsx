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
  visitOrdinals: (photos: { id: number }[]) =>
    new Map(photos.map((p, i) => [p.id, i + 1])),
}));
const myPhotos = vi.hoisted(() => ({
  value: null as null | object[],
}));
vi.mock("@/features/records/index.client", () => ({
  fetchMyRecordPhotos: vi.fn(async () => myPhotos.value),
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

describe("MePage — 메뉴 배치", () => {
  it("설정성 메뉴는 본문에 없고 우상단 설정은 /settings 페이지로 간다", () => {
    nav.current = createNavigationStub();
    render(<MePage shops={shops} />);
    expect(screen.queryByText("이용약관")).not.toBeInTheDocument();
    expect(screen.queryByText("로그아웃")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "설정" })).toHaveAttribute(
      "href",
      "/settings",
    );
  });

  it("장르 가이드는 프로필 영역 링크, 라멘집 등록은 마이에 없다(홈 중복)", () => {
    nav.current = createNavigationStub();
    render(<MePage shops={shops} />);
    expect(screen.getByRole("link", { name: /장르 가이드/ })).toHaveAttribute(
      "href",
      "/guide",
    );
    expect(screen.queryByText("라멘집 등록하기")).not.toBeInTheDocument();
  });
});

describe("MePage — 기록 뷰어 (인스타 문법)", () => {
  it("사진 셀을 탭하면 뷰어가 열리고 스와이프 사진·한줄평·매장 보기가 있다", async () => {
    myPhotos.value = [
      {
        id: 1,
        userId: "u1",
        shopId: "shop-44",
        photoPath: "u1/a.jpg",
        comment: "인생 라멘",
        consent: true,
        status: "approved",
        rejectReason: null,
        createdAt: "2026-09-01T12:00:00Z",
        entryId: "e1",
        nickname: null,
        url: "https://example.com/a.jpg",
      },
      {
        id: 2,
        userId: "u1",
        shopId: "shop-44",
        photoPath: "u1/b.jpg",
        comment: null,
        consent: true,
        status: "approved",
        rejectReason: null,
        createdAt: "2026-09-01T12:00:00Z",
        entryId: "e1",
        nickname: null,
        url: "https://example.com/b.jpg",
      },
    ];
    const user = userEvent.setup();
    nav.current = createNavigationStub();
    render(<MePage shops={shops} />);
    const cell = await screen.findByRole("button", {
      name: "라멘집44 기록 보기",
    });
    await user.click(cell);
    expect(screen.getByText("인생 라멘")).toBeInTheDocument();
    expect(screen.getByText(/1번째 완식/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "매장 보기" })).toHaveAttribute(
      "href",
      "/shop/shop-44",
    );
    myPhotos.value = null;
  });
});
