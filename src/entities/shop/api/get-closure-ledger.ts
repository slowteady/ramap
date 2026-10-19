import "server-only";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cache } from "react";
import type { ClosureLedger } from "../model/closure";

export const getClosureLedger = cache(async (): Promise<ClosureLedger> => {
  const path = resolve(process.cwd(), "data/closure-verification.json");
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, "utf8")) as ClosureLedger;
});
