import { beforeEach, describe, expect, it, vi } from "vitest";

const ph = vi.hoisted(() => ({
  __loaded: false,
  capture: vi.fn(),
  identify: vi.fn(),
  reset: vi.fn(),
  opt_out_capturing: vi.fn(),
  get_distinct_id: vi.fn(() => "anon"),
}));
vi.mock("posthog-js", () => ({ default: ph }));
vi.mock("client-only", () => ({}));

import { excludeOperator, identifyUser, resetUser, track } from "./analytics";

describe("analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ph.__loaded = false;
  });

  it("초기화 전(토큰 없는 로컬·테스트)에는 아무것도 보내지 않는다", () => {
    track("share_clicked", { shop_id: "kinka", method: "native" });
    identifyUser("u1");
    resetUser();
    excludeOperator();
    expect(ph.capture).not.toHaveBeenCalled();
    expect(ph.identify).not.toHaveBeenCalled();
    expect(ph.reset).not.toHaveBeenCalled();
    expect(ph.opt_out_capturing).not.toHaveBeenCalled();
  });

  it("초기화 후에는 이벤트를 보낸다", () => {
    ph.__loaded = true;
    track("share_clicked", { shop_id: "kinka", method: "native" });
    expect(ph.capture).toHaveBeenCalledWith("share_clicked", {
      shop_id: "kinka",
      method: "native",
    });
  });

  it("같은 사용자는 다시 identify하지 않는다", () => {
    ph.__loaded = true;
    ph.get_distinct_id.mockReturnValueOnce("u1");
    identifyUser("u1");
    expect(ph.identify).not.toHaveBeenCalled();
    identifyUser("u2");
    expect(ph.identify).toHaveBeenCalledWith("u2");
  });
});
