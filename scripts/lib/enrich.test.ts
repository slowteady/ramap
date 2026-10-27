import { describe, expect, it } from "vitest";
import {
  matchEnrichment,
  mergeMatched,
  mergeEnrichments,
  promoteFromMenus,
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

  it("세부의 이에케·지로 표기 이형은 계보로 올린다 — 지도 계보 필터에 잡히게", () => {
    const iekei = promoteSoups({
      name: "멘야비토리",
      soupDetail: ["이에케", "니보시"],
    });
    expect(iekei.lineages).toEqual(["이에케"]);
    expect(iekei.soupDetail).toEqual(["니보시"]);
    const jiro = promoteSoups({
      name: "칸다소바",
      soupDetail: ["지로", "지로케", "지로계"],
    });
    expect(jiro.lineages).toEqual(["지로계"]);
    expect(jiro.soupDetail).toEqual([]);
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

describe("mergeMatched — 승계 차단", () => {
  it("정확 일치 항목이 standalone이면 접두 일치 항목(범용 상호 '라멘야')의 장르·인스타를 물려받지 않는다", () => {
    const merged = mergeMatched(
      "라멘야 삼미당",
      "",
      [
        { name: "라멘야", soups: ["돈코츠"], instagram: "ramenya_gimpo" },
        {
          name: "라멘야 삼미당",
          addrHint: "석천로178번길 21",
          forms: ["라멘", "마제소바"],
          standalone: true,
        },
      ],
      { address: "경기도 부천시 원미구 석천로178번길 21" },
    );
    expect(merged.soups ?? []).toEqual([]);
    expect(merged.instagram).toBeUndefined();
    expect(merged.forms).toEqual(["라멘", "마제소바"]);
  });

  it("standalone 항목은 거꾸로 짧은 범용 상호 매장('라멘야')에도 번지지 않는다", () => {
    const merged = mergeMatched("라멘야", "", [
      { name: "라멘야", soups: ["돈코츠"] },
      {
        name: "라멘야 삼미당",
        forms: ["마제소바"],
        soupDetail: ["닭 육수"],
        standalone: true,
      },
    ]);
    expect(merged.soups).toEqual(["돈코츠"]);
    expect(merged.forms ?? []).toEqual([]);
    expect(merged.soupDetail ?? []).toEqual([]);
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

describe("unverified 보류 신호", () => {
  it("addrHint 일치 행에만 unverified가 붙는다", () => {
    const entry = {
      name: "미스터라멘",
      addrHint: "새문안로 92",
      unverified: true,
      sourceNote: "재검증",
    };
    const hit = mergeMatched("미스터라멘", "", [entry], {
      ambiguous: true,
      address: "서울특별시 종로구 새문안로 92",
    });
    expect(hit.unverified).toBe(true);
    const miss = mergeMatched("미스터라멘", "", [entry], {
      ambiguous: true,
      address: "서울특별시 마포구 독막로3길 33",
    });
    expect(miss.unverified).toBeFalsy();
  });
});

describe("형태 정규화", () => {
  it("아부라소바는 별도 형태 — forms에 그대로 두고 세부에는 중복시키지 않는다(2026-10-19 PO)", () => {
    const e = promoteSoups({
      name: "칸키라멘",
      forms: ["라멘", "아부라소바"],
      sourceNote: "조사",
    });
    expect(e.forms).toEqual(["라멘", "아부라소바"]);
    expect(e.soupDetail ?? []).not.toContain("아부라소바");
  });

  it("세부의 아부라소바 표기 이형은 형태로 올리고 세부에서 뺀다", () => {
    const e = promoteSoups({
      name: "a",
      soupDetail: ["아부라라멘", "청탕"],
    });
    expect(e.forms).toEqual(["라멘", "아부라소바"]);
    expect(e.soupDetail).toEqual(["청탕"]);
  });
});

describe("판정 마커의 위치 종속성", () => {
  it("동명 다행이면 '라멘집 아님' 판정은 addrHint 일치 행에만 붙는다", () => {
    const entry = {
      name: "혼네",
      soupDetail: ["라멘집 아님"],
      addrHint: "관악로24길",
      sourceNote: "발굴 조사",
    };
    const izakaya = mergeMatched("혼네", "", [entry], {
      ambiguous: true,
      address: "서울특별시 관악구 관악로24길 20",
    });
    expect(izakaya.soupDetail).toContain("라멘집 아님");
    const ramen = mergeMatched("혼네", "", [entry], {
      ambiguous: true,
      address: "서울특별시 관악구 관악로14길 6-4",
    });
    expect(ramen.soupDetail ?? []).not.toContain("라멘집 아님");
  });

  it("스타일 세부(지로라멘 등)는 기존대로 브랜드 공유", () => {
    const entry = {
      name: "코이라멘",
      soupDetail: ["지로라멘"],
      sourceNote: "조사",
    };
    const e = mergeMatched("코이라멘", "지로점", [entry], {
      ambiguous: false,
      address: "어딘가",
    });
    expect(e.soupDetail).toContain("지로라멘");
  });
});

describe("판정 마크 최신 우선", () => {
  it("뒤에 온 조사가 판정 마크를 떼면 앞선 마크도 걷는다", () => {
    const merged = mergeEnrichments([
      { name: "대호당", soupDetail: ["실존 미확인"] },
      { name: "대호당", soups: ["돈코츠"] },
    ]);
    expect(merged.soupDetail ?? []).not.toContain("실존 미확인");
  });

  it("뒤에 온 조사가 새 판정 마크를 붙이면 반영한다", () => {
    const merged = mergeEnrichments([
      { name: "삿뽀로", soups: ["미소"] },
      { name: "삿뽀로", soupDetail: ["라멘집 아님"] },
    ]);
    expect(merged.soupDetail ?? []).toContain("라멘집 아님");
  });

  it("판정 마크가 아닌 세부 스타일은 합집합을 유지한다", () => {
    const merged = mergeEnrichments([
      { name: "가게", soupDetail: ["이에케"] },
      { name: "가게", soupDetail: ["유즈"] },
    ]);
    expect(merged.soupDetail).toEqual(
      expect.arrayContaining(["이에케", "유즈"]),
    );
  });
});

describe("promoteFromMenus — 메뉴명·세부에 있는 장르를 필터 값으로", () => {
  const run = (menus: string[], soupDetail: string[] = []) =>
    promoteFromMenus({ name: "a", menus, soupDetail });

  it("긴 표현 우선 — 돈코츠쇼유라멘은 돈코츠쇼유만, 돈코츠·쇼유로 쪼개지 않는다", () => {
    const e = run(["돈코츠쇼유라멘|9000"]);
    expect(e.soups).toEqual(["돈코츠쇼유"]);
  });

  it("쇼유·소유 표기, 시오·미소·니보시·탄탄멘·토리파이탄을 잡는다", () => {
    expect(run(["쇼유라멘|9000", "시오라멘|9000"]).soups).toEqual([
      "쇼유",
      "시오",
    ]);
    expect(run(["땡초소유라멘|9000"]).soups).toEqual(["쇼유"]);
    expect(run(["카라이미소라멘"]).soups).toEqual(["미소"]);
    expect(run(["니보시아부라소바"]).soups).toEqual(["니보시"]);
    expect(run(["마라탄탄멘"]).soups).toEqual(["탄탄멘"]);
    expect(run(["토리빠이탄"]).soups).toEqual(["토리파이탄"]);
  });

  it("형태: 츠케멘·마제소바(마제멘)·아부라소바를 각각 올린다", () => {
    expect(run(["토리츠케멘"]).forms).toContain("츠케멘");
    expect(run(["마제멘|11000"]).forms).toContain("마제소바");
    expect(run(["아부라소바|11000"]).forms).toContain("아부라소바");
    expect(run(["아부라소바|11000"]).forms).not.toContain("마제소바");
  });

  it("계보: 이에케·지로 메뉴는 계보로", () => {
    expect(run(["이에케라멘|10000"]).lineages).toEqual(["이에케"]);
    expect(run(["지로라멘"]).lineages).toEqual(["지로계"]);
  });

  it("형태 칸이 비어 있던 매장(기본값 라멘)에 새 형태를 더해도 라멘은 남는다", () => {
    expect(run(["토리빠이탄", "토리츠케멘"]).forms).toEqual(["라멘", "츠케멘"]);
  });

  it("스프 순서는 메뉴에 처음 나온 순서 — 첫 메뉴가 대표가 되게", () => {
    expect(run(["유즈시오라멘", "유즈쇼유라멘"]).soups).toEqual([
      "시오",
      "쇼유",
    ]);
  });

  it("기존 값은 보존하고 합집합만 한다", () => {
    const e = promoteFromMenus({
      name: "a",
      soups: ["돈코츠"],
      menus: ["쇼유라멘"],
    });
    expect(e.soups).toEqual(["돈코츠", "쇼유"]);
  });
});

describe("mergeMatched — 승계 규칙 (2026-10-27 데이터 신뢰도)", () => {
  it("이름만 겹치는 다른 가게에는 장르·인스타를 넘기지 않는다", () => {
    const e = mergeMatched(
      "라멘야누",
      "",
      [{ name: "라멘야", soups: ["돈코츠"], instagram: "ramenya_gimpo" }],
      { address: "서울특별시 마포구 동교로 262-3" },
    );
    expect(e.soups ?? []).toEqual([]);
    expect(e.instagram).toBeUndefined();
  });

  it("지점 표기('…점')면 같은 체인으로 보고 장르·인스타를 넘긴다", () => {
    const e = mergeMatched(
      "코이라멘 장충점",
      "",
      [{ name: "코이라멘", soups: ["돈코츠"], instagram: "koiramen.official" }],
      { address: "서울특별시 중구 장충단로 1" },
    );
    expect(e.soups).toEqual(["돈코츠"]);
    expect(e.instagram).toBe("koiramen.official");
  });

  it("'…점'으로 끝나도 다른 상호 글자가 붙어 있으면 지점이 아니다 (멘야하나 ≠ 멘야하나비 합정점)", () => {
    const e = mergeMatched(
      "멘야하나비 합정점",
      "",
      [{ name: "멘야하나", soups: ["쇼유"], instagram: "menyahana0428" }],
      { address: "서울특별시 마포구 독막로 1 (서교동)" },
    );
    expect(e.soups ?? []).toEqual([]);
    expect(e.instagram).toBeUndefined();
  });

  it("띄어쓰기 없이 붙은 지점명도 지명으로 시작하면 지점이다 (코이라멘수지구청역점)", () => {
    const e = mergeMatched(
      "코이라멘수지구청역점",
      "",
      [{ name: "코이라멘", soups: ["돈코츠"] }],
      { address: "경기도 용인시 수지구 풍덕천로 1" },
    );
    expect(e.soups).toEqual(["돈코츠"]);
  });

  it("남은 글자가 매장 주소의 지명이면 지점으로 본다", () => {
    const e = mergeMatched(
      "오레노라멘송파",
      "",
      [{ name: "오레노라멘", soups: ["토리파이탄"] }],
      { address: "서울특별시 송파구 백제고분로 1" },
    );
    expect(e.soups).toEqual(["토리파이탄"]);
  });

  it("괄호 별칭만 다르면 같은 가게다", () => {
    const e = mergeMatched("쿄라멘(Kyo ramen)", "", [
      { name: "쿄라멘", soups: ["돈코츠"] },
    ]);
    expect(e.soups).toEqual(["돈코츠"]);
  });

  it("짧은 이름 매장도 다른 가게의 긴 이름 항목을 물려받지 않는다", () => {
    const e = mergeMatched("라멘야", "", [
      { name: "라멘야 삼미당", soups: ["토리파이탄"] },
    ]);
    expect(e.soups ?? []).toEqual([]);
  });

  it("주소가 지정된 항목의 인스타는 주소가 맞는 매장에만 붙는다 — 지점 계정이 다른 지점으로 번지지 않게", () => {
    const entries = [
      { name: "와다라멘", soups: ["돈코츠"] },
      {
        name: "와다라멘",
        addrHint: "삼선교로10길",
        instagram: "wada_seongbuk",
      },
    ];
    const other = mergeMatched("와다라멘 역삼점", "", entries, {
      address: "서울특별시 강남구 테헤란로 309",
    });
    expect(other.soups).toEqual(["돈코츠"]);
    expect(other.instagram).toBeUndefined();
  });

  it("계보는 접두 승계하지 않는다 — 한 지점의 사실이 체인 전체로 번지는 것을 막는다", () => {
    const e = mergeMatched(
      "코이라멘 장충점",
      "",
      [{ name: "코이라멘", soups: ["돈코츠"], lineages: ["지로계"] }],
      { address: "서울특별시 중구 장충단로 1" },
    );
    expect(e.lineages ?? []).toEqual([]);
    expect(e.soups).toEqual(["돈코츠"]);
  });

  it("chainWide로 명시한 계보만 지점에 넘긴다", () => {
    const e = mergeMatched(
      "라멘트럭 목동점",
      "",
      [{ name: "라멘트럭", lineages: ["이에케"], chainWide: true }],
      { address: "서울특별시 양천구 목동동로 1" },
    );
    expect(e.lineages).toEqual(["이에케"]);
  });

  it("체인 전체로 명시한 항목은 띄어쓰기 없는 지점명·표기 차이에도 지점으로 본다", () => {
    const entry = {
      name: "태양의토마토라멘",
      lineages: ["본토직영"],
      chainWide: true,
    };
    expect(
      mergeMatched("태양의 토마토라멘 송리단길점", "", [entry], {
        address: "서울특별시 송파구 백제고분로45길 1",
      }).lineages,
    ).toEqual(["본토직영"]);
    expect(
      mergeMatched(
        "부탄츄건대점",
        "",
        [{ name: "부탄츄", lineages: ["지로계"], chainWide: true }],
        { address: "서울특별시 광진구 동일로 1" },
      ).lineages,
    ).toEqual(["지로계"]);
  });

  it("브랜드를 체인으로 선언(chainWide 항목)하면 같은 이름의 다른 항목도 붙여 쓴 지점명에 넘긴다 — 계보는 제외", () => {
    const e = mergeMatched(
      "히노아지삼천포점",
      "",
      [
        { name: "히노아지", chainWide: true },
        { name: "히노아지", soups: ["돈코츠"], lineages: ["이에케"] },
      ],
      { address: "경상남도 사천시 주공로 24" },
    );
    expect(e.soups).toEqual(["돈코츠"]);
    expect(e.lineages ?? []).toEqual([]);
  });

  it("정확 일치 항목의 계보는 그대로 붙는다", () => {
    const e = mergeMatched("코이라멘지로", "", [
      { name: "코이라멘지로", lineages: ["지로계"] },
    ]);
    expect(e.lineages).toEqual(["지로계"]);
  });
});

describe("mergeMatched — 대표값 정합성", () => {
  it("국물 목록에 없는 대표 국물은 버린다 — 시트 검증(대표값 ∈ 목록) 위반 방지", () => {
    const e = mergeMatched(
      "유타로서현",
      "직영점",
      [
        { name: "유타로", primarySoup: "돈코츠" },
        {
          name: "유타로서현 직영점",
          addrHint: "황새울로335번길 8",
          soups: ["쇼유", "시오"],
        },
      ],
      { address: "경기도 성남시 분당구 황새울로335번길 8" },
    );
    expect(e.soups).toEqual(["쇼유", "시오"]);
    expect(e.primarySoup).toBeUndefined();
  });
});
