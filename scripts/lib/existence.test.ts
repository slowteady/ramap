import { describe, expect, it } from "vitest";
import {
  classifyExistence,
  isDirectorySnippet,
  isWeakShop,
  normalizeSnippetDate,
  selectExistenceTargets,
} from "./existence";

const ADDRESS = "서울특별시 마포구 독막로3길 33";
const CUTOFF = "2025-11-02";

describe("normalizeSnippetDate", () => {
  it("점 표기를 하이픈으로 바꾼다", () => {
    expect(normalizeSnippetDate("2026.08.19")).toBe("2026-08-19");
  });

  it("날짜가 없으면 null", () => {
    expect(normalizeSnippetDate(null)).toBeNull();
    expect(normalizeSnippetDate("")).toBeNull();
  });
});

describe("isDirectorySnippet — 인허가 재게시·목록 사이트는 근거가 아니다", () => {
  it("다이닝코드·메디컬맵·카맵·상가 목록을 디렉터리로 본다", () => {
    expect(isDirectorySnippet("미스터라멘 - 합정 라멘 맛집 - 다이닝코드")).toBe(
      true,
    );
    expect(
      isDirectorySnippet("[생활] 미스터라멘 추천맛집 - 일식 메디컬맵"),
    ).toBe(true);
    expect(isDirectorySnippet("carmap official 미스터 라멘 HERE")).toBe(true);
    expect(
      isDirectorySnippet("일식 면 요리 상가 목록(6곳) 성업 중입니다"),
    ).toBe(true);
  });

  it("블로그 후기는 디렉터리가 아니다", () => {
    expect(isDirectorySnippet("blog.naver.com 미스터 라멘 합정점 후기")).toBe(
      false,
    );
  });
});

describe("classifyExistence", () => {
  const search = (
    snippets: { text: string; date: string | null }[],
    place: { status: string; card: string } | null = null,
  ) => ({ place, snippets });

  it("같은 주소 장소 카드에 영업 표기가 있으면 card", () => {
    const result = classifyExistence(
      ADDRESS,
      [
        search([], {
          status: "영업중",
          card: "미스터 라멘 도로명 주소 서울 마포구 독막로3길 33 1층",
        }),
      ],
      CUTOFF,
    );
    expect(result.verdict).toBe("card");
  });

  it("장소 카드가 다른 주소면 근거로 치지 않는다", () => {
    const result = classifyExistence(
      ADDRESS,
      [
        search([], {
          status: "영업중",
          card: "미스터 라멘 서울 마포구 어울마당로 136-13",
        }),
      ],
      CUTOFF,
    );
    expect(result.verdict).toBe("none");
  });

  it("영업 표기가 없는 장소 카드는 근거가 아니다", () => {
    const result = classifyExistence(
      ADDRESS,
      [search([], { status: "표기 없음", card: "독막로3길 33" })],
      CUTOFF,
    );
    expect(result.verdict).toBe("none");
  });

  it("주소가 들어간 최근 12개월 후기가 있으면 recent", () => {
    const result = classifyExistence(
      ADDRESS,
      [
        search([
          {
            text: "합정 라멘 미스터 라멘 독막로 3길 33 후기",
            date: "2026.08.26",
          },
        ]),
      ],
      CUTOFF,
    );
    expect(result).toEqual({ verdict: "recent", lastDate: "2026-08-26" });
  });

  it("주소가 없는 후기는 다른 지점일 수 있어 근거로 치지 않는다", () => {
    const result = classifyExistence(
      ADDRESS,
      [search([{ text: "홍대 미스터 라멘 서교점 후기", date: "2026.08.26" }])],
      CUTOFF,
    );
    expect(result.verdict).toBe("none");
  });

  it("주소가 맞아도 디렉터리면 근거로 치지 않는다", () => {
    const result = classifyExistence(
      ADDRESS,
      [
        search([
          { text: "독막로3길 33 미스터라멘 - 다이닝코드", date: "2026.07.01" },
        ]),
      ],
      CUTOFF,
    );
    expect(result.verdict).toBe("none");
  });

  it("주소가 맞는 후기가 12개월보다 오래되면 stale과 마지막 날짜", () => {
    const result = classifyExistence(
      ADDRESS,
      [
        search([
          { text: "미스터 라멘 합정점 독막로3길 33", date: "2021.05.18" },
          { text: "미스터 라멘 독막로3길 33 혼밥", date: "2021.06.03" },
        ]),
      ],
      CUTOFF,
    );
    expect(result).toEqual({ verdict: "stale", lastDate: "2021-06-03" });
  });
});

describe("isWeakShop — 영업시간·메뉴·인스타가 모두 없으면 약한 근거", () => {
  it("셋 다 없으면 true", () => {
    expect(isWeakShop({ hours: null, menus: [], instagram: null })).toBe(true);
  });

  it("하나라도 있으면 false", () => {
    expect(
      isWeakShop({ hours: "11:00-21:00", menus: [], instagram: null }),
    ).toBe(false);
    expect(isWeakShop({ hours: null, menus: [{}], instagram: null })).toBe(
      false,
    );
    expect(isWeakShop({ hours: null, menus: [], instagram: "acct" })).toBe(
      false,
    );
  });
});

describe("selectExistenceTargets — 근거 약함 ∩ 인허가 최신본 미발견·폐업 전이", () => {
  const shop = (id: string, name: string, address: string, weak = true) => ({
    id,
    name,
    branch: null,
    address,
    status: "open" as const,
    hours: weak ? null : "11:00",
    menus: [],
    instagram: null,
  });

  it("약하고 명부에서 사라진 영업 매장만 고른다", () => {
    const shops = [
      shop("a", "가라멘", "서울 마포구 독막로3길 33"),
      shop("b", "나라멘", "서울 마포구 와우산로 1"),
      shop("c", "다라멘", "서울 마포구 연남로 5", false),
    ];
    const gone = [
      { name: "가라멘", branch: "", address: "서울 마포구 독막로3길 33, 1층" },
      { name: "다라멘", branch: "", address: "서울 마포구 연남로 5" },
    ];
    expect(selectExistenceTargets(shops, gone).map((s) => s.id)).toEqual(["a"]);
  });

  it("폐업 상태 매장은 대상이 아니다", () => {
    const closed = {
      ...shop("a", "가라멘", "서울 마포구 독막로3길 33"),
      status: "closed" as const,
    };
    expect(
      selectExistenceTargets(
        [closed],
        [{ name: "가라멘", branch: "", address: "서울 마포구 독막로3길 33" }],
      ),
    ).toEqual([]);
  });
});
