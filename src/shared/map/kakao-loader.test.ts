import { describe, it, expect, beforeEach } from "vitest";
import { buildSdkUrl, loadKakaoSdk, resetKakaoSdkForTest } from "./kakao-loader";

describe("buildSdkUrl", () => {
  it("키를 포함하고 autoload=false로 구성한다", () => {
    const url = buildSdkUrl("abc123");
    expect(url).toContain("appkey=abc123");
    expect(url).toContain("autoload=false");
    expect(url.startsWith("https://dapi.kakao.com/v2/maps/sdk.js")).toBe(true);
  });
});

describe("loadKakaoSdk", () => {
  beforeEach(() => {
    resetKakaoSdkForTest();
    document.head.innerHTML = "";
  });

  it("키가 없으면 reject한다", async () => {
    await expect(loadKakaoSdk(undefined)).rejects.toThrow();
    await expect(loadKakaoSdk("")).rejects.toThrow();
  });

  it("중복 호출해도 script 태그는 1개다", () => {
    void loadKakaoSdk("abc").catch(() => {});
    void loadKakaoSdk("abc").catch(() => {});
    expect(document.querySelectorAll("script[data-kakao-sdk]")).toHaveLength(1);
  });

  it("스크립트 로드 실패 시 reject한다", async () => {
    const p = loadKakaoSdk("abc");
    const script = document.querySelector("script[data-kakao-sdk]");
    script?.dispatchEvent(new Event("error"));
    await expect(p).rejects.toThrow();
  });
});
