import { describe, it, expect } from "vitest";
import type { AreaCluster, ShopPin } from "@/entities/shop";
import { SOUP_COLORS } from "@/shared/config/map";
import { toClusterMarkers, toMarkers } from "./markers";

const pin = (id: string, over: Partial<ShopPin> = {}): ShopPin => ({
  id,
  name: id,
  lat: 37.5,
  lng: 127,
  primarySoup: "niboshi",
  soups: ["niboshi"],
  forms: ["ramen"],
  lineages: [],
  areaLabel: "성수",
  status: "open",
  topMenu: null,
  ...over,
});

describe("toMarkers", () => {
  it("대표 스프 색과 선택 상태를 반영한다", () => {
    const markers = toMarkers([pin("a"), pin("b", { primarySoup: "tonkotsu" })], "b");
    expect(markers[0]).toMatchObject({
      id: "a",
      label: "a",
      color: SOUP_COLORS.niboshi,
      state: "default",
      pos: { lat: 37.5, lng: 127 },
    });
    expect(markers[1]).toMatchObject({ color: SOUP_COLORS.tonkotsu, state: "selected" });
  });
});

describe("toClusterMarkers", () => {
  it("동네 이름과 개수를 라벨로 만든다", () => {
    const clusters: AreaCluster[] = [{ area: "성수", count: 3, lat: 37.5, lng: 127 }];
    expect(toClusterMarkers(clusters)).toEqual([
      { id: "성수", pos: { lat: 37.5, lng: 127 }, label: "성수 3" },
    ]);
  });
});
