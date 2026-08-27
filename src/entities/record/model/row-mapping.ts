import dayjs from "dayjs";
import type { RecordStatus, ShopRecord } from "./types";

export type RecordRow = {
  user_id: string;
  shop_id: string;
  status: string;
  count: number;
  first_at: string | null;
  last_at: string | null;
  updated_at?: string;
};

export function toRow(record: ShopRecord, userId: string): RecordRow {
  return {
    user_id: userId,
    shop_id: record.shopId,
    status: record.status,
    count: record.count,
    first_at: record.firstAt,
    last_at: record.lastAt,
    updated_at: dayjs().toISOString(),
  };
}

export function fromRow(row: RecordRow): ShopRecord | null {
  if (row.status !== "visited" && row.status !== "want") return null;
  return {
    shopId: row.shop_id,
    status: row.status as RecordStatus,
    count: row.count,
    firstAt: row.first_at,
    lastAt: row.last_at,
  };
}
