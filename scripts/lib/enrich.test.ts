import { describe, expect, it } from "vitest";
import {
  matchEnrichment,
  mergeMatched,
  mergeEnrichments,
  promoteSoups,
  toSlug,
  type Enrichment,
} from "./enrich";

describe("toSlug", () => {
  it("로마자 슬러그 생성·중복 시 접미사", () => {
    const taken = new Set<string>();
    expect(toSlug("멘야준", "", taken)).toBe("mennyajun");
    expect(toSlug("멘야준", "", taken)).toBe("mennyajun-2");
  });

  it("지점명을 포함한다", () => {
    const taken = new Set<string>();
    expect(toSlug("역전우동", "서울역점", taken)).toMatch(/^yeokjeonudong-/);
  });
});

describe("matchEnrichment", () => {
  const list: Enrichment[] = [
    { name: "아오리의 행방불명", soups: ["돈코츠"] },
    { name: "멘야준", soups: ["니보시"] },
  ];

  it("정규화 부분 매칭(3자 이상)으로 찾는다", () => {
    expect(matchEnrichment("아오리의행방불명", "노원점", list)).toHaveLength(1);
    expect(matchEnrichment("잇풍당", "", list)).toHaveLength(0);
  });
});

describe("mergeEnrichments", () => {
  it("복수 소스의 장르를 합집합, 단일 값은 선착", () => {
    const merged = mergeEnrichments([
      { name: "a", soups: ["돈코츠"], instagram: "one" },
      { name: "a", soups: ["쇼유"], instagram: "two", closed: true },
    ]);
    expect(merged.soups).toEqual(["돈코츠", "쇼유"]);
    expect(merged.instagram).toBe("one");
    expect(merged.closed).toBe(true);
  });
});

describe("promoteSoups", () => {
  it("토마토 세부를 표준 스프로 승격하고 세부에서 제거한다", () => {
    const e = promoteSoups({
      name: "a",
      soups: ["쇼유"],
      soupDetail: ["토마토라멘", "교카이", "하카타"],
    });
    expect(e.soups).toEqual(["쇼유", "토마토", "교카이"]);
    expect(e.soupDetail).toEqual(["하카타"]);
  });
});

describe("mergeMatched", () => {
  const base = { sourceNote: "디시" };
  it("위치 종속 필드는 정확 일치에서만 병합 — 본점→지점 전파 차단", () => {
    const matches = [
      {
        ...base,
        name: "부탄츄",
        area: "홍대",
        hours: "11:00-21:00",
        naverPlace: "https://naver.me/hongdae",
        soups: ["돈코츠"],
        instagram: "@butanchu",
      },
    ];
    const e = mergeMatched("부탄츄", "잠실점", matches);
    expect(e.area).toBeUndefined();
    expect(e.hours).toBeUndefined();
    expect(e.naverPlace).toBeUndefined();
    expect(e.soups).toEqual(["돈코츠"]);
    expect(e.instagram).toBe("@butanchu");
  });

  it("정확 일치 매칭은 위치 필드도 그대로", () => {
    const matches = [
      { ...base, name: "혼네", area: "서울대입구", hours: "11:00-20:00" },
    ];
    const e = mergeMatched("혼네", "", matches);
    expect(e.area).toBe("서울대입구");
    expect(e.hours).toBe("11:00-20:00");
  });

  it("closed 플래그도 지점 전파 차단 — 본점 폐업이 지점을 닫지 않게", () => {
    const e = mergeMatched("로지라멘", "강남점", [
      { ...base, name: "로지라멘", closed: true },
    ]);
    expect(e.closed).toBeFalsy();
  });

  it("areaConfirmed 엔트리의 area가 미확증 area를 이긴다", () => {
    const e = mergeMatched("담택", "", [
      { ...base, name: "담택", area: "홍대" },
      { ...base, name: "담택", area: "망원", areaConfirmed: true },
    ]);
    expect(e.area).toBe("망원");
    expect(e.areaConfirmed).toBe(true);
  });
});

describe("mergeMatched — 동명 다지점", () => {
  const entry = {
    name: "산쪼메",
    hours: "11:00-20:30",
    soups: ["돈코츠"],
    sourceNote: "수집",
  };
  it("동명 행이 여럿이면 addrHint 없는 위치 필드는 버린다", () => {
    const e = mergeMatched("산쪼메", "", [entry], {
      ambiguous: true,
      address: "서울특별시 강서구 화곡로 344",
    });
    expect(e.hours).toBeUndefined();
    expect(e.soups).toEqual(["돈코츠"]);
  });

  it("addrHint가 행 주소와 맞으면 그 행에만 위치 필드가 붙는다", () => {
    const hinted = { ...entry, addrHint: "화곡로", hours: "11:00-21:30" };
    const hit = mergeMatched("산쪼메", "", [hinted], {
      ambiguous: true,
      address: "서울특별시 강서구 화곡로 344",
    });
    expect(hit.hours).toBe("11:00-21:30");
    const miss = mergeMatched("산쪼메", "", [hinted], {
      ambiguous: true,
      address: "서울특별시 광진구 아차산로51길 10",
    });
    expect(miss.hours).toBeUndefined();
  });

  it("동명이 아니면 addrHint 없이도 기존대로 병합", () => {
    const e = mergeMatched("산쪼메", "", [entry], {
      ambiguous: false,
      address: "서울특별시 강서구 화곡로 344",
    });
    expect(e.hours).toBe("11:00-20:30");
  });
});
