import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InstagramLink } from "./instagram-link";

const track = vi.hoisted(() => vi.fn());
vi.mock("@/shared/lib/analytics", () => ({ track }));

describe("InstagramLink", () => {
  it("@핸들을 새 탭 아웃링크로 보여준다", () => {
    render(
      <InstagramLink shopId="koi" handle="koiramen.bangbro" shared={false} />,
    );
    const link = screen.getByRole("link", { name: /@koiramen\.bangbro/ });
    expect(link).toHaveAttribute(
      "href",
      "https://www.instagram.com/koiramen.bangbro/",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
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
