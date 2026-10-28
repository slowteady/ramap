import dayjs from "dayjs";
import type { ShopRecord } from "@/entities/record";

export function visitSummary(
  record: Pick<ShopRecord, "visited" | "count" | "lastAt"> | null,
  now: Date,
): string | null {
  if (!record?.visited) return null;
  const count = `완식 ${record.count}회`;
  if (!record.lastAt) return count;
  const last = dayjs(record.lastAt);
  const date = last.isSame(now, "year")
    ? last.format("M.D")
    : last.format("YYYY.M.D");
  return `${count} · 최근 ${date}`;
}
