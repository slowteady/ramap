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

  it("먹었다는 토글 — 재클릭해도 count 1, 날짜는 최신화", () => {
    store.markVisited("kinka", new Date("2026-08-26"));
    const r = store.markVisited("kinka", new Date("2026-08-27"));
    expect(r.count).toBe(1);
    expect(r.firstAt).toContain("2026-08-26");
    expect(r.lastAt).toContain("2026-08-27");
  });

  it("날짜 없는 완식(온보딩)은 firstAt null", () => {
    const r = store.markVisited("kinka");
    expect(r.firstAt).toBeNull();
    expect(r.count).toBe(1);
  });

  it("want → visited 전이는 되고 역전이는 무시된다", () => {
    store.markWant("konoha");
    expect(store.markVisited("konoha").status).toBe("visited");
    expect(store.markWant("konoha").status).toBe("visited");
  });

  it("저장 후 새 스토어 인스턴스에서도 읽힌다", () => {
    const storage = mem();
    createLocalRecordStore(storage).markVisited("kinka");
    expect(createLocalRecordStore(storage).get("kinka")?.count).toBe(1);
  });

  it("export→import 왕복 보존, 병합은 count 큰 쪽(구 데이터 호환)", () => {
    store.markVisited("kinka");
    const json = store.exportJson().replace('"count":1', '"count":2');
    const other = createLocalRecordStore(mem());
    other.markVisited("kinka");
    expect(other.importJson(json).imported).toBe(1);
    expect(other.get("kinka")!.count).toBe(2);
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
    expect(() => s.markVisited("kinka")).not.toThrow();
  });
});
