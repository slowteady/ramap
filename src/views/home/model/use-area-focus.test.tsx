import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createNavigationStub } from "@/shared/testing/next-navigation";
import { useAreaFocus } from "./use-area-focus";

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

describe("useAreaFocus", () => {
  it("지도가 준비되면 area로 이동하고 URL에서 area만 지운다", () => {
    nav.current = createNavigationStub("area=%EC%84%B1%EC%88%98&soup=miso");
    const panToArea = vi.fn();
    const { rerender } = renderHook(
      ({ ready }) => useAreaFocus(ready, panToArea),
      { initialProps: { ready: false } },
    );
    expect(panToArea).not.toHaveBeenCalled();
    rerender({ ready: true });
    expect(panToArea).toHaveBeenCalledWith("성수");
    expect(nav.current.lastUrl()).toBe("/?soup=miso");
  });

  it("area가 없으면 지도를 움직이지 않는다", () => {
    const panToArea = vi.fn();
    renderHook(() => useAreaFocus(true, panToArea));
    expect(panToArea).not.toHaveBeenCalled();
    expect(nav.current.replace).not.toHaveBeenCalled();
  });
});
