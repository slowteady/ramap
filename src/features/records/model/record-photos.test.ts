import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SUBMIT_STEP_TIMEOUT_MS, submitRecordPhotos } from "./record-photos";

const client = vi.hoisted(() => ({
  getSession: vi.fn(),
  getUser: vi.fn(),
  upload: vi.fn(),
  insert: vi.fn(),
}));

vi.mock("@/shared/api/supabase", () => ({
  getSupabase: () => ({
    auth: { getSession: client.getSession, getUser: client.getUser },
    storage: { from: () => ({ upload: client.upload }) },
    from: () => ({ insert: client.insert }),
  }),
}));
vi.mock("@/shared/lib/image", () => ({
  toJpegBlob: async () => new Blob(["x"], { type: "image/jpeg" }),
}));

const input = {
  shopId: "menkoji",
  files: [new File(["x"], "a.jpg", { type: "image/jpeg" })],
  comment: "",
  consent: true,
};

describe("submitRecordPhotos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    client.getSession.mockResolvedValue({
      data: { session: { user: { id: "u1" } } },
    });
    client.upload.mockResolvedValue({ error: null });
    client.insert.mockResolvedValue({ error: null });
  });
  afterEach(() => vi.useRealTimers());

  it("성공하면 ok", async () => {
    await expect(submitRecordPhotos(input)).resolves.toEqual({ ok: true });
  });

  it("사용자 확인은 네트워크 없는 세션 조회로 한다 — getUser 요청이 멈춰 '올리는 중'에 갇힌 사례(2026-10-28)", async () => {
    await submitRecordPhotos(input);
    expect(client.getUser).not.toHaveBeenCalled();
  });

  it("업로드가 응답 없이 멈추면 제한 시간 뒤 실패 단계와 함께 끝난다", async () => {
    vi.useFakeTimers();
    client.upload.mockReturnValue(new Promise(() => {}));
    const pending = submitRecordPhotos(input);
    await vi.advanceTimersByTimeAsync(SUBMIT_STEP_TIMEOUT_MS);
    await expect(pending).resolves.toEqual({ ok: false, step: "upload" });
    expect(client.insert).not.toHaveBeenCalled();
  });

  it("로그인 세션이 없으면 auth 단계 실패", async () => {
    client.getSession.mockResolvedValue({ data: { session: null } });
    await expect(submitRecordPhotos(input)).resolves.toEqual({
      ok: false,
      step: "auth",
    });
  });

  it("행 저장 오류는 insert 단계 실패", async () => {
    client.insert.mockResolvedValue({ error: { message: "rls" } });
    await expect(submitRecordPhotos(input)).resolves.toEqual({
      ok: false,
      step: "insert",
    });
  });
});
