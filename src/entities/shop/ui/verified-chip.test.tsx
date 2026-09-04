import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VerifiedChip } from "./verified-chip";

describe("VerifiedChip", () => {
  it("태깅확신도가 확정이면 확인됨 배지를 보여준다", () => {
    render(<VerifiedChip confidence="certain" />);
    expect(screen.getByText("확인됨")).toBeInTheDocument();
  });

  it("추정이면 아무것도 그리지 않는다 — 미확인을 굳이 알리지 않는다", () => {
    const { container } = render(<VerifiedChip confidence="estimated" />);
    expect(container).toBeEmptyDOMElement();
  });
});
