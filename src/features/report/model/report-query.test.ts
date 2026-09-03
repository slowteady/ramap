import { describe, expect, it } from "vitest";
import { isPickQuery, parseReportQuery } from "./report-query";

const q = (s: string) => new URLSearchParams(s);

describe("parseReportQuery", () => {
  it("report 파라미터 없으면 null", () => {
    expect(parseReportQuery(q("soup=niboshi"))).toBeNull();
  });
  it("new", () => {
    expect(parseReportQuery(q("report=new"))).toEqual({ kind: "new" });
  });
  it("edit은 shop 필수", () => {
    expect(parseReportQuery(q("report=edit&shop=kinka"))).toEqual({
      kind: "edit",
      shopId: "kinka",
    });
    expect(parseReportQuery(q("report=edit"))).toBeNull();
  });
  it("미지 값 무시", () => {
    expect(parseReportQuery(q("report=closed"))).toBeNull();
  });
  it("pick 파라미터가 있어도 new 파싱은 그대로", () => {
    expect(parseReportQuery(q("report=new&pick=1"))).toEqual({ kind: "new" });
  });
});

describe("isPickQuery", () => {
  it("신규 등록 + pick=1일 때만 참", () => {
    expect(isPickQuery(q("report=new&pick=1"))).toBe(true);
    expect(isPickQuery(q("report=new"))).toBe(false);
    expect(isPickQuery(q("pick=1"))).toBe(false);
    expect(isPickQuery(q("report=edit&shop=kinka&pick=1"))).toBe(false);
  });
});
