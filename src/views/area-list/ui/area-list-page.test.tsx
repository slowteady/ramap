import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Shop } from "@/entities/shop";
import { createNavigationStub } from "@/shared/testing/next-navigation";

const nav = vi.hoisted(() => ({
  current: null as never as ReturnType<typeof createNavigationStub>,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => nav.current.handlers.useRouter(),
  usePathname: () => nav.current.handlers.usePathname(),
  useSearchParams: () => nav.current.handlers.useSearchParams(),
}));

beforeEach(() => {
  nav.current = createNavigationStub();
});
import { AreaListPage } from "./area-list-page";

function shop(id: string, name: string): Shop {
  return {
    id,
    name,
    branch: null,
    status: "open",
    soups: [],
    forms: ["ramen"],
    lineages: [],
    amenities: [],
    hours: null,
    breakTime: null,
    closedDays: null,
  } as unknown as Shop;
}

const shops = [shop("a", "가라멘"), shop("b", "나라멘"), shop("c", "다라멘")];

function renderPage(pickIds: string[], michelin: Record<string, number> = {}) {
  return render(
    <AreaListPage
      area="망원"
      genreLabel={null}
      genreDescription={null}
      shops={shops}
      pickIds={pickIds}
      michelin={michelin}
      mapHref="/?area=망원"
      pageUrl="https://ramap.kr/area/망원"
      crossLinks={[]}
    />,
  );
}

function namesIn(section: HTMLElement): string[] {
  return within(section)
    .getAllByRole("link")
    .map((a) => a.getAttribute("href") ?? "");
}

describe("AreaListPage — 라맵 추천 구역", () => {
  it("추천이 있으면 추천 구역 다음에 나머지 라멘집을 보여 주고, 추천은 아래에서 뺀다", () => {
    renderPage(["c"]);
    expect(
      screen.getByRole("heading", { name: /망원 라멘 맛집 3곳/ }),
    ).toBeInTheDocument();
    const picks = screen.getByRole("region", { name: "라맵 추천 1곳" });
    const rest = screen.getByRole("region", { name: "다른 라멘집 2곳" });
    expect(namesIn(picks)).toEqual(["/shop/c"]);
    expect(namesIn(rest)).toEqual(["/shop/a", "/shop/b"]);
  });

  it("추천이 없으면 구역 제목 없이 전체 목록", () => {
    const { container } = renderPage([]);
    expect(screen.queryByText(/라맵 추천/)).not.toBeInTheDocument();
    expect(screen.queryByText(/다른 라멘집/)).not.toBeInTheDocument();
    expect(container.querySelectorAll('a[href^="/shop/"]')).toHaveLength(3);
  });

  it("미쉐린 선정 라멘집에만 선정 표시를 붙인다", () => {
    renderPage(["c"], { c: 2026, a: 2026 });
    expect(screen.getAllByText("미쉐린 빕 구르망 2026")).toHaveLength(2);
    const rest = screen.getByRole("region", { name: "다른 라멘집 2곳" });
    expect(within(rest).getAllByText("미쉐린 빕 구르망 2026")).toHaveLength(1);
  });

  it("구조화 데이터 목록은 화면 순서(추천 먼저)", () => {
    const { container } = renderPage(["c"]);
    const json = container.querySelector(
      'script[type="application/ld+json"]',
    )?.textContent;
    const graph = JSON.parse(json ?? "[]");
    const list = (
      Array.isArray(graph) ? graph : (graph["@graph"] ?? [graph])
    ).find((g: { "@type": string }) => g["@type"] === "ItemList");
    expect(
      list.itemListElement.map((i: { url: string }) => i.url.split("/").pop()),
    ).toEqual(["c", "a", "b"]);
  });
});
