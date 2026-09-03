import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createNavigationStub } from "@/shared/testing/next-navigation";
import { SettingsPage } from "./settings-page";

const nav = vi.hoisted(() => ({
  current: null as never as ReturnType<typeof createNavigationStub>,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => nav.current.handlers.useRouter(),
  usePathname: () => nav.current.handlers.usePathname(),
  useSearchParams: () => nav.current.handlers.useSearchParams(),
}));

const auth = vi.hoisted(() => ({
  user: { id: "u1" } as { id: string } | null,
  ready: true,
  signOut: vi.fn(),
  deleteAccount: vi.fn(async () => true),
}));
vi.mock("@/features/auth", () => ({ useAuth: () => auth }));
vi.mock("@/features/records/index.client", () => ({
  deleteMyRecordPhotoFiles: vi.fn(async () => true),
}));

describe("SettingsPage", () => {
  it("약관·정책과 계정 메뉴만 있다 — 둘러보기는 없다", () => {
    nav.current = createNavigationStub();
    render(<SettingsPage />);
    expect(screen.getByText("이용약관")).toBeInTheDocument();
    expect(screen.getByText("개인정보 처리방침")).toBeInTheDocument();
    expect(screen.getByText("로그아웃")).toBeInTheDocument();
    expect(screen.getByText("회원탈퇴")).toBeInTheDocument();
    expect(screen.queryByText("라멘집 등록하기")).not.toBeInTheDocument();
    expect(screen.queryByText("장르 가이드")).not.toBeInTheDocument();
  });

  it("회원탈퇴를 누르면 확인 시트가 뜬다", async () => {
    const user = userEvent.setup();
    nav.current = createNavigationStub();
    render(<SettingsPage />);
    await user.click(screen.getByText("회원탈퇴"));
    expect(screen.getByText("정말 탈퇴할까요?")).toBeInTheDocument();
  });

  it("비로그인이면 계정 섹션이 없다", () => {
    auth.user = null;
    nav.current = createNavigationStub();
    render(<SettingsPage />);
    expect(screen.queryByText("로그아웃")).not.toBeInTheDocument();
    expect(screen.getByText("이용약관")).toBeInTheDocument();
    auth.user = { id: "u1" };
  });
});
