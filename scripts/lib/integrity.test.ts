import { describe, expect, it } from "vitest";
import { diffShops, sharedInstagram, type IntegrityShop } from "./integrity";

const shop = (over: Partial<IntegrityShop>): IntegrityShop => ({
  id: "a",
  name: "가게",
  branch: null,
  address: "서울 마포구 1",
  status: "open",
  soups: ["tonkotsu"],
  forms: ["ramen"],
  lineages: [],
  instagram: null,
  ...over,
});

describe("diffShops", () => {
  it("장르·계보·인스타 변경과 소실·신규를 구분한다", () => {
    const before = [
      shop({ id: "a", soups: ["shoyu"] }),
      shop({ id: "b", lineages: ["jiro"] }),
      shop({ id: "c" }),
    ];
    const after = [
      shop({ id: "a", soups: ["tonkotsu"] }),
      shop({ id: "b", lineages: [] }),
      shop({ id: "d" }),
    ];
    const d = diffShops(before, after);
    expect(d.changed.map((c) => [c.id, c.fields])).toEqual([
      ["a", ["soups"]],
      ["b", ["lineages"]],
    ]);
    expect(d.removed.map((s) => s.id)).toEqual(["c"]);
    expect(d.added.map((s) => s.id)).toEqual(["d"]);
  });

  it("순서만 다른 배열은 변경이 아니다", () => {
    const d = diffShops(
      [shop({ soups: ["shoyu", "shio"] })],
      [shop({ soups: ["shio", "shoyu"] })],
    );
    expect(d.changed).toEqual([]);
  });
});

describe("sharedInstagram", () => {
  it("주소가 다른 영업 매장끼리 같은 인스타를 쓰면 묶어 보고한다", () => {
    const groups = sharedInstagram([
      shop({ id: "a", instagram: "ramenya_gimpo", address: "김포 1" }),
      shop({ id: "b", instagram: "@ramenya_gimpo", address: "부산 2" }),
      shop({ id: "c", instagram: "solo", address: "서울 3" }),
      shop({
        id: "d",
        instagram: "ramenya_gimpo",
        address: "김포 9",
        status: "closed",
      }),
    ]);
    expect(groups).toEqual([{ handle: "ramenya_gimpo", ids: ["a", "b"] }]);
  });
});
