import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InstagramLink } from "./instagram-link";

const track = vi.hoisted(() => vi.fn());
vi.mock("@/shared/lib/analytics", () => ({ track }));

describe("InstagramLink", () => {
  it("'인스타그램' 텍스트를 새 탭 아웃링크로 보여준다 — 계정명·로고 없음(네이버 플레이스 관례·타사 로고 금지)", () => {
    render(
      <InstagramLink shopId="koi" handle="koiramen.bangbro" shared={false} />,
    );
    const link = screen.getByRole("link", { name: /인스타그램/ });
    expect(link).not.toHaveTextContent("@");
    expect(link).toHaveAttribute(
      "href",
      "https://www.instagram.com/koiramen.bangbro/",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("터치 영역은 44px 이상 — 행 높이를 채운다", () => {
    render(<InstagramLink shopId="koi" handle="koiramen.official" shared />);
    expect(screen.getByRole("link")).toHaveClass("min-h-11");
  });

  it("클릭을 기록한다", () => {
    render(<InstagramLink shopId="koi" handle="koiramen.official" shared />);
    fireEvent.click(screen.getByRole("link"));
    expect(track).toHaveBeenCalledWith("instagram_clicked", {
      shop_id: "koi",
      shared: true,
    });
  });
});
