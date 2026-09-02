import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useRecentSearches } from "./use-recent-searches";

describe("useRecentSearches", () => {
  it("추가하면 최신이 앞으로, 중복은 끌어올린다", () => {
    const { result } = renderHook(() => useRecentSearches());
    act(() => result.current.add("킨카"));
    act(() => result.current.add("혼네"));
    act(() => result.current.add("킨카"));
    expect(result.current.items).toEqual(["킨카", "혼네"]);
  });

  it("10개를 넘기면 오래된 것부터 밀려난다", () => {
    const { result } = renderHook(() => useRecentSearches());
    for (let i = 1; i <= 11; i++) {
      act(() => result.current.add(`매장${i}`));
    }
    expect(result.current.items).toHaveLength(10);
    expect(result.current.items).not.toContain("매장1");
  });

  it("localStorage에 남고 다음 마운트에서 복원된다", () => {
    const first = renderHook(() => useRecentSearches());
    act(() => first.result.current.add("담택"));
    first.unmount();
    const second = renderHook(() => useRecentSearches());
    expect(second.result.current.items).toEqual(["담택"]);
  });

  it("깨진 저장값은 빈 목록으로 무해하게 처리", () => {
    localStorage.setItem("ramap.recent-searches.v1", "{broken");
    const { result } = renderHook(() => useRecentSearches());
    expect(result.current.items).toEqual([]);
  });

  it("개별 삭제·전체 삭제", () => {
    const { result } = renderHook(() => useRecentSearches());
    act(() => result.current.add("a"));
    act(() => result.current.add("b"));
    act(() => result.current.remove("a"));
    expect(result.current.items).toEqual(["b"]);
    act(() => result.current.clear());
    expect(result.current.items).toEqual([]);
  });
});
