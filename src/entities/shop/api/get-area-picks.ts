import "server-only";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cache } from "react";
import {
  EMPTY_AREA_PICKS,
  toAreaPicks,
  type AreaPicks,
} from "../model/area-picks";

export const getAreaPicks = cache(async (): Promise<AreaPicks> => {
  const path = resolve(process.cwd(), "data/area-picks.json");
  if (!existsSync(path)) return EMPTY_AREA_PICKS;
  return toAreaPicks(JSON.parse(readFileSync(path, "utf8")));
});
