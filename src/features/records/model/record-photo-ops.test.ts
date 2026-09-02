import { describe, expect, it } from "vitest";
import {
  normalizeComment,
  visibleLogEntries,
  withEntryMeta,
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
  entryId: null,
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

describe("다중 사진 묶음(entry)", () => {
  const p = (
    id: number,
    userId: string,
    createdAt: string,
    entryId: string | null = null,
  ): RecordPhoto => ({
    id,
    userId,
    shopId: "kinka",
    photoPath: `${userId}/${id}.jpg`,
    comment: null,
    consent: true,
    status: "approved",
    rejectReason: null,
    createdAt,
    entryId,
    nickname: null,
    url: null,
  });

  it("visitOrdinals — 같은 제출 묶음은 한 회차로 센다", () => {
    const photos = [
      p(1, "u1", "2026-09-01T12:00:00Z", "e1"),
      p(2, "u1", "2026-09-01T12:00:00Z", "e1"),
      p(3, "u1", "2026-09-02T12:00:00Z", "e2"),
    ];
    const ordinals = visitOrdinals(photos);
    expect(ordinals.get(1)).toBe(1);
    expect(ordinals.get(2)).toBe(1);
    expect(ordinals.get(3)).toBe(2);
  });

  it("visitOrdinals — entryId 없는 구 데이터는 행 단위로 센다", () => {
    const photos = [
      p(1, "u1", "2026-09-01T12:00:00Z"),
      p(2, "u1", "2026-09-02T12:00:00Z"),
    ];
    const ordinals = visitOrdinals(photos);
    expect(ordinals.get(1)).toBe(1);
    expect(ordinals.get(2)).toBe(2);
  });

  it("withEntryMeta — 묶음의 첫 장에만 메타를 붙이고 묶음은 연속 배치된다", () => {
    const photos = [
      p(1, "u1", "2026-09-01T12:00:00Z", "e1"),
      p(2, "u1", "2026-09-01T12:00:00Z", "e1"),
      p(3, "u2", "2026-09-02T12:00:00Z", "e2"),
    ];
    const entries = withEntryMeta(visibleLogEntries(photos, null));
    expect(entries.map((e) => e.photo.id)).toEqual([3, 1, 2]);
    expect(entries.map((e) => e.showMeta)).toEqual([true, true, false]);
  });
});
