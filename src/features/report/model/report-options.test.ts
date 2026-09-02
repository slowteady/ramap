import { describe, expect, it } from "vitest";
import { GENRE_AXES, toggleSlug } from "./report-options";

describe("GENRE_AXES", () => {
  it("etc·trait 항목은 제보 선택지에 없다", () => {
    for (const axis of GENRE_AXES) {
      expect(axis.items.some((i) => i.slug.startsWith("etc-"))).toBe(false);
      expect(axis.items.every((i) => i.kind !== "trait")).toBe(true);
    }
  });
});

describe("toggleSlug", () => {
  it("없으면 추가, 있으면 제거", () => {
    expect(toggleSlug(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleSlug(["a", "b"], "b")).toEqual(["a"]);
  });
});
