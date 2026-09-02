import { parse } from "csv-parse/sync";

export function parseCsv(text: string): string[][] {
  return parse(text, {
    relax_column_count: true,
    skip_empty_lines: true,
    bom: true,
    record_delimiter: ["\r\n", "\n", "\r"],
  }) as string[][];
}

/* 공공데이터 CSV는 UTF-8(상가정보)·EUC-KR(서울 인허가)이 혼재 — 치환문자 비율로 판별 */
export function decodeCsvBuffer(buffer: Uint8Array): string {
  const utf8 = new TextDecoder("utf-8").decode(buffer);
  const sample = utf8.slice(0, 2000);
  const bad = (sample.match(/�/g) ?? []).length;
  if (bad / Math.max(1, sample.length) < 0.01) return utf8;
  return new TextDecoder("euc-kr").decode(buffer);
}
