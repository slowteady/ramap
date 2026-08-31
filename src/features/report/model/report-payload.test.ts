import { describe, expect, it } from "vitest";
import {
  buildEditPayload,
  buildNewPayload,
  canSubmitEdit,
  canSubmitNew,
  EMPTY_EDIT_DRAFT,
  EMPTY_NEW_DRAFT,
  toReportRow,
} from "./report-payload";

const target = { id: "kinka", name: "킨카", location: "성수" };

describe("새 라멘집 등록", () => {
  it("이름·위치가 있어야 제출 가능", () => {
    expect(canSubmitNew(EMPTY_NEW_DRAFT)).toBe(false);
    expect(canSubmitNew({ ...EMPTY_NEW_DRAFT, shopName: "무구" })).toBe(false);
    expect(
      canSubmitNew({
        ...EMPTY_NEW_DRAFT,
        shopName: " 무구 ",
        location: "성수",
      }),
    ).toBe(true);
  });

  it("사진을 붙이면 직접 촬영 동의가 있어야 제출 가능", () => {
    const base = { ...EMPTY_NEW_DRAFT, shopName: "무구", location: "성수" };
    const photo = new File([""], "a.jpg", { type: "image/jpeg" });
    expect(canSubmitNew({ ...base, photos: [photo] })).toBe(false);
    expect(canSubmitNew({ ...base, photos: [photo], photoConsent: true })).toBe(
      true,
    );
  });

  it("필수만 채우면 선택 필드는 payload에서 빠진다", () => {
    const payload = buildNewPayload(
      { ...EMPTY_NEW_DRAFT, shopName: " 무구 ", location: " 성수역 " },
      [],
    );
    expect(payload).toEqual({
      type: "new",
      shopName: "무구",
      location: "성수역",
    });
  });

  it("채운 선택 필드는 시트 컬럼 이름 그대로 담기고 가격은 숫자로", () => {
    const payload = buildNewPayload(
      {
        ...EMPTY_NEW_DRAFT,
        shopName: "무구",
        location: "성수",
        branch: " 성수점 ",
        soups: ["niboshi"],
        lineages: ["jikaseimen"],
        amenities: ["kaedama"],
        hours: "11:00-21:00",
        breakTime: "15:00-17:00",
        closedDays: ["월", "둘째 화"],
        seats: "카운터 9",
        menus: [
          { name: "니보시 시오", price: "12,000원" },
          { name: "", price: "9000" },
          { name: "츠케멘", price: "" },
        ],
        instagram: "https://instagram.com/mugu",
        naverPlace: "",
        waitingLink: " https://catchtable.co.kr/mugu ",
        message: " 지로계 아님 ",
        pin: { lat: 37.5446, lng: 127.0559 },
      },
      ["new/a.jpg", "new/b.jpg"],
    );
    expect(payload).toEqual({
      type: "new",
      shopName: "무구",
      location: "성수",
      branch: "성수점",
      soups: ["niboshi"],
      lineages: ["jikaseimen"],
      amenities: ["kaedama"],
      hours: "11:00-21:00",
      breakTime: "15:00-17:00",
      closedDays: ["월", "둘째 화"],
      seats: "카운터 9",
      menus: [
        { name: "니보시 시오", price: 12000 },
        { name: "츠케멘", price: null },
      ],
      instagram: "https://instagram.com/mugu",
      waitingLink: "https://catchtable.co.kr/mugu",
      photos: ["new/a.jpg", "new/b.jpg"],
      pin: { lat: 37.5446, lng: 127.0559 },
      message: "지로계 아님",
    });
  });

  it("행 변환: shop_name·location은 컬럼, 전체는 details", () => {
    const payload = buildNewPayload(
      { ...EMPTY_NEW_DRAFT, shopName: "무구", location: "성수" },
      [],
    );
    expect(toReportRow(payload)).toEqual({
      type: "new",
      shop_name: "무구",
      location: "성수",
      message: null,
      details: payload,
    });
  });
});

describe("정보 수정 제보", () => {
  it("항목을 하나도 안 고르면 제출 불가", () => {
    expect(canSubmitEdit(EMPTY_EDIT_DRAFT)).toBe(false);
    expect(canSubmitEdit({ ...EMPTY_EDIT_DRAFT, items: ["hours"] })).toBe(true);
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
