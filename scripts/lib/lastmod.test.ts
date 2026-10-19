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
});
