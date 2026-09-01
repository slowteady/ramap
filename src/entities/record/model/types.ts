export type ShopRecord = {
  shopId: string;
  visited: boolean;
  saved: boolean;
  count: number;
  firstAt: string | null;
  lastAt: string | null;
};

export type RecordExport = {
  version: 2;
  exportedAt: string;
  records: ShopRecord[];
};

export interface RecordStore {
  get(shopId: string): ShopRecord | null;
  all(): ShopRecord[];
  toggleVisited(shopId: string, at?: Date): ShopRecord | null;
  toggleSaved(shopId: string): ShopRecord | null;
  recordRevisit(shopId: string, at?: Date): ShopRecord;
  exportJson(): string;
  importJson(json: string): { imported: number };
}
