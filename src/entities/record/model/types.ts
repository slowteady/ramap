export type RecordStatus = "visited" | "want";

export type ShopRecord = {
  shopId: string;
  status: RecordStatus;
  count: number;
  firstAt: string | null;
  lastAt: string | null;
};

export type RecordExport = {
  version: 1;
  exportedAt: string;
  records: ShopRecord[];
};

export interface RecordStore {
  get(shopId: string): ShopRecord | null;
  all(): ShopRecord[];
  markVisited(shopId: string, at?: Date): ShopRecord;
  markWant(shopId: string): ShopRecord;
  remove(shopId: string): void;
  exportJson(): string;
  importJson(json: string): { imported: number };
}
