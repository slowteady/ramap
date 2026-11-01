import dayjs from "dayjs";
import { describe, expect, it } from "vitest";
import type { AdminReport } from "./admin-api";
import {
  ageLabel,
  composeReason,
  editRows,
  sortGroups,
  groupReports,
  linkLabel,
  parseDetails,
  resolvedMessage,
  photoReviewPatch,
  resolvePatch,
  PHOTO_RESET_PATCH,
  type AdminShop,
} from "./report-view";

const report = (over: Partial<AdminReport>): AdminReport => ({
  rejectReason: null,
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

describe("ageLabel", () => {
  const now = dayjs("2026-10-27T12:00:00+09:00");
  it("접수 후 지난 날수", () => {
    expect(ageLabel("2026-10-27T09:00:00+09:00", now)).toBe("오늘");
    expect(ageLabel("2026-10-26T13:00:00+09:00", now)).toBe("1일 전");
    expect(ageLabel("2026-10-23T13:00:00+09:00", now)).toBe("4일 전");
  });
});

describe("sortGroups", () => {
  const g = (
    id: number,
    createdAt: string,
    resolvedAt: string | null = null,
  ) => ({
    primary: report({ id, createdAt, resolvedAt }),
    duplicates: [],
  });

  it("대기는 오래 기다린 순 — 묶음은 가장 이른 접수 기준", () => {
    const groups = [
      g(6, "2026-10-24T00:00:00Z"),
      {
        primary: report({ id: 5, createdAt: "2026-10-23T04:11:00Z" }),
        duplicates: [report({ id: 4, createdAt: "2026-10-23T04:10:00Z" })],
      },
    ];
    expect(sortGroups(groups, "open").map((x) => x.primary.id)).toEqual([5, 6]);
  });

  it("처리됨은 처리 시각 최신순", () => {
    const groups = [
      g(1, "2026-10-01T00:00:00Z", "2026-10-02T00:00:00Z"),
      g(2, "2026-10-01T00:00:00Z", "2026-10-05T00:00:00Z"),
    ];
    expect(sortGroups(groups, "done").map((x) => x.primary.id)).toEqual([2, 1]);
  });
});

describe("composeReason", () => {
  it("칩과 직접 입력을 합친다", () => {
    expect(composeReason("확인 불가", "")).toBe("확인 불가");
    expect(composeReason("확인 불가", " 전화 안 받음 ")).toBe(
      "확인 불가 — 전화 안 받음",
    );
    expect(composeReason(null, "기타 사유")).toBe("기타 사유");
    expect(composeReason(null, "  ")).toBe("");
  });
});

describe("resolvedMessage", () => {
  it("처리 결과마다 한 문장으로 알린다", () => {
    expect(resolvedMessage("applied")).toBe("반영했어요");
    expect(resolvedMessage("duplicate")).toBe("중복으로 닫았어요");
    expect(resolvedMessage("rejected")).toBe("반려했어요");
  });
});

describe("사진 검수 기록", () => {
  const now = dayjs("2026-10-31T10:00:00+09:00");

  it("승인·반려하면 검수 시각을 남긴다", () => {
    expect(photoReviewPatch("approved", undefined, now)).toEqual({
      status: "approved",
      reject_reason: null,
      reviewed_at: now.toISOString(),
    });
    expect(photoReviewPatch("rejected", "부적절", now).reject_reason).toBe(
      "부적절",
    );
  });

  it("되돌리면 검수 시각을 비운다", () => {
    expect(PHOTO_RESET_PATCH).toEqual({
      status: "pending",
      reject_reason: null,
      reviewed_at: null,
    });
  });
});

describe("resolvePatch", () => {
  const now = dayjs("2026-10-31T10:00:00+09:00");

  it("반려는 사유 칩과 메모를 따로 저장한다", () => {
    expect(resolvePatch("rejected", "전화 안 받음", "확인 불가", now)).toEqual({
      status: "done",
      resolution: "rejected",
      note: "전화 안 받음",
      reject_reason: "확인 불가",
      resolved_at: now.toISOString(),
    });
  });

  it("반려가 아니면 사유를 비운다", () => {
    expect(resolvePatch("applied", undefined, "확인 불가", now)).toMatchObject({
      note: null,
      reject_reason: null,
    });
  });
});
