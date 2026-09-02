import { describe, expect, it } from "vitest";
import { hasMore, nextCount, PAGE_SIZE, visibleSlice } from "./paging";

const items = Array.from({ length: 45 }, (_, i) => i);

describe("기록 목록 점진 렌더", () => {
  it("초기에는 PAGE_SIZE만 보인다", () => {
    expect(visibleSlice(items, PAGE_SIZE)).toHaveLength(PAGE_SIZE);
    expect(hasMore(PAGE_SIZE, items.length)).toBe(true);
  });

  it("더보기마다 PAGE_SIZE씩 늘고 총량을 넘지 않는다", () => {
    const second = nextCount(PAGE_SIZE, items.length);
    expect(second).toBe(PAGE_SIZE * 2);
    const third = nextCount(second, items.length);
    expect(third).toBe(45);
    expect(hasMore(third, items.length)).toBe(false);
  });

  it("총량이 PAGE_SIZE 이하면 더보기가 없다", () => {
    expect(visibleSlice([1, 2, 3], PAGE_SIZE)).toHaveLength(3);
    expect(hasMore(PAGE_SIZE, 3)).toBe(false);
  });
});
