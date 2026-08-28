import { describe, it, expect } from "vitest";
import type { ShopPin } from "./map-manifest";
import { buildAreaClusters } from "./area-clusters";

const pin = (id: string, area: string | null, lat: number, lng: number): ShopPin => ({
  id,
  topMenu: null,
  hours: null,
  breakTime: null,
  closedDays: null,
  amenities: [],
  isNew: false,
  name: id,
  lat,
  lng,
  primarySoup: "niboshi",
  soups: ["niboshi"],
  forms: ["ramen"],
  lineages: [],
  areaLabel: area,
  status: "open",
});

describe("buildAreaClusters", () => {
  it("동네별 개수와 중심 좌표를 계산한다", () => {
    const clusters = buildAreaClusters([
      pin("a", "성수", 37.54, 127.05),
      pin("b", "성수", 37.56, 127.07),
      pin("c", "연남", 37.56, 126.92),
    ]);
    const seongsu = clusters.find((c) => c.area === "성수");
    expect(seongsu).toMatchObject({ count: 2 });
    expect(seongsu?.lat).toBeCloseTo(37.55);
    expect(seongsu?.lng).toBeCloseTo(127.06);
    expect(clusters.find((c) => c.area === "연남")?.count).toBe(1);
  });

  it("동네 라벨 없는 핀은 제외하고 빈 입력은 빈 배열", () => {
    expect(buildAreaClusters([pin("a", null, 37, 127)])).toEqual([]);
    expect(buildAreaClusters([])).toEqual([]);
  });
});
