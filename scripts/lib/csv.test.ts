import { describe, expect, it } from "vitest";
import { decodeCsvBuffer, parseCsv } from "./csv";

describe("parseCsv", () => {
  it("따옴표 필드의 쉼표·이스케이프 따옴표를 처리한다", () => {
    expect(parseCsv('"a,b",c\n"d""e",f')).toEqual([
      ["a,b", "c"],
      ['d"e', "f"],
    ]);
  });

  it("CRLF·빈 줄을 처리한다", () => {
    expect(parseCsv("a,b\r\n\r\nc,d\n")).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });
});

describe("decodeCsvBuffer", () => {
  it("UTF-8은 그대로, EUC-KR은 재디코딩한다", () => {
    const utf8 = new TextEncoder().encode("사업장명,주소");
    expect(decodeCsvBuffer(utf8)).toBe("사업장명,주소");
    const eucKr = new Uint8Array([0xbb, 0xe7, 0xbe, 0xf7, 0xc0, 0xe5]);
    expect(decodeCsvBuffer(eucKr)).toBe("사업장");
  });
});
