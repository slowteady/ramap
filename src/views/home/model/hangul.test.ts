import { describe, expect, it } from "vitest";
import { editDistanceAtMostOne } from "./hangul";

describe("editDistanceAtMostOne", () => {
  it("치환·삽입·삭제 1회까지 허용", () => {
    expect(editDistanceAtMostOne("니보시", "니보시")).toBe(true);
    expect(editDistanceAtMostOne("니보시", "니보씨")).toBe(true);
    expect(editDistanceAtMostOne("니보시", "니시")).toBe(true);
    expect(editDistanceAtMostOne("니보시", "노시")).toBe(false);
    expect(editDistanceAtMostOne("멘야코노하", "멘야코노하아")).toBe(true);
    expect(editDistanceAtMostOne("니보시", "돈코츠")).toBe(false);
  });
});
