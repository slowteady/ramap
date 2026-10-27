import { describe, expect, it } from "vitest";
import { inAppBrowserOf, pageTypeOf } from "./analytics-context";

describe("pageTypeOf", () => {
  it("경로를 페이지 유형으로", () => {
    expect(pageTypeOf("/")).toBe("home");
    expect(pageTypeOf("/shop/kinka")).toBe("shop");
    expect(pageTypeOf("/area/%EC%84%B1%EC%88%98")).toBe("area");
    expect(pageTypeOf("/area/%EC%84%B1%EC%88%98/niboshi")).toBe("area_genre");
    expect(pageTypeOf("/guide")).toBe("guide_index");
    expect(pageTypeOf("/guide/iekei")).toBe("guide");
    expect(pageTypeOf("/style/jiro")).toBe("style");
    expect(pageTypeOf("/me")).toBe("me");
    expect(pageTypeOf("/settings")).toBe("settings");
    expect(pageTypeOf("/privacy")).toBe("legal");
    expect(pageTypeOf("/terms")).toBe("legal");
    expect(pageTypeOf("/admin")).toBe("admin");
    expect(pageTypeOf("/nope/x")).toBe("other");
  });
});

describe("inAppBrowserOf", () => {
  it("앱 내 브라우저를 UA로 구분", () => {
    expect(inAppBrowserOf("Mozilla/5.0 (iPhone) KAKAOTALK 10.4.5")).toBe(
      "kakaotalk",
    );
    expect(inAppBrowserOf("Mozilla/5.0 Instagram 300.0.0")).toBe("instagram");
    expect(inAppBrowserOf("Mozilla/5.0 NAVER(inapp; search; 1000)")).toBe(
      "naver",
    );
    expect(inAppBrowserOf("Mozilla/5.0 [FBAN/FBIOS;FBAV/400]")).toBe(
      "facebook",
    );
    expect(inAppBrowserOf("Mozilla/5.0 (iPhone) Safari/604.1")).toBeNull();
  });
});
