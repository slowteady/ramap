import "server-only";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cache } from "react";
import type { Shop } from "../model/types";

export const getShops = cache(async (): Promise<Shop[]> => {
  const raw = readFileSync(resolve(process.cwd(), "data/shops.json"), "utf8");
  return JSON.parse(raw) as Shop[];
});
