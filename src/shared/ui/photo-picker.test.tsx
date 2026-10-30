import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PhotoPicker } from "./photo-picker";

describe("PhotoPicker", () => {
  it("사진 빼기 버튼은 터치 영역이 44px 이상이다", () => {
    URL.createObjectURL = vi.fn(() => "blob:a");
    URL.revokeObjectURL = vi.fn();
    render(
      <PhotoPicker
        files={[new File(["x"], "a.jpg", { type: "image/jpeg" })]}
        max={5}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "사진 빼기" })).toHaveClass(
      "size-11",
    );
  });
});
