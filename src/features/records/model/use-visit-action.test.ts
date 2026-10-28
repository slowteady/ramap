import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useVisitAction } from "./use-visit-action";

type Rec = { shopId: string; visited: boolean; count: number } | null;

const records = vi.hoisted(() => ({
  current: null as Rec,
  get: vi.fn(),
  addVisit: vi.fn(),
  toggleSaved: vi.fn(),
  isAuthed: true,
}));

vi.mock("./use-records", () => ({ useRecords: () => records }));
vi.mock("@/shared/api/supabase", () => ({ getSupabase: () => ({}) }));
vi.mock("@/shared/lib/analytics", () => ({ track: vi.fn() }));

describe("useVisitAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    records.isAuthed = true;
    records.current = { shopId: "menkoji", visited: true, count: 2 };
    records.get.mockImplementation(() => records.current);
    records.addVisit.mockImplementation(() => ({
      shopId: "menkoji",
      visited: true,
      count: 3,
    }));
  });

  it("완식을 누르면 기록 시트만 열고 아직 기록하지 않는다 — 확인을 눌러야 기록(Untappd·Swarm·Letterboxd)", () => {
    const { result } = renderHook(() => useVisitAction("menkoji"));
    act(() => result.current.visit());
    expect(records.addVisit).not.toHaveBeenCalled();
    expect(result.current.logPrompt).toBe(true);
    expect(result.current.nextOrdinal).toBe(3);
  });

  it("시트에서 확인하면 그때 횟수가 오른다", () => {
    const { result } = renderHook(() => useVisitAction("menkoji"));
    act(() => result.current.visit());
    act(() => result.current.commitVisit());
    expect(records.addVisit).toHaveBeenCalledWith("menkoji", expect.any(Date));
  });

  it("처음이면 1번째", () => {
    records.current = null;
    const { result } = renderHook(() => useVisitAction("menkoji"));
    act(() => result.current.visit());
    expect(result.current.nextOrdinal).toBe(1);
  });

  it("로그인 전이면 시트 대신 로그인 안내", () => {
    records.isAuthed = false;
    const { result } = renderHook(() => useVisitAction("menkoji"));
    act(() => result.current.visit());
    expect(result.current.authPrompt).toBe(true);
    expect(result.current.logPrompt).toBe(false);
  });
});
