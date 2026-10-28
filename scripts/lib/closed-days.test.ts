import { describe, expect, it } from "vitest";
import { decideClosedDays, extractClosedDays } from "./closed-days";

describe("extractClosedDays", () => {
  it("'매주 월요일 휴무'·'정기휴무 화요일' 같은 정기 휴무 요일을 뽑는다", () => {
    expect(extractClosedDays("영업시간 11:30~21:00 매주 월요일 휴무")).toEqual([
      "월",
    ]);
    expect(extractClosedDays("정기휴무 : 매주 화요일")).toEqual(["화"]);
    expect(extractClosedDays("휴무일: 토, 일")).toEqual(["토", "일"]);
    expect(extractClosedDays("월·화 휴무입니다")).toEqual(["월", "화"]);
  });

  it("연중무휴·휴무 없음은 빈 배열", () => {
    expect(extractClosedDays("연중무휴로 운영합니다")).toEqual([]);
    expect(extractClosedDays("휴무 없음, 브레이크타임 15시")).toEqual([]);
  });

  it("임시·명절·날짜 휴무는 정기 휴무가 아니다", () => {
    expect(extractClosedDays("이번 주 월요일 임시휴무")).toBeNull();
    expect(extractClosedDays("추석 당일 휴무")).toBeNull();
    expect(extractClosedDays("10월 3일 휴무")).toBeNull();
  });

  it("격주·매달 n번째 휴무는 매주 휴무가 아니라 쓰지 않는다", () => {
    expect(extractClosedDays("매달 2, 4번째 수요일 정기 휴무")).toBeNull();
    expect(extractClosedDays("매달 첫째. 셋째 월요일 휴무")).toBeNull();
    expect(extractClosedDays("격주 화요일 휴무")).toBeNull();
    expect(extractClosedDays("매월 마지막주 월요일 휴무")).toBeNull();
  });

  it("장소 카드 문구가 섞인 조각은 쓰지 않는다 — 카카오 장소 정보 대량 수집 금지(09번)", () => {
    expect(
      extractClosedDays("도로명 주소 서울 마포구 … 이용 영업중 | 일 휴무"),
    ).toBeNull();
  });

  it("'휴무 일정'의 '일'을 일요일로 읽지 않는다", () => {
    expect(
      extractClosedDays("휴무 일정은 인스타그램으로 공지하고 있어요"),
    ).toBeNull();
    expect(extractClosedDays("월화휴무")).toEqual(["월", "화"]);
  });

  it("휴무 단서가 없으면 null", () => {
    expect(extractClosedDays("돈코츠라멘이 진하고 맛있었다")).toBeNull();
  });
});

describe("decideClosedDays", () => {
  const recent = "2026.09.20";
  const old = "2024.03.01";

  it("서로 다른 후기 2건이 같은 요일이면 채택", () => {
    expect(
      decideClosedDays([
        { days: ["월"], date: null },
        { days: ["월"], date: null },
      ]),
    ).toBe("월요일");
  });

  it("후기 1건만으로는 최근 글이어도 채택하지 않는다 — 같은 글의 다른 가게 휴무가 섞이는 사례(2026-10-28 표본 6건 중 2건 오류)", () => {
    expect(decideClosedDays([{ days: ["일"], date: recent }])).toBeNull();
  });

  it("오래된 후기 1건만으로는 채택하지 않는다", () => {
    expect(decideClosedDays([{ days: ["일"], date: old }])).toBeNull();
  });

  it("다수(2건 이상)가 소수의 3배 이상이면 채택 — 섞여 든 다른 가게 조각 한 건에 막히지 않게", () => {
    const ev = (d: "월" | "수") => ({ days: [d], date: null });
    expect(decideClosedDays([ev("월"), ev("월"), ev("월"), ev("수")])).toBe(
      "월요일",
    );
    expect(decideClosedDays([ev("월"), ev("월"), ev("수")])).toBeNull();
  });

  it("후기끼리 요일이 다르면 채택하지 않는다", () => {
    expect(
      decideClosedDays([
        { days: ["월"], date: recent },
        { days: ["화"], date: recent },
      ]),
    ).toBeNull();
  });

  it("연중무휴 합의는 '연중무휴'", () => {
    expect(
      decideClosedDays([
        { days: [], date: null },
        { days: [], date: null },
      ]),
    ).toBe("연중무휴");
  });

  it("여러 요일은 월→일 순서로 '토요일, 일요일'", () => {
    expect(
      decideClosedDays([
        { days: ["일", "토"], date: null },
        { days: ["토", "일"], date: null },
      ]),
    ).toBe("토요일, 일요일");
  });
});
