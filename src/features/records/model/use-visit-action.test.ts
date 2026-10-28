import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useVisitAction } from "./use-visit-action";

type Rec = { shopId: string; visited: boolean; count: number } | null;

const records = vi.hoisted(() => ({
  current: null as Rec,
  get: vi.fn(),
  addVisit: vi.fn(),
  restore: vi.fn(),
  toggleSaved: vi.fn(),
  isAuthed: true,
}));

vi.mock("./use-records", () => ({ useRecords: () => records }));
vi.mock("@/shared/api/supabase", () => ({ getSupabase: () => ({}) }));
vi.mock("@/shared/lib/analytics", () => ({ track: vi.fn() }));

describe("useVisitAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    records.current = { shopId: "menkoji", visited: true, count: 2 };
    records.get.mockImplementation(() => records.current);
    records.addVisit.mockImplementation(() => ({
      shopId: "menkoji",
      visited: true,
      count: 3,
    }));
  });

  it("완식을 다시 누르면 해제가 아니라 횟수를 올리고 기록 시트를 연다", () => {
    const { result } = renderHook(() => useVisitAction("menkoji"));
    act(() => result.current.visit());
    expect(records.addVisit).toHaveBeenCalledWith("menkoji", expect.any(Date));
    expect(result.current.logPrompt).toBe(true);
    expect(result.current.visitOrdinal).toBe(3);
  });

  it("되돌리기는 누르기 직전 기록으로 복원하고 시트를 닫는다", () => {
    const { result } = renderHook(() => useVisitAction("menkoji"));
    const before = records.current;
    act(() => result.current.visit());
    act(() => result.current.undoVisit());
    expect(records.restore).toHaveBeenCalledWith("menkoji", before);
    expect(result.current.logPrompt).toBe(false);
  });

  it("처음 완식을 되돌리면 기록 없음(null)으로 복원", () => {
    records.current = null;
    const { result } = renderHook(() => useVisitAction("menkoji"));
    act(() => result.current.visit());
    act(() => result.current.undoVisit());
    expect(records.restore).toHaveBeenCalledWith("menkoji", null);
  });
});
