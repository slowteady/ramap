import type { ShopRecord } from "@/entities/record";

export function visitLabel(
  record: Pick<ShopRecord, "visited" | "count"> | null,
): { action: string; count: string | null } {
  if (!record?.visited) return { action: "완식", count: null };
  return { action: "한 그릇 더", count: `${record.count}회` };
}
