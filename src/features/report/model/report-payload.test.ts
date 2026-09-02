import { describe, expect, it } from "vitest";
import {
  buildEditPayload,
  buildNewPayload,
  canSubmitEdit,
  canSubmitNew,
  EMPTY_EDIT_DRAFT,
  EMPTY_NEW_DRAFT,
  isDirtyEdit,
  isDirtyNew,
  isLikelyUrl,
  toReportRow,
} from "./report-payload";

const target = { id: "kinka", name: "킨카", location: "성수" };
const pin = { lat: 37.5446, lng: 127.0559 };

describe("새 라멘집 등록", () => {
  it("이름 + (링크·지도 핀·사진 중 하나)가 있어야 제출 가능", () => {
    const photo = new File([""], "a.jpg", { type: "image/jpeg" });
    expect(canSubmitNew(EMPTY_NEW_DRAFT)).toBe(false);
    expect(canSubmitNew({ ...EMPTY_NEW_DRAFT, shopName: "무구" })).toBe(false);
    expect(
      canSubmitNew({
        ...EMPTY_NEW_DRAFT,
        shopName: "무구",
        links: [" https://instagram.com/mugu "],
      }),
    ).toBe(true);
    expect(canSubmitNew({ ...EMPTY_NEW_DRAFT, shopName: "무구", pin })).toBe(
      true,
    );
    expect(
      canSubmitNew({ ...EMPTY_NEW_DRAFT, shopName: "무구", photos: [photo] }),
    ).toBe(true);
    expect(canSubmitNew({ ...EMPTY_NEW_DRAFT, links: ["https://x.kr"] })).toBe(
      false,
    );
  });

  it("형식이 아닌 링크는 링크로 치지 않는다", () => {
    expect(isLikelyUrl("https://instagram.com/mugu")).toBe(true);
    expect(isLikelyUrl("naver.me/abc")).toBe(true);
    expect(isLikelyUrl("성수역 근처")).toBe(false);
    expect(isLikelyUrl("http://a b")).toBe(false);
    expect(
      canSubmitNew({ ...EMPTY_NEW_DRAFT, shopName: "무구", links: ["성수역"] }),
    ).toBe(false);
  });

  it("필수만 채우면 나머지는 payload에서 빠지고, 빈 링크 칸은 버린다", () => {
    const payload = buildNewPayload(
      {
        ...EMPTY_NEW_DRAFT,
        shopName: " 무구 ",
        links: [" https://instagram.com/mugu ", ""],
      },
      [],
    );
    expect(payload).toEqual({
      type: "new",
      shopName: "무구",
      links: ["https://instagram.com/mugu"],
    });
  });

  it("선택 필드는 채운 것만 담긴다", () => {
    const payload = buildNewPayload(
      {
        ...EMPTY_NEW_DRAFT,
        shopName: "무구",
        branch: " 성수점 ",
        links: [],
        pin,
        message: " 지로계 아님 ",
      },
      ["new/a.jpg"],
    );
    expect(payload).toEqual({
      type: "new",
      shopName: "무구",
      branch: "성수점",
      pin,
      photos: ["new/a.jpg"],
      message: "지로계 아님",
    });
  });

  it("행 변환: location 컬럼은 첫 링크, 링크 없으면 핀 좌표", () => {
    const withLink = buildNewPayload(
      { ...EMPTY_NEW_DRAFT, shopName: "무구", links: ["https://naver.me/abc"] },
      [],
    );
    expect(toReportRow(withLink)).toEqual({
      type: "new",
      shop_name: "무구",
      location: "https://naver.me/abc",
      message: null,
      details: withLink,
    });
    const withPin = buildNewPayload(
      { ...EMPTY_NEW_DRAFT, shopName: "무구", pin },
      [],
    );
    expect(toReportRow(withPin).location).toBe("37.5446,127.0559");
    const withPhoto = buildNewPayload(
      { ...EMPTY_NEW_DRAFT, shopName: "무구" },
      ["new/a.jpg"],
    );
    expect(toReportRow(withPhoto).location).toBe("사진 참고");
  });
});

