import { describe, it, expect, beforeEach } from "vitest";
import { createLocalRecordStore } from "@/entities/record/model/local-store";

const mem = (): Storage => {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => {
      m.set(k, v);
    },
    removeItem: (k: string) => {
      m.delete(k);
    },
    clear: () => m.clear(),
    key: () => null,
    length: 0,
  } as Storage;
};

describe("RecordStore(localStorage)", () => {
  let store: ReturnType<typeof createLocalRecordStore>;
  beforeEach(() => {
    store = createLocalRecordStore(mem());
  });

  it("완식 토글 on — 날짜 기록, off — 행 삭제", () => {
    const r = store.toggleVisited("kinka", new Date("2026-08-26"));
    expect(r).toMatchObject({ visited: true, count: 1 });
    expect(r?.firstAt).toContain("2026-08-26");
    expect(store.toggleVisited("kinka")).toBeNull();
    expect(store.get("kinka")).toBeNull();
  });

  it("날짜 없는 완식(온보딩)은 firstAt null", () => {
    const r = store.toggleVisited("kinka");
    expect(r?.firstAt).toBeNull();
    expect(r?.count).toBe(1);
  });

  it("완식과 저장은 공존하고, 하나를 꺼도 다른 쪽은 남는다", () => {
    store.toggleSaved("konoha");
    expect(store.toggleVisited("konoha")).toMatchObject({
      visited: true,
      saved: true,
    });
    expect(store.toggleVisited("konoha")).toMatchObject({
      visited: false,
      saved: true,
    });
    expect(store.toggleSaved("konoha")).toBeNull();
  });

  it("저장 후 새 스토어 인스턴스에서도 읽힌다", () => {
    const storage = mem();
    createLocalRecordStore(storage).toggleVisited("kinka");
    expect(createLocalRecordStore(storage).get("kinka")?.count).toBe(1);
  });

  it("v1 status 포맷의 스토리지도 읽어 변환한다", () => {
    const storage = mem();
    storage.setItem(
      "ramap.records.v1",
      JSON.stringify({
        records: [
          {
            shopId: "old",
            status: "want",
            count: 0,
            firstAt: null,
            lastAt: null,
          },
        ],
      }),
    );
    expect(createLocalRecordStore(storage).get("old")).toMatchObject({
      visited: false,
      saved: true,
    });
  });

  it("export(v2)→import 왕복 보존, 병합은 OR·count max", () => {
    store.toggleVisited("kinka");
    const json = store.exportJson();
    expect(JSON.parse(json).version).toBe(2);
    const other = createLocalRecordStore(mem());
    other.toggleSaved("kinka");
    expect(other.importJson(json).imported).toBe(1);
    expect(other.get("kinka")).toMatchObject({ visited: true, saved: true });
  });

  it("v1 export(status)도 import된다", () => {
    const v1 = JSON.stringify({
      version: 1,
      exportedAt: "2026-08-27T00:00:00.000Z",
      records: [
        {
          shopId: "kinka",
          status: "visited",
          count: 2,
          firstAt: null,
          lastAt: null,
        },
      ],
    });
    expect(store.importJson(v1).imported).toBe(1);
    expect(store.get("kinka")).toMatchObject({ visited: true, count: 2 });
  });

  it("잘못된 JSON import는 imported 0으로 무해하게 끝난다", () => {
    expect(store.importJson("not json").imported).toBe(0);
    expect(store.importJson('{"version":99}').imported).toBe(0);
  });

  it("저장소 접근 실패 시 throw하지 않는다", () => {
    const broken = {
      ...mem(),
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    } as Storage;
    const s = createLocalRecordStore(broken);
    expect(() => s.all()).not.toThrow();
    expect(() => s.toggleVisited("kinka")).not.toThrow();
  });
});
