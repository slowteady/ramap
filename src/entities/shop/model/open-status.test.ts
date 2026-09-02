import { describe, it, expect } from "vitest";
import { openStatus } from "./open-status";

const at = (s: string) => new Date(s);

describe("openStatus", () => {
  it("영업시간 내면 open + 마감시각", () => {
    expect(
      openStatus("11:00-21:00", null, null, at("2026-08-28T14:00:00")),
    ).toEqual({
      kind: "open",
      until: "21:00",
    });
  });

  it("영업 전이면 closed + 오픈시각", () => {
    expect(
      openStatus("11:00-21:00", null, null, at("2026-08-28T09:00:00")),
    ).toEqual({
      kind: "closed",
      opensAt: "11:00",
    });
  });

  it("마감 후면 closed", () => {
    expect(
      openStatus("11:00-21:00", null, null, at("2026-08-28T22:30:00")).kind,
    ).toBe("closed");
  });

  it("브레이크타임이면 break + 재개시각", () => {
    expect(
      openStatus("11:00-21:00", "15:00-17:00", null, at("2026-08-28T16:00:00")),
    ).toEqual({ kind: "break", until: "17:00" });
  });

  it('"금요일" 표기·가운뎃점 구분자도 dayoff', () => {
    expect(
      openStatus("11:00-21:00", null, "금요일", at("2026-08-28T14:00:00")).kind,
    ).toBe("dayoff");
    expect(
      openStatus(
        "11:00-21:00",
        null,
        "토요일·금요일",
        at("2026-08-28T14:00:00"),
      ).kind,
    ).toBe("dayoff");
  });

  it("격주 휴무(마지막주 금요일)는 dayoff로 판정하지 않는다", () => {
    expect(
      openStatus(
        "11:00-21:00",
        null,
        "마지막주 금요일",
        at("2026-08-28T14:00:00"),
      ).kind,
    ).toBe("open");
  });

  it("휴무 요일이면 dayoff (2026-08-28은 금요일)", () => {
    expect(
      openStatus("11:00-21:00", null, "금", at("2026-08-28T14:00:00")).kind,
    ).toBe("dayoff");
    expect(
      openStatus("11:00-21:00", null, "월,화", at("2026-08-28T14:00:00")).kind,
    ).toBe("open");
  });

  it("복수 구간을 지원한다", () => {
    const hours = "11:00-15:00,17:00-21:00";
    expect(openStatus(hours, null, null, at("2026-08-28T16:00:00")).kind).toBe(
      "closed",
    );
    expect(openStatus(hours, null, null, at("2026-08-28T18:00:00")).kind).toBe(
      "open",
    );
  });

  it("자정 넘김 구간(심야)을 지원한다", () => {
    expect(
      openStatus("18:00-02:00", null, null, at("2026-08-28T01:00:00")).kind,
    ).toBe("open");
    expect(
      openStatus("18:00-02:00", null, null, at("2026-08-28T12:00:00")).kind,
    ).toBe("closed");
  });

  it("파싱 불가·없음이면 unknown", () => {
    expect(openStatus(null, null, null, at("2026-08-28T14:00:00")).kind).toBe(
      "unknown",
    );
    expect(
      openStatus("매일 다름", null, null, at("2026-08-28T14:00:00")).kind,
    ).toBe("unknown");
  });
});

describe("입력 관대화", () => {
  it("en-dash·물결 구분자를 허용한다", () => {
    expect(
      openStatus("11:30–21:00", null, null, new Date("2026-08-28T14:00:00"))
        .kind,
    ).toBe("open");
    expect(
      openStatus("11:30~21:00", null, null, new Date("2026-08-28T14:00:00"))
        .kind,
    ).toBe("open");
  });
});
