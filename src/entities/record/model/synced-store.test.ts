import { describe, it, expect, vi } from "vitest";
import { createSyncedRecordStore, type RecordSink } from "./synced-store";
import { fromRow, toRow } from "./row-mapping";
import type { ShopRecord } from "./types";

const mockSink = () => {
  const upsert = vi.fn<RecordSink["upsert"]>();
  const remove = vi.fn<RecordSink["remove"]>();
  return { upsert, remove };
};

describe("createSyncedRecordStore", () => {
  it("쓰기마다 sink로 write-through한다", () => {
    const sink = mockSink();
    const store = createSyncedRecordStore([], sink);
    store.toggleVisited("kinka");
    store.toggleSaved("menya");
    expect(store.get("kinka")?.count).toBe(1);
    expect(sink.upsert).toHaveBeenCalledTimes(2);
  });

  it("마지막 상태가 꺼지면 sink.remove로 행을 지운다", () => {
    const sink = mockSink();
    const store = createSyncedRecordStore([], sink);
    store.toggleSaved("menya");
    store.toggleSaved("menya");
    expect(store.get("menya")).toBeNull();
    expect(sink.remove).toHaveBeenCalledWith("menya");
  });

  it("완식+저장 공존 상태에서 완식만 꺼도 upsert로 남긴다", () => {
    const sink = mockSink();
    const store = createSyncedRecordStore([], sink);
    store.toggleVisited("kinka");
    store.toggleSaved("kinka");
    sink.upsert.mockClear();
    store.toggleVisited("kinka");
    expect(sink.remove).not.toHaveBeenCalled();
    expect(sink.upsert).toHaveBeenCalledTimes(1);
    expect(store.get("kinka")).toMatchObject({ visited: false, saved: true });
  });

  it("seed에서 시작한다", () => {
    const seed: ShopRecord[] = [
      {
        shopId: "kinka",
        visited: true,
        saved: false,
        count: 3,
        firstAt: null,
        lastAt: null,
      },
    ];
    const store = createSyncedRecordStore(seed, mockSink());
    expect(store.get("kinka")?.count).toBe(3);
  });
});

describe("row mapping", () => {
  it("왕복 보존한다", () => {
    const record: ShopRecord = {
      shopId: "kinka",
      visited: true,
      saved: true,
      count: 2,
      firstAt: "2026-08-01T00:00:00.000Z",
      lastAt: "2026-08-27T00:00:00.000Z",
    };
    expect(fromRow(toRow(record, "user-1"))).toEqual(record);
  });

  it("둘 다 false인 행은 버린다", () => {
    expect(
      fromRow({
        user_id: "u",
        shop_id: "x",
        visited: false,
        saved: false,
        count: 0,
        first_at: null,
        last_at: null,
      }),
    ).toBeNull();
  });
});
