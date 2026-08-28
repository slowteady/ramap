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
    store.markVisited("kinka");
    store.markVisited("kinka");
    store.markWant("menya");
    store.remove("menya");
    expect(store.get("kinka")?.count).toBe(1);
    expect(sink.upsert).toHaveBeenCalledTimes(3);
    expect(sink.remove).toHaveBeenCalledWith("menya");
  });

  it("visited에 markWant는 sink를 호출하지 않는다", () => {
    const sink = mockSink();
    const store = createSyncedRecordStore([], sink);
    store.markVisited("kinka");
    sink.upsert.mockClear();
    store.markWant("kinka");
    expect(sink.upsert).not.toHaveBeenCalled();
  });

  it("seed에서 시작한다", () => {
    const seed: ShopRecord[] = [
      { shopId: "kinka", status: "visited", count: 3, firstAt: null, lastAt: null },
    ];
    const store = createSyncedRecordStore(seed, mockSink());
    expect(store.get("kinka")?.count).toBe(3);
  });
});

describe("row mapping", () => {
  it("왕복 보존한다", () => {
    const record: ShopRecord = {
      shopId: "kinka",
      status: "visited",
      count: 2,
      firstAt: "2026-08-01T00:00:00.000Z",
      lastAt: "2026-08-27T00:00:00.000Z",
    };
    expect(fromRow(toRow(record, "user-1"))).toEqual(record);
  });

  it("알 수 없는 status 행은 버린다", () => {
    expect(
      fromRow({
        user_id: "u",
        shop_id: "x",
        status: "weird",
        count: 1,
        first_at: null,
        last_at: null,
      }),
    ).toBeNull();
  });
});
