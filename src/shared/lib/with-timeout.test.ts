import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TimeoutError, withTimeout } from "./with-timeout";

describe("withTimeout", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("제한 시간 안에 끝나면 결과를 그대로 돌려준다", async () => {
    await expect(withTimeout(Promise.resolve(7), 1000)).resolves.toBe(7);
  });

  it("영영 안 끝나는 작업은 제한 시간에 TimeoutError로 끊는다", async () => {
    const hung = withTimeout(new Promise<never>(() => {}), 1000);
    vi.advanceTimersByTime(1000);
    await expect(hung).rejects.toBeInstanceOf(TimeoutError);
  });

  it("작업 자체의 실패는 그대로 전달한다", async () => {
    await expect(
      withTimeout(Promise.reject(new Error("boom")), 1000),
    ).rejects.toThrow("boom");
  });
});
