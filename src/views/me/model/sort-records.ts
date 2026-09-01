import type { ShopRecord } from "@/entities/record";

export function recordTime(record: ShopRecord): string | null {
  return record.lastAt ?? record.firstAt;
}

export function sortRecordsByRecent(records: ShopRecord[]): ShopRecord[] {
  return [...records].sort((a, b) => {
    const ta = recordTime(a);
    const tb = recordTime(b);
    if (ta === null && tb === null) return 0;
    if (ta === null) return 1;
    if (tb === null) return -1;
    return tb.localeCompare(ta);
  });
}
