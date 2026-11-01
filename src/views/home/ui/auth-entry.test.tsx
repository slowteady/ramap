import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthEntry } from "./auth-entry";

const results = vi.hoisted(() => ({ anyNew: false }));
vi.mock("@/features/auth", () => ({
  useAuth: () => ({ enabled: true }),
  useNewResults: () => results,
}));

describe("AuthEntry", () => {
  it("새 검수 결과가 있으면 마이 아이콘에 점을 띄운다", () => {
    results.anyNew = true;
    render(<AuthEntry />);
    expect(
      screen.getByRole("link", { name: "마이, 새 결과 있음" }),
    ).toBeInTheDocument();
  });

  it("새 결과가 없으면 점이 없다", () => {
    results.anyNew = false;
    render(<AuthEntry />);
    expect(screen.getByRole("link", { name: "마이" })).toBeInTheDocument();
  });
});
