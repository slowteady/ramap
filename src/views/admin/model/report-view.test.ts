import { describe, expect, it } from "vitest";
import type { AdminReport } from "./admin-api";
import {
  editRows,
  groupReports,
  linkLabel,
  parseDetails,
  type AdminShop,
} from "./report-view";

const report = (over: Partial<AdminReport>): AdminReport => ({
  id: 1,
  type: "new",
  shopName: "히노아지",
  location: "",
  message: null,
  details: {},
  photoUrls: [],
  createdAt: "2026-10-23T04:10:00Z",
  status: "open",
  resolution: null,
  note: null,
  resolvedAt: null,
  ...over,
});

describe("linkLabel", () => {
  it("플랫폼 링크는 서비스 이름으로", () => {
    expect(
      linkLabel("https://map.naver.com/p/entry/place/2023153907?c=15.00"),
    ).toBe("네이버 지도");
    expect(linkLabel("https://naver.me/abc")).toBe("네이버 지도");
    expect(linkLabel("https://place.map.kakao.com/123")).toBe("카카오맵");
    expect(linkLabel("https://www.instagram.com/hinoaji/")).toBe("인스타그램");
  });

  it("그 외는 도메인, URL이 아니면 원문", () => {
    expect(linkLabel("https://blog.example.com/post/1")).toBe(
      "blog.example.com",
    );
    expect(linkLabel("부산대 정문 앞")).toBe("부산대 정문 앞");
  });
});

describe("parseDetails", () => {
  it("신규 제보의 지점·링크·핀을 꺼낸다", () => {
    const d = parseDetails({
      type: "new",
      branch: "부산대점",
      links: ["https://naver.me/a"],
      pin: { lat: 35.23, lng: 129.08 },
    });
    expect(d.branch).toBe("부산대점");
    expect(d.links).toEqual(["https://naver.me/a"]);
    expect(d.pin).toEqual({ lat: 35.23, lng: 129.08 });
  });

  it("형태가 어긋난 값은 버린다", () => {
    const d = parseDetails({ links: "x", pin: { lat: "1" }, items: [3] });
    expect(d.links).toEqual([]);
    expect(d.pin).toBeNull();
    expect(d.items).toEqual([]);
    expect(parseDetails(null).links).toEqual([]);
  });
});

describe("groupReports", () => {
  it("같은 링크의 신규 제보는 최신 1건으로 묶는다", () => {
    const link = "https://map.naver.com/p/entry/place/2023153907?c=15.00";
    const groups = groupReports([
      report({
        id: 5,
        details: { links: [link] },
        createdAt: "2026-10-23T04:11:00Z",
      }),
      report({ id: 4, details: { links: [`${link}&x=1`] } }),
      report({
        id: 6,
        type: "edit",
        shopName: "우마이365라멘",
        details: { shopId: "umai" },
      }),
    ]);
    expect(groups).toHaveLength(2);
    expect(groups[0].primary.id).toBe(5);
    expect(groups[0].duplicates.map((r) => r.id)).toEqual([4]);
  });

  it("링크가 없으면 공백 무시한 이름으로, 상태가 다르면 따로", () => {
    const groups = groupReports([
      report({ id: 1, shopName: "멘야 비토리" }),
      report({ id: 2, shopName: "멘야비토리" }),
      report({ id: 3, shopName: "멘야비토리", status: "done" }),
    ]);
    expect(groups.map((g) => g.duplicates.length)).toEqual([1, 0]);
  });
});

describe("editRows", () => {
  const shop: AdminShop = {
    id: "umai",
    name: "우마이365라멘",
    branch: null,
    address: "김해시",
    hours: "10:30-20:30",
    breakTime: null,
    closedDays: null,
  };

  it("변경 항목마다 현재 값과 제보 값을 나란히", () => {
    expect(
      editRows(
        { items: ["hours", "menu"], fields: { menu: "가격 인상" } },
        shop,
      ),
    ).toEqual([
      { label: "영업시간", current: "10:30-20:30", proposed: null },
      { label: "메뉴·가격", current: null, proposed: "가격 인상" },
    ]);
  });

  it("영업시간 현재 값에 브레이크·휴무를 붙인다", () => {
    const rows = editRows(
      { items: ["hours"], fields: { hours: "11:00-21:00" } },
      { ...shop, breakTime: "15:00-16:00", closedDays: "월" },
    );
    expect(rows[0].current).toBe(
      "10:30-20:30 · 브레이크 15:00-16:00 · 휴무 월",
    );
    expect(rows[0].proposed).toBe("11:00-21:00");
  });

  it("매장을 못 찾으면 현재 값 없이", () => {
    expect(
      editRows({ items: ["hours"], fields: {} }, undefined)[0].current,
    ).toBeNull();
  });
});
