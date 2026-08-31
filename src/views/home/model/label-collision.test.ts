import { describe, it, expect } from "vitest";
import type { ShopPin } from "@/entities/shop";
import {
  degPerPx,
  expandBounds,
  planMarkers,
  withinBounds,
  distanceMeters,
  formatDistance,
} from "./label-collision";

const pin = (id: string, lat: number, lng: number): ShopPin => ({
  id,
  name: id,
  lat,
  lng,
  primarySoup: "niboshi",
  soups: ["niboshi"],
  forms: ["ramen"],
  lineages: [],
  areaLabel: "성수",
  status: "open",
  topMenu: null,
  hours: null,
  breakTime: null,
  closedDays: null,
  amenities: [],
  isNew: false,
});

describe("planMarkers", () => {
  it("겹치지 않으면 전부 필로 표시한다", () => {
    const markers = planMarkers(
      [pin("aaa", 37.5, 127.0), pin("bbb", 37.6, 127.2)],
      5,
      null,
      new Set(),
    );
    expect(markers.every((m) => m.kind === "pill")).toBe(true);
  });

  it("겹치면 하위 우선순위를 점으로 강등한다", () => {
    const unit = degPerPx(5);
    const markers = planMarkers(
      [pin("aaa", 37.5, 127.0), pin("bbb", 37.5 + unit * 5, 127.0)],
      5,
      null,
      new Set(),
    );
    const kinds = Object.fromEntries(markers.map((m) => [m.id, m.kind]));
    expect(kinds.aaa).toBe("pill");
    expect(kinds.bbb).toBe("dot");
  });

  it("선택된 핀은 겹쳐도 항상 필이다", () => {
    const unit = degPerPx(5);
    const markers = planMarkers(
      [pin("aaa", 37.5, 127.0), pin("bbb", 37.5 + unit * 5, 127.0)],
      5,
      "bbb",
      new Set(),
    );
    expect(markers.find((m) => m.id === "bbb")).toMatchObject({
      kind: "pill",
      state: "selected",
    });
  });

  it("완식 핀은 미방문 핀보다 우선순위가 낮다", () => {
    const unit = degPerPx(5);
    const markers = planMarkers(
      [pin("aaa", 37.5, 127.0), pin("bbb", 37.5 + unit * 5, 127.0)],
      5,
      null,
      new Set(["aaa"]),
    );
    const byId = Object.fromEntries(markers.map((m) => [m.id, m]));
    expect(byId.bbb.kind).toBe("pill");
    expect(byId.aaa).toMatchObject({ kind: "dot", state: "visited" });
  });

  it("줌 아웃할수록 셀이 커진다 (같은 거리라도 강등 발생)", () => {
    const unit3 = degPerPx(3);
    const pins = [
      pin("aaa", 37.5, 127.0),
      pin("bbb", 37.5 + unit3 * 40, 127.0),
    ];
    const atLevel3 = planMarkers(pins, 3, null, new Set());
    const atLevel5 = planMarkers(pins, 5, null, new Set());
    expect(atLevel3.every((m) => m.kind === "pill")).toBe(true);
    expect(atLevel5.some((m) => m.kind === "dot")).toBe(true);
  });
});

describe("bounds", () => {
  const bounds = {
    sw: { lat: 37.0, lng: 126.0 },
    ne: { lat: 38.0, lng: 128.0 },
  };

  it("경계 내부 판정", () => {
    expect(withinBounds(pin("a", 37.5, 127.0), bounds)).toBe(true);
    expect(withinBounds(pin("b", 39.0, 127.0), bounds)).toBe(false);
  });

  it("버퍼 확장", () => {
    const expanded = expandBounds(bounds, 0.3);
    expect(expanded.sw.lat).toBeCloseTo(36.7);
    expect(expanded.ne.lng).toBeCloseTo(128.6);
  });
});

describe("distanceMeters / formatDistance", () => {
  const center = { lat: 37.5, lng: 127.0 };

  it("위도 0.01도 차이는 약 1,113m다", () => {
    const pin = { lat: 37.51, lng: 127.0 } as Parameters<typeof distanceMeters>[0];
    expect(distanceMeters(pin, center)).toBeCloseTo(1113.2, 0);
  });

  it("1km 미만은 m, 미만 10km는 소수 1자리 km, 이상은 정수 km", () => {
    expect(formatDistance(450.4)).toBe("450m");
    expect(formatDistance(1234)).toBe("1.2km");
    expect(formatDistance(12345)).toBe("12km");
  });
});
