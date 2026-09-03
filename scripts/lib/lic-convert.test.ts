import { describe, expect, it } from "vitest";
import {
  isOpen,
  licToSanggwonCsv,
  tmToWgs84,
  type LicRow,
} from "./lic-convert";

describe("tmToWgs84", () => {
  it("EPSG:5174 중부원점 좌표를 WGS84 경위도로 바꾼다", () => {
    /* 부산 동래구 일대 실측 좌표 — 경도 129대, 위도 35대로 떨어져야 한다 */
    const [lng, lat] = tmToWgs84(391089.0, 180000.0)!;
    expect(lng).toBeGreaterThan(128.5);
    expect(lng).toBeLessThan(129.5);
    expect(lat).toBeGreaterThan(34.8);
    expect(lat).toBeLessThan(35.5);
  });

  it("빈 좌표·비수치는 null", () => {
    expect(tmToWgs84(NaN, 1)).toBeNull();
    expect(tmToWgs84(0, 0)).toBeNull();
  });

  it("한반도 범위를 벗어난 결과는 버린다", () => {
    expect(tmToWgs84(1e9, 1e9)).toBeNull();
  });
});

describe("isOpen", () => {
  it("영업 상태만 통과", () => {
    expect(isOpen("영업/정상")).toBe(true);
    expect(isOpen("영업")).toBe(true);
    expect(isOpen("폐업")).toBe(false);
    expect(isOpen("휴업")).toBe(false);
    expect(isOpen("")).toBe(false);
  });
});

describe("licToSanggwonCsv", () => {
  const rows: LicRow[] = [
    {
      name: "킨키",
      roadAddress: "부산광역시 수영구 남천동로108번길 46",
      state: "영업/정상",
      x: 391089.0,
      y: 180000.0,
    },
    {
      name: "폐업한집",
      roadAddress: "부산광역시 동래구 충렬대로 1",
      state: "폐업",
      x: 391089.0,
      y: 180000.0,
    },
    {
      name: "좌표없는집",
      roadAddress: "부산광역시 동래구 충렬대로 2",
      state: "영업",
      x: NaN,
      y: NaN,
    },
  ];

  it("상가정보 스키마 헤더로 시작한다", () => {
    const lines = licToSanggwonCsv(rows).split("\n");
    expect(lines[0]).toBe(
      '"상호명","지점명","상권업종소분류코드","시군구명","행정동명","도로명주소","경도","위도"',
    );
  });

  it("영업 중이고 좌표가 있는 행만 남긴다", () => {
    const lines = licToSanggwonCsv(rows).split("\n").filter(Boolean);
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain("킨키");
  });

  it("주소에서 시군구를 뽑고 출처 코드를 붙인다", () => {
    const line = licToSanggwonCsv(rows).split("\n")[1];
    expect(line).toContain('"LIC"');
    expect(line).toContain('"수영구"');
  });

  it("따옴표가 든 상호를 이스케이프한다", () => {
    const line = licToSanggwonCsv([{ ...rows[0], name: '라멘"집"' }]).split(
      "\n",
    )[1];
    expect(line.startsWith('"라멘""집""",')).toBe(true);
  });
});
