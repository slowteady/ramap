import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createNavigationStub } from "@/shared/testing/next-navigation";
import { useSearchQuery } from "./use-search-query";
import { useSelectedShop } from "./use-selected-shop";

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

describe("useSelectedShop", () => {
  it("select는 shop을 세팅하고 검색 오버레이를 닫는다", () => {
    nav.current = createNavigationStub("search=1&soup=miso");
    const { result } = renderHook(() => useSelectedShop());
    act(() => result.current.select("kinka"));
    const url = nav.current.lastUrl()!;
    expect(url).toContain("shop=kinka");
    expect(url).not.toContain("search=1");
    expect(url).toContain("soup=miso");
  });

  it("clear는 shop만 제거하고 나머지 쿼리는 보존한다", () => {
    nav.current = createNavigationStub("shop=kinka&soup=miso");
    const { result } = renderHook(() => useSelectedShop());
    expect(result.current.selectedId).toBe("kinka");
    act(() => result.current.clear());
    const url = nav.current.lastUrl()!;
    expect(url).not.toContain("shop=");
    expect(url).toContain("soup=miso");
  });
});

describe("useSearchQuery", () => {
  it("open/close가 search 파라미터를 토글한다", () => {
    const { result } = renderHook(() => useSearchQuery());
    expect(result.current.isOpen).toBe(false);
    act(() => result.current.open());
    expect(nav.current.lastUrl()).toContain("search=1");
    act(() => result.current.close());
    expect(nav.current.lastUrl()).not.toContain("search=1");
  });
});
