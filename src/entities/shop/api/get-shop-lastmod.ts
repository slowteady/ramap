import "server-only";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cache } from "react";

/* 매장별 실제 변경일(scripts/sync-sheet가 내용 해시로 갱신) — 사이트맵 lastmod 원천 */
export const getShopLastmod = cache(
  async (): Promise<Record<string, string>> => {
    const path = resolve(process.cwd(), "data/shop-lastmod.json");
    if (!existsSync(path)) return {};
    const ledger = JSON.parse(readFileSync(path, "utf8")) as Record<
      string,
      { date: string }
    >;
    return Object.fromEntries(
      Object.entries(ledger).map(([id, v]) => [id, v.date]),
    );
  },
);
