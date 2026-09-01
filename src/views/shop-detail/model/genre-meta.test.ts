import { describe, expect, it } from "vitest";
import { genreMeta } from "./genre-meta";

describe("genreMeta", () => {
  it("국물 → 라멘 외 형태 → taste 계보 순, 가이드 있는 값만 href", () => {
    const items = genreMeta({
      soups: ["niboshi", "shio", "etc-soup"],
      forms: ["ramen", "tsukemen", "etc-form"],
      lineages: ["iekei", "jikaseimen"],
    });
    expect(items.map((i) => i.label)).toEqual([
      "니보시",
      "시오",
      "츠케멘",
      "이에케",
    ]);
    expect(items[0].href).toBe("/guide/niboshi");
    expect(items[2].href).toBeNull();
    expect(items[3].href).toBe("/guide/iekei");
  });

  it("전부 기타면 빈 배열", () => {
    expect(
      genreMeta({ soups: ["etc-soup"], forms: ["ramen"], lineages: [] }),
    ).toEqual([]);
  });
});
