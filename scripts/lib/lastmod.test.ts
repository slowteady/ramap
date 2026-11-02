import { describe, expect, it } from "vitest";
import { updateLastmod } from "./lastmod";

const shop = (id: string, hours: string | null = null) => ({ id, hours });

describe("updateLastmod — 매장별 실제 변경일 장부", () => {
  it("처음 보는 매장은 오늘 날짜로 기록한다", () => {
    const next = updateLastmod({}, [shop("a")], "2026-10-19");
    expect(next.a.date).toBe("2026-10-19");
  });

  it("내용이 같으면 날짜를 유지하고, 바뀐 매장만 오늘로 갱신한다", () => {
    const first = updateLastmod({}, [shop("a"), shop("b")], "2026-10-05");
    const next = updateLastmod(
      first,
      [shop("a"), shop("b", "11:00-21:00")],
      "2026-10-19",
    );
    expect(next.a.date).toBe("2026-10-05");
    expect(next.b.date).toBe("2026-10-19");
  });

  it("사라진 매장은 장부에서 지운다", () => {
    const first = updateLastmod({}, [shop("a"), shop("b")], "2026-10-05");
    expect(
      Object.keys(updateLastmod(first, [shop("a")], "2026-10-19")),
    ).toEqual(["a"]);
  });

  it("키 순서가 달라도 같은 내용이면 변경으로 보지 않는다", () => {
    const ab: { id: string }[] = [{ id: "a", x: 1, y: 2 } as { id: string }];
    const ba: { id: string }[] = [{ y: 2, id: "a", x: 1 } as { id: string }];
    const first = updateLastmod({}, ab, "2026-10-05");
    const next = updateLastmod(first, ba, "2026-10-19");
    expect(next.a.date).toBe("2026-10-05");
  });

  it("화면에 안 쓰는 내부 메모(source·note)만 바뀌면 날짜를 유지한다", () => {
    type Row = {
      id: string;
      hours: string;
      source: string;
      note: string | null;
    };
    const before: Row[] = [
      { id: "a", hours: "11:00", source: "조사 1", note: null },
    ];
    const after: Row[] = [
      { id: "a", hours: "11:00", source: "조사 1; 조사 2", note: "메모" },
    ];
    const first = updateLastmod({}, before, "2026-10-05");
    const next = updateLastmod(first, after, "2026-11-02", before);
    expect(next.a.date).toBe("2026-10-05");
  });

  it("장부 해시 방식이 달라도 이전 매장과 보이는 내용이 같으면 날짜를 유지하고 해시만 새로 쓴다", () => {
    const prevShops = [{ id: "a", hours: "11:00", source: "옛 메모" }];
    const legacy = { a: { date: "2026-10-05", hash: "legacyhash000000" } };
    const shops = [{ id: "a", hours: "11:00", source: "새 메모" }];
    const next = updateLastmod(legacy, shops, "2026-11-02", prevShops);
    expect(next.a.date).toBe("2026-10-05");
    expect(next.a.hash).not.toBe("legacyhash000000");
  });

  it("보이는 내용이 바뀌면 이전 매장 데이터가 있어도 오늘로 갱신한다", () => {
    const prevShops = [{ id: "a", hours: "11:00" }];
    const legacy = { a: { date: "2026-10-05", hash: "legacyhash000000" } };
    const next = updateLastmod(
      legacy,
      [{ id: "a", hours: "12:00" }],
      "2026-11-02",
      prevShops,
    );
    expect(next.a.date).toBe("2026-11-02");
  });
});
