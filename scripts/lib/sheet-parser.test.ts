import { describe, it, expect } from "vitest";
import { SHEET_HEADER, parseSheetTsv } from "./sheet-parser";

const H = SHEET_HEADER.join("\t");

function row(overrides: Record<string, string>): string {
  const base: Record<string, string> = {
    id: "kinka",
    상호: "킨카",
    시: "서울",
    구: "성동구",
    동네라벨: "성수",
    상태: "영업",
    형태: "라멘, 츠케멘",
    형태_대표: "라멘",
    스프: "니보시, 시오",
    스프_대표: "니보시",
    태깅확신도: "확정",
    대표메뉴1: "니보시 시오 라멘|12000",
    검증상태: "운영자확인",
  };
  const merged = { ...base, ...overrides };
  return SHEET_HEADER.map((h) => merged[h] ?? "").join("\t");
}

describe("parseSheetTsv", () => {
  it("정상 행을 Shop으로 변환한다 (라벨→슬러그, 복수값)", () => {
    const r = parseSheetTsv(`${H}\n${row({})}`);
    expect(r.issues).toHaveLength(0);
    const s = r.shops[0];
    expect(s.id).toBe("kinka");
    expect(s.soups).toEqual(["niboshi", "shio"]);
    expect(s.primarySoup).toBe("niboshi");
    expect(s.forms).toEqual(["ramen", "tsukemen"]);
    expect(s.status).toBe("open");
    expect(s.menus[0]).toEqual({ name: "니보시 시오 라멘", price: 12000 });
  });

  it("빈 선택 필드는 null이 된다", () => {
    const s = parseSheetTsv(`${H}\n${row({})}`).shops[0];
    expect(s.address).toBeNull();
    expect(s.lat).toBeNull();
    expect(s.instagram).toBeNull();
  });

  it("미지의 택소노미 라벨은 행 이슈로 수집하고 그 행을 제외한다", () => {
    const r = parseSheetTsv(`${H}\n${row({ 스프: "어패계", 스프_대표: "어패계" })}\n${row({ id: "ok" })}`);
    expect(r.shops.map((s) => s.id)).toEqual(["ok"]);
    expect(r.issues.some((i) => i.field === "스프")).toBe(true);
  });

  it("id 중복은 이슈다", () => {
    const r = parseSheetTsv(`${H}\n${row({})}\n${row({})}`);
    expect(r.shops).toHaveLength(1);
    expect(r.issues.some((i) => i.field === "id")).toBe(true);
  });

  it("대표값이 복수값에 없으면 이슈다", () => {
    const r = parseSheetTsv(`${H}\n${row({ 스프_대표: "미소" })}`);
    expect(r.shops).toHaveLength(0);
    expect(r.issues.some((i) => i.field === "스프_대표")).toBe(true);
  });

  it("대표메뉴 형식 오류는 이슈다", () => {
    const r = parseSheetTsv(`${H}\n${row({ 대표메뉴1: "가격없는메뉴" })}`);
    expect(r.issues.some((i) => i.field === "대표메뉴1")).toBe(true);
  });

  it("좌표는 숫자로 파싱되고 비숫자는 이슈다", () => {
    const ok = parseSheetTsv(`${H}\n${row({ lat: "37.5446", lng: "127.0559", 좌표출처: "수동핀" })}`);
    expect(ok.shops[0].lat).toBeCloseTo(37.5446);
    const bad = parseSheetTsv(`${H}\n${row({ lat: "abc" })}`);
    expect(bad.issues.some((i) => i.field === "lat")).toBe(true);
  });
});
