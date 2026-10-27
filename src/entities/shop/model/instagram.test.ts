import { describe, expect, it } from "vitest";
import type { Shop } from "./types";
import { instagramUrl, isSharedInstagram } from "./instagram";

const shop = (id: string, instagram: string | null, address: string) =>
  ({ id, instagram, address }) as Shop;

describe("instagramUrl", () => {
  it("핸들로 프로필 주소를 만든다", () => {
    expect(instagramUrl("koiramen.official")).toBe(
      "https://www.instagram.com/koiramen.official/",
    );
  });
});

describe("isSharedInstagram", () => {
  const shops = [
    shop("a", "koiramen.official", "서울 중구 장충단로 1"),
    shop("b", "koiramen.official", "서울 강남구 압구정로 2"),
    shop("c", "koiramen.bangbro", "부천 신중동 3"),
  ];

  it("다른 주소 매장이 같은 계정을 쓰면 브랜드 공용 계정", () => {
    expect(isSharedInstagram(shops, shops[0])).toBe(true);
  });

  it("그 매장만 쓰는 계정은 공용이 아니다", () => {
    expect(isSharedInstagram(shops, shops[2])).toBe(false);
  });

  it("인스타가 없으면 공용이 아니다", () => {
    expect(isSharedInstagram(shops, shop("d", null, "x"))).toBe(false);
  });
});
