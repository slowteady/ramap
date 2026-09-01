import { describe, expect, it } from "vitest";
import { directionLinks } from "./directions";

const base = { name: "킨카", lat: 37.5446, lng: 127.0559, naverPlace: null };

describe("directionLinks", () => {
  it("카카오맵 길찾기·네이버 지도 검색·티맵 스킴 3개", () => {
    const links = directionLinks(base);
    expect(links.map((l) => l.label)).toEqual([
      "카카오맵",
      "네이버 지도",
      "티맵",
    ]);
    expect(links[0].href).toBe(
      "https://map.kakao.com/link/to/%ED%82%A8%EC%B9%B4,37.5446,127.0559",
    );
    expect(links[1].href).toBe(
      "https://map.naver.com/p/search/%ED%82%A8%EC%B9%B4",
    );
    expect(links[2].href).toBe(
      "tmap://route?goalname=%ED%82%A8%EC%B9%B4&goalx=127.0559&goaly=37.5446",
    );
  });

  it("네이버플레이스 URL이 있으면 네이버는 그 링크", () => {
    const links = directionLinks({
      ...base,
      naverPlace: "https://naver.me/abc",
    });
    expect(links[1].href).toBe("https://naver.me/abc");
  });

  it("좌표가 없으면 좌표 기반 링크는 빠지고 네이버 검색만", () => {
    const links = directionLinks({ ...base, lat: null, lng: null });
    expect(links.map((l) => l.label)).toEqual(["네이버 지도"]);
  });
});
