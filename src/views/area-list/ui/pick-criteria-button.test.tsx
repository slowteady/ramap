import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PickCriteriaButton } from "./pick-criteria-button";

describe("PickCriteriaButton", () => {
  it("누르면 추천 기준과 확인 시점을 보여 준다", async () => {
    const user = userEvent.setup();
    render(<PickCriteriaButton checkedMonth="2026년 11월" />);
    expect(screen.queryByText("돈을 받고 넣지 않아요")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "라맵 추천 기준 보기" }),
    );

    expect(screen.getByText("라맵 추천은 이렇게 골라요")).toBeInTheDocument();
    expect(screen.getByText("돈을 받고 넣지 않아요")).toBeInTheDocument();
    expect(screen.getByText("2026년 11월에 확인했어요")).toBeInTheDocument();
  });

  it("확인 시점이 없으면 그 줄을 뺀다", async () => {
    const user = userEvent.setup();
    render(<PickCriteriaButton checkedMonth="" />);
    await user.click(
      screen.getByRole("button", { name: "라맵 추천 기준 보기" }),
    );
    expect(screen.queryByText(/확인했어요/)).not.toBeInTheDocument();
  });
});
