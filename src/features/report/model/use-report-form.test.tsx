import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MAX_LINKS, MAX_PHOTOS } from "./report-payload";
import { useEditReportForm, useNewReportForm } from "./use-report-form";

vi.mock("./report-sink", () => ({
  submitReport: vi.fn(async () => ({ ok: true })),
}));

const file = (name: string) => new File(["x"], name, { type: "image/jpeg" });

describe("useNewReportForm", () => {
  it("상호와 위치 단서(링크 또는 핀) 없이는 제출 불가", () => {
    const { result } = renderHook(() => useNewReportForm(null));
    expect(result.current.canSubmit).toBe(false);
    act(() => result.current.set("shopName", "새라멘집"));
    expect(result.current.canSubmit).toBe(false);
    act(() => result.current.setLink(0, "https://naver.me/abc"));
    expect(result.current.canSubmit).toBe(true);
  });

  it("지도 중심이 있으면 핀 첨부로도 제출 가능", () => {
    const { result } = renderHook(() =>
      useNewReportForm({ lat: 37.5, lng: 127.0 }),
    );
    act(() => result.current.set("shopName", "새라멘집"));
    act(() => result.current.togglePin());
    expect(result.current.draft.pin).toEqual({ lat: 37.5, lng: 127.0 });
    expect(result.current.canSubmit).toBe(true);
  });

  it("링크는 MAX_LINKS까지, 형식 오류는 터치 후에만 표시", () => {
    const { result } = renderHook(() => useNewReportForm(null));
    for (let i = 0; i < MAX_LINKS + 2; i++) {
      act(() => result.current.addLink());
    }
    expect(result.current.draft.links).toHaveLength(MAX_LINKS);

    act(() => result.current.setLink(0, "not-a-url"));
    expect(result.current.linkError(0)).toBeNull();
    act(() => result.current.touchLink(0));
    expect(result.current.linkError(0)).toContain("링크 형식");
  });

  it("사진은 MAX_PHOTOS를 넘겨 추가해도 잘린다", () => {
    const { result } = renderHook(() => useNewReportForm(null));
    act(() =>
      result.current.addPhotos(
        Array.from({ length: MAX_PHOTOS + 3 }, (_, i) => file(`p${i}.jpg`)),
      ),
    );
    expect(result.current.draft.photos).toHaveLength(MAX_PHOTOS);
    act(() => result.current.removePhoto(0));
    expect(result.current.draft.photos).toHaveLength(MAX_PHOTOS - 1);
  });
});

describe("useEditReportForm", () => {
  const target = { id: "kinka", name: "킨카", location: "성수" };

  it("항목 선택 없이는 제출 불가, 선택하면 가능", () => {
    const { result } = renderHook(() => useEditReportForm(target));
    expect(result.current.canSubmit).toBe(false);
    act(() => result.current.toggleItem("hours"));
    act(() => result.current.set("hours", "11:00-21:00"));
    expect(result.current.has("hours")).toBe(true);
    expect(result.current.canSubmit).toBe(true);
  });

  it("제출하면 done 단계로 전환된다", async () => {
    const { result } = renderHook(() => useEditReportForm(target));
    act(() => result.current.toggleItem("etc"));
    act(() => result.current.set("message", "간판이 바뀌었어요"));
    await act(async () => result.current.submit());
    expect(result.current.phase).toBe("done");
  });
});