describe("정보 수정 제보", () => {
  it("항목을 하나도 안 고르면 제출 불가", () => {
    expect(canSubmitEdit(EMPTY_EDIT_DRAFT)).toBe(false);
  });

  it("체크한 항목은 값이 있어야 제출 — 상세 내용으로 대신할 수 있다", () => {
    expect(canSubmitEdit({ ...EMPTY_EDIT_DRAFT, items: ["hours"] })).toBe(
      false,
    );
    expect(
      canSubmitEdit({
        ...EMPTY_EDIT_DRAFT,
        items: ["hours"],
        hours: "11:00-20:00",
      }),
    ).toBe(true);
    expect(
      canSubmitEdit({
        ...EMPTY_EDIT_DRAFT,
        items: ["hours"],
        message: "주말만 단축",
      }),
    ).toBe(true);
    expect(canSubmitEdit({ ...EMPTY_EDIT_DRAFT, items: ["genre"] })).toBe(
      false,
    );
    expect(
      canSubmitEdit({
        ...EMPTY_EDIT_DRAFT,
        items: ["genre"],
        soups: ["shoyu"],
      }),
    ).toBe(true);
    expect(canSubmitEdit({ ...EMPTY_EDIT_DRAFT, items: ["amenities"] })).toBe(
      false,
    );
    expect(
      canSubmitEdit({ ...EMPTY_EDIT_DRAFT, items: ["closed", "menu"] }),
    ).toBe(false);
  });

  it("폐업·휴업은 상태 자체가 값이라 바로 제출 가능", () => {
    expect(canSubmitEdit({ ...EMPTY_EDIT_DRAFT, items: ["closed"] })).toBe(
      true,
    );
  });

  it("기타만 고르면 상세 내용이 있어야 제출 가능", () => {
    expect(canSubmitEdit({ ...EMPTY_EDIT_DRAFT, items: ["etc"] })).toBe(false);
    expect(
      canSubmitEdit({
        ...EMPTY_EDIT_DRAFT,
        items: ["etc"],
        message: "간판 바뀜",
      }),
    ).toBe(true);
  });

  it("체크한 항목의 필드만 담긴다 — 체크 안 한 항목의 입력값은 버린다", () => {
    const payload = buildEditPayload(target, {
      ...EMPTY_EDIT_DRAFT,
      items: ["closed", "hours"],
      closedStatus: "paused",
      closedEvidence: " https://instagram.com/p/1 ",
      hours: "11:30-20:00",
      menu: "라멘 13000",
      soups: ["shoyu"],
    });
    expect(payload).toEqual({
      type: "edit",
      shopId: "kinka",
      shopName: "킨카",
      items: ["closed", "hours"],
      fields: {
        closed: { status: "paused", evidence: "https://instagram.com/p/1" },
        hours: "11:30-20:00",
      },
    });
  });

  it("장르는 비어 있지 않은 축만, 편의는 배열 그대로", () => {
    const payload = buildEditPayload(target, {
      ...EMPTY_EDIT_DRAFT,
      items: ["genre", "amenities"],
      soups: ["tonkotsu"],
      lineages: ["iekei"],
      amenities: ["ticket-machine", "kaedama"],
    });
    expect(payload.fields).toEqual({
      genre: { soups: ["tonkotsu"], lineages: ["iekei"] },
      amenities: ["ticket-machine", "kaedama"],
    });
  });

  it("행 변환: 상호·위치는 대상 매장에서, location 없으면 id", () => {
    const payload = buildEditPayload(target, {
      ...EMPTY_EDIT_DRAFT,
      items: ["etc"],
      message: "간판 바뀜",
    });
    expect(toReportRow(payload, target)).toEqual({
      type: "edit",
      shop_name: "킨카",
      location: "성수",
      message: "간판 바뀜",
      details: payload,
    });
    expect(toReportRow(payload, { ...target, location: null }).location).toBe(
      "kinka",
    );
  });
});

describe("isDirty", () => {
  it("빈 드래프트는 dirty가 아니다", () => {
    expect(isDirtyNew(EMPTY_NEW_DRAFT)).toBe(false);
    expect(isDirtyEdit(EMPTY_EDIT_DRAFT)).toBe(false);
  });

  it("입력이 하나라도 생기면 dirty", () => {
    expect(isDirtyNew({ ...EMPTY_NEW_DRAFT, shopName: "킨" })).toBe(true);
    expect(isDirtyNew({ ...EMPTY_NEW_DRAFT, links: ["http://a"] })).toBe(true);
    expect(isDirtyEdit({ ...EMPTY_EDIT_DRAFT, items: ["hours"] })).toBe(true);
    expect(isDirtyEdit({ ...EMPTY_EDIT_DRAFT, message: "휴업" })).toBe(true);
  });

  it("공백뿐인 텍스트는 dirty가 아니다", () => {
    expect(isDirtyNew({ ...EMPTY_NEW_DRAFT, shopName: "  " })).toBe(false);
  });
});

describe("수정 제보 사진", () => {
  it("사진 경로가 payload에 실리고, 사진만 있어도 dirty다", () => {
    const draft = { ...EMPTY_EDIT_DRAFT, items: ["etc" as const] };
    const payload = buildEditPayload(target, draft, ["u/a.jpg", "u/b.jpg"]);
    expect(payload.photos).toEqual(["u/a.jpg", "u/b.jpg"]);
    expect(buildEditPayload(target, draft).photos).toBeUndefined();
    expect(
      isDirtyEdit({
        ...EMPTY_EDIT_DRAFT,
        photos: [new File(["x"], "a.jpg")],
      }),
    ).toBe(true);
  });
});
