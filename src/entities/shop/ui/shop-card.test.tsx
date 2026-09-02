import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ShopCard } from "./shop-card";

describe("ShopCard", () => {
  it("상호·태그·동네를 서브라인으로 합쳐 보여준다", () => {
    render(<ShopCard name="킨카" tags={["돈코츠", "라멘"]} area="성수" />);
    expect(screen.getByText("킨카")).toBeInTheDocument();
    expect(screen.getByText("돈코츠 · 라멘 · 성수")).toBeInTheDocument();
  });

  it("동네가 없으면 태그만, 둘 다 없으면 서브라인 자체가 없다", () => {
    const { rerender } = render(
      <ShopCard name="킨카" tags={["돈코츠"]} area={null} />,
    );
    expect(screen.getByText("돈코츠")).toBeInTheDocument();
    rerender(<ShopCard name="킨카" tags={[]} area={null} />);
    expect(screen.queryByText(/·/)).not.toBeInTheDocument();
  });
});
