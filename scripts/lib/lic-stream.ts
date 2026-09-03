import type { LicRow } from "./lic-convert";

/* 전국 LOCALDATA 원본은 700MB 규모라 통째로 읽을 수 없다 — 스트리밍 파싱용 보조 */

export type LicColumns = {
  name: string;
  roadAddress: string;
  state: string;
  x: string;
  y: string;
};

export function detectEncoding(head: Uint8Array): "utf-8" | "euc-kr" {
  const utf8 = new TextDecoder("utf-8").decode(head);
  const bad = (utf8.match(/�/g) ?? []).length;
  return bad / Math.max(1, utf8.length) < 0.01 ? "utf-8" : "euc-kr";
}

export function pickColumn(
  header: string[],
  candidates: readonly string[],
): string | null {
  return candidates.find((c) => header.includes(c)) ?? null;
}

export function toLicRow(
  record: Record<string, string>,
  cols: LicColumns,
): LicRow {
  return {
    name: record[cols.name]?.trim() ?? "",
    roadAddress: record[cols.roadAddress]?.trim() ?? "",
    state: record[cols.state]?.trim() ?? "",
    x: Number(record[cols.x] ?? NaN),
    y: Number(record[cols.y] ?? NaN),
  };
}
