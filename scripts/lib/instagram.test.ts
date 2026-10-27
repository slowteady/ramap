import { describe, expect, it } from "vitest";
import { normalizeHandle } from "./instagram";

describe("normalizeHandle", () => {
  it("URL·@·대소문자·끝 슬래시를 정리한다", () => {
    expect(normalizeHandle("https://www.instagram.com/Koibang2/")).toBe(
      "koibang2",
    );
    expect(normalizeHandle("@butanchu_hongdae")).toBe("butanchu_hongdae");
    expect(normalizeHandle("instagram.com/menya.ramen?igsh=abc")).toBe(
      "menya.ramen",
    );
  });
});
