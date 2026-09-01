import { describe, expect, it } from "vitest";
import {
  normalizeComment,
  visibleLogEntries,
  visitOrdinals,
  type RecordPhoto,
} from "./record-photo-ops";

const photo = (over: Partial<RecordPhoto>): RecordPhoto => ({
  id: 1,
  userId: "u1",
  shopId: "kinka",
  photoPath: "u1/a.jpg",
  comment: null,
  consent: true,
  status: "approved",
  rejectReason: null,
  createdAt: "2026-09-01T00:00:00.000Z",
  nickname: null,
  url: null,
  ...over,
});

describe("normalizeComment", () => {
  it("공백은 null, 30자 초과는 잘린다", () => {
    expect(normalizeComment("   ")).toBeNull();
    expect(normalizeComment(" 진한 니보시 ")).toBe("진한 니보시");
    expect(normalizeComment("가".repeat(40))).toHaveLength(30);
  });
});

describe("visitOrdinals", () => {
  it("유저별로 오래된 순 차수를 매긴다", () => {
    const ordinals = visitOrdinals([
      photo({ id: 3, userId: "u1", createdAt: "2026-09-03T00:00:00.000Z" }),
      photo({ id: 1, userId: "u1", createdAt: "2026-09-01T00:00:00.000Z" }),
      photo({ id: 2, userId: "u2", createdAt: "2026-09-02T00:00:00.000Z" }),
    ]);
    expect(ordinals.get(1)).toBe(1);
    expect(ordinals.get(3)).toBe(2);
    expect(ordinals.get(2)).toBe(1);
  });
});

describe("visibleLogEntries", () => {
  it("타인 것은 승인·동의분만, 본인 것은 전부 최신순", () => {
    const listed = visibleLogEntries(
      [
        photo({ id: 1, userId: "other", status: "approved" }),
        photo({ id: 2, userId: "other", status: "pending" }),
        photo({ id: 3, userId: "other", status: "approved", consent: false }),
        photo({
          id: 4,
          userId: "me",
          status: "pending",
          createdAt: "2026-09-02T00:00:00.000Z",
        }),
        photo({ id: 5, userId: "me", status: "rejected" }),
      ],
      "me",
    );
    expect(listed.map((p) => p.id)).toEqual([4, 1, 5]);
  });

  it("비로그인은 승인·동의분만", () => {
    const listed = visibleLogEntries(
      [photo({ id: 1 }), photo({ id: 2, status: "pending" })],
      null,
    );
    expect(listed.map((p) => p.id)).toEqual([1]);
  });
});
