import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createNavigationStub } from "@/shared/testing/next-navigation";
import { EMPTY_FILTERS } from "./filter";
import { useMapFilters } from "./use-map-filters";

const nav = vi.hoisted(() => ({
  current: null as never as ReturnType<typeof createNavigationStub>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => nav.current.handlers.useRouter(),
  usePathname: () => nav.current.handlers.usePathname(),
  useSearchParams: () => nav.current.handlers.useSearchParams(),
}));

describe("useMapFilters", () => {
  beforeEach(() => {
    nav.current = createNavigationStub();
  });

  it("URL 쿼리를 필터로 파싱한다", () => {
    nav.current = createNavigationStub("soup=tonkotsu,shoyu");
    const { result } = renderHook(() => useMapFilters());
    expect(result.current.filters.soups).toEqual(["tonkotsu", "shoyu"]);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it("apply는 URL을 replace하고 선택 매장(shop)을 보존한다", () => {
    nav.current = createNavigationStub("shop=kinka");
    const { result } = renderHook(() => useMapFilters());
    act(() => result.current.apply({ ...EMPTY_FILTERS, soups: ["niboshi"] }));
    const url = nav.current.lastUrl()!;
    expect(url).toContain("soup=niboshi");
    expect(url).toContain("shop=kinka");
  });

  it("clear는 필터를 비운다", () => {
    nav.current = createNavigationStub("soup=tonkotsu");
    const { result } = renderHook(() => useMapFilters());
    act(() => result.current.clear());
    expect(nav.current.lastUrl()).not.toContain("soup=");
  });
});
