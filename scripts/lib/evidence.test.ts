import { describe, expect, it } from "vitest";
import {
  buildQueries,
  extractPlaceStatus,
  extractSnippets,
  hasNoResults,
  htmlToText,
  parseGalleryList,
  parseGalleryPost,
  isEventTitle,
} from "./evidence";

describe("buildQueries — 상호 + 동/도로명으로 검색어 2개", () => {
  it("괄호 속 법정동과 도로명을 각각 붙인다", () => {
    expect(
      buildQueries(
        "라멘 기료쿠(RAMEN KIRYOKU)",
        "서울특별시 강남구 압구정로50길 7, 정동상가 내제1층 11호 (신사동)",
      ),
    ).toEqual(["라멘 기료쿠 신사동", "라멘 기료쿠 압구정로50길"]);
  });

  it("괄호 동이 없으면 시군구를 쓴다", () => {
    expect(
      buildQueries("노조미라멘본점", "전북특별자치도 군산시 삼학동 261-24"),
    ).toEqual(["노조미라멘본점 삼학동", "노조미라멘본점 군산시"]);
  });
});

describe("htmlToText", () => {
  it("script·style을 버리고 태그·엔티티를 풀어 공백을 접는다", () => {
    expect(
      htmlToText(
        "<style>x{}</style><div>쇼부&nbsp;라멘</div><script>a()</script>\n<b>점</b>",
      ),
    ).toBe("쇼부 라멘 점");
  });
});

describe("extractPlaceStatus — Daum 장소 카드의 영업 표기", () => {
  it("이용 영업중과 영업시간을 뽑는다", () => {
    const t =
      "장소 전체보기 쇼부 라멘 서소문 점 일본식라면 주소 도로명 주소 서울 중구 서소문로 95 지하1층 전화 02-772-9477 이용 영업중 | 08:00~20:00 접기 월 08:00~20:00";
    expect(extractPlaceStatus(t)).toEqual({
      status: "영업중",
      card: expect.stringContaining("서소문로 95"),
    });
  });

  it("장소 카드가 없으면 null", () => {
    expect(extractPlaceStatus("통합웹 블로그 카페 웹문서")).toBeNull();
  });
});

describe("extractSnippets — 상호가 들어간 후기 조각(날짜 포함)", () => {
  it("검색어 메아리(페이지 제목·광고·결과 없음 안내)는 후기로 치지 않는다", () => {
    const t =
      "카잇푸도라멘 신대방동 &ndash; Daum 검색 본문 바로가기 / '카잇푸도라멘 신대방11길 ' 관련 광고입니다. / 과 '카잇푸도라멘 신대방동' 에 대한 검색결과가 없습니다.";
    expect(extractSnippets(t, "카잇푸도라멘")).toEqual([]);
  });

  it("공백 무시로 상호를 찾고 뒤따르는 날짜를 붙인다", () => {
    const t =
      "앞부분 쇼부 라멘 서소문 점 돈코츠 라멘 점심 맛집 후기입니다 2026.09.26 블로그 무관한 글 2026.01.01";
    const r = extractSnippets(t, "쇼부라멘 서소문점");
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ date: "2026.09.26" });
    expect(r[0].text).toContain("돈코츠");
  });
});

describe("hasNoResults", () => {
  it("검색결과 없음 안내를 알아본다", () => {
    expect(
      hasNoResults("과 '라멘 기료쿠 신사동' 에 대한 검색결과가 없습니다."),
    ).toBe(true);
    expect(hasNoResults("쇼부 라멘 서소문 점 이용 영업중")).toBe(false);
  });
});

describe("parseGalleryList — 라멘 미니갤 검색 목록", () => {
  it("글 번호·제목·작성시각·URL을 뽑고 공지는 버린다", () => {
    const html = `
      <tr class="ub-content "><td class="gall_num">공지</td><td class="gall_tit"><a href="/x">공지</a></td><td class="gall_date" title="2026-01-01 00:00:00">01.01</td></tr>
      <tr class="ub-content us-post" data-no="122650"><td class="gall_num">122650</td>
      <td class="gall_tit ub-word"><a href="/mini/board/view/?id=goodramen&no=122650&page=1"><em class="icon_img"></em>천하일면 폐업했네</a>
      <a class="reply_numbox" href="#"><span class="reply_num">[8]</span></a></td>
      <td class="gall_date" title="2026-10-02 02:29:27">10.02</td></tr>`;
    expect(parseGalleryList(html)).toEqual([
      {
        no: 122650,
        title: "천하일면 폐업했네",
        postedAt: "2026-10-02 02:29:27",
        url: "https://gall.dcinside.com/mini/board/view/?id=goodramen&no=122650",
      },
    ]);
  });
});

describe("parseGalleryPost — 라멘 미니갤 본문", () => {
  it("스크립트를 버리고 제목·본문만 남긴다", () => {
    const html = `<span class="title_subject">다음달 니보시 전문 라멘집 오픈예정</span>
      <span class="gall_date" title="2026-10-12 10:00:00">x</span>
      <div class="write_div" style="x"><script>var a=1;</script><p>마포구 연남동 387-15</p><p>니보시츄도쿠</p>
      추천검색 <div class="btn_recommend_box">추천</div>`;
    expect(parseGalleryPost(html)).toEqual({
      title: "다음달 니보시 전문 라멘집 오픈예정",
      postedAt: "2026-10-12 10:00:00",
      body: "마포구 연남동 387-15 니보시츄도쿠",
    });
  });
});

describe("isEventTitle — 오픈·폐업·이전 사건 제목", () => {
  it.each([
    ["시시오 왜 벌써 폐업하노", true],
    ["멘노아지 이전했냐?", true],
    ["유니드 2호점 10월 5일 오픈", true],
    ["도쿄 9박10일 47라+2빙수 후기", false],
  ])("%s → %s", (title, expected) => {
    expect(isEventTitle(title)).toBe(expected);
  });
});
