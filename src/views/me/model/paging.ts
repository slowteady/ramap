/* 기록 목록 점진 렌더 — 하단 메뉴 접근성 보존을 위해 무한 스크롤 대신 더보기 버튼 (2026-09-02) */
export const PAGE_SIZE = 20;

export function visibleSlice<T>(items: T[], count: number): T[] {
  return items.slice(0, count);
}

export function nextCount(current: number, total: number): number {
  return Math.min(current + PAGE_SIZE, total);
}

export function hasMore(count: number, total: number): boolean {
  return total > count;
}
