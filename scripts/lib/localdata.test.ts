import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  isRamenCandidate,
  parseLocalData,
  tmToWgs84,
  toSheetTsv,
} from "./localdata";
import { SHEET_HEADER } from "./sheet-parser";

const fixture = () =>
  readFileSync(resolve(__dirname, "../../data/fixtures/localdata.sample.csv"), "utf8");

describe("parseLocalData", () => {
  it("인허가 CSV에서 관련 컬럼을 추출한다", () => {
    const rows = parseLocalData(fixture());
    expect(rows).toHaveLength(6);
    expect(rows[0]).toMatchObject({ name: "킨카", status: "open" });
    expect(rows[0].x).not.toBeNull();
  });
});

describe("isRamenCandidate", () => {
  it("라멘·멘야 상호는 후보, 분식·비라멘·폐업은 탈락", () => {
    const rows = parseLocalData(fixture());
    const candidates = rows.filter(isRamenCandidate).map((r) => r.name);
    expect(candidates).toContain("킨카라멘");
    expect(candidates).toContain("멘야무겐");
    expect(candidates).not.toContain("김밥천국라면");
    expect(candidates).not.toContain("폐업라멘집");
    expect(candidates).not.toContain("스시야");
  });
});

describe("tmToWgs84", () => {
  it("서울시청 TM(EPSG:5174) 좌표를 WGS84로 변환한다", () => {
    const { lat, lng } = tmToWgs84(198019.5, 451948.6);
    expect(lat).toBeCloseTo(37.566, 1);
    expect(lng).toBeCloseTo(126.978, 1);
  });
});

describe("toSheetTsv", () => {
  it("15번 시트 헤더와 동일한 헤더의 TSV를 만든다", () => {
    const rows = parseLocalData(fixture()).filter(isRamenCandidate);
    const tsv = toSheetTsv(rows);
    const lines = tsv.trim().split("\n");
    expect(lines[0]).toBe(SHEET_HEADER.join("\t"));
    expect(lines.length).toBe(rows.length + 1);
    expect(lines[1]).toContain("킨카라멘");
  });
});
