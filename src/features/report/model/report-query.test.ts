import { describe, expect, it } from "vitest";
import { parseReportQuery } from "./report-query";

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
});
