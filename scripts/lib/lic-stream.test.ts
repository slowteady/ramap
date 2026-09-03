import { describe, expect, it } from "vitest";
import { detectEncoding, pickColumn, toLicRow } from "./lic-stream";

describe("detectEncoding", () => {
  it("치환문자가 없으면 utf-8", () => {
    expect(
      detectEncoding(new TextEncoder().encode("사업장명,도로명주소")),
    ).toBe("utf-8");
  });

  it("EUC-KR 바이트열은 euc-kr로 판별", () => {
    /* "가나다" EUC-KR */
    const euckr = new Uint8Array([0xb0, 0xa1, 0xb3, 0xaa, 0xb4, 0xd9]);
    expect(detectEncoding(euckr)).toBe("euc-kr");
  });
});

describe("pickColumn", () => {
  const header = ["사업장명", "도로명주소", "좌표정보(X)", "좌표정보(Y)"];

  it("후보 중 처음 존재하는 컬럼명을 고른다", () => {
    expect(pickColumn(header, ["bplcnm", "사업장명"])).toBe("사업장명");
    expect(pickColumn(header, ["좌표정보X(EPSG5174)", "좌표정보(X)"])).toBe(
      "좌표정보(X)",
    );
  });

  it("없으면 null", () => {
    expect(pickColumn(header, ["없는컬럼"])).toBeNull();
  });
});

describe("toLicRow", () => {
  const cols = {
    name: "사업장명",
    roadAddress: "도로명주소",
    state: "상세영업상태명",
    x: "좌표정보(X)",
    y: "좌표정보(Y)",
  };

  it("레코드를 LicRow로 옮긴다", () => {
    const row = toLicRow(
      {
        사업장명: " 킨키 ",
        도로명주소: "부산광역시 수영구 남천동로108번길 46",
        상세영업상태명: "영업",
        "좌표정보(X)": "391089.0",
        "좌표정보(Y)": "180000.0",
      },
      cols,
    );
    expect(row.name).toBe("킨키");
    expect(row.x).toBe(391089);
    expect(row.state).toBe("영업");
  });

  it("빈 좌표는 NaN으로 남겨 하류에서 걸러지게 한다", () => {
    const row = toLicRow(
      { 사업장명: "가게", 도로명주소: "", 상세영업상태명: "영업" },
      cols,
    );
    expect(Number.isNaN(row.x)).toBe(true);
  });
});
