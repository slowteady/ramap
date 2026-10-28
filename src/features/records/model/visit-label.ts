import type { ShopRecord } from "@/entities/record";

export function visitLabel(
  record: Pick<ShopRecord, "visited" | "count"> | null,
): string {
  return record?.visited ? `완식 ${record.count}회` : "완식";
}
