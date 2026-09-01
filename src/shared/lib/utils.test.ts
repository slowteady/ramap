import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn — 커스텀 텍스트 스케일과 색 충돌", () => {
  it("크기(text-body)와 색(text-ink)은 공존한다", () => {
    expect(cn("text-body text-ink")).toBe("text-body text-ink");
    expect(cn("text-secondary font-semibold", "text-ramen")).toBe(
      "text-secondary font-semibold text-ramen",
    );
  });

  it("크기끼리는 뒤가 이긴다", () => {
    expect(cn("text-body", "text-title")).toBe("text-title");
    expect(cn("text-caption", "text-sm")).toBe("text-sm");
  });

  it("색끼리는 뒤가 이긴다", () => {
    expect(cn("text-ink", "text-ramen")).toBe("text-ramen");
  });
});
