import { createReadStream, openSync, readSync, closeSync } from "node:fs";
import { createWriteStream } from "node:fs";
import { resolve } from "node:path";
import { parse } from "csv-parse";
import { licToSanggwonCsv, type LicRow } from "./lib/lic-convert";
import {
  detectEncoding,
  pickColumn,
  toLicRow,
  type LicColumns,
} from "./lib/lic-stream";

/* LOCALDATA 계열 인허가 CSV → 상가정보 스키마. 컬럼명이 출처마다 달라(부산 영문·대구/전국 한글)
   후보 목록으로 탐색한다. 전국 원본은 700MB라 스트리밍으로 처리한다.
   사용: npm run extract-lic -- <입력.csv> <출력.csv> */
const CANDIDATES = {
  name: ["bplcnm", "사업장명", "업소명"],
  roadAddress: ["rdnwhladdr", "도로명전체주소", "도로명주소"],
  state: ["dtlstatenm", "상세영업상태명", "trdstatenm", "영업상태명"],
  x: ["x", "좌표정보X(EPSG5174)", "좌표정보(X)"],
  y: ["y", "좌표정보Y(EPSG5174)", "좌표정보(Y)"],
} as const;

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("사용법: npm run extract-lic -- <인허가.csv> <출력.csv>");
  process.exit(1);
}

const path = resolve(input);
const fd = openSync(path, "r");
const head = Buffer.alloc(4096);
readSync(fd, head, 0, 4096, 0);
closeSync(fd);
const encoding = detectEncoding(head);

const parser = parse({
  columns: true,
  bom: true,
  relax_column_count: true,
  relax_quotes: true,
  skip_empty_lines: true,
  record_delimiter: ["\r\n", "\n", "\r"],
});

let cols: LicColumns | null = null;
let read = 0;
let kept = 0;
const out = createWriteStream(resolve(output));
/* 헤더 한 줄은 빈 배열 변환으로 얻는다 */
out.write(licToSanggwonCsv([]));

parser.on("readable", () => {
  let record: Record<string, string> | null;
  while ((record = parser.read() as Record<string, string> | null)) {
    read += 1;
    if (!cols) {
      const header = Object.keys(record);
      const picked = Object.fromEntries(
        Object.entries(CANDIDATES).map(([key, names]) => [
          key,
          pickColumn(header, names),
        ]),
      ) as Record<keyof typeof CANDIDATES, string | null>;
      const missing = Object.entries(picked).filter(([, v]) => v === null);
      if (missing.length > 0) {
        console.error(
          `컬럼을 찾지 못했습니다: ${missing.map(([k]) => k).join(", ")}`,
        );
        console.error(`헤더: ${header.slice(0, 45).join(", ")}`);
        process.exit(1);
      }
      cols = picked as LicColumns;
    }
    const row: LicRow = toLicRow(record, cols);
    const line = licToSanggwonCsv([row]).split("\n")[1];
    if (line) {
      kept += 1;
      out.write(line + "\n");
    }
  }
});

parser.on("error", (err) => {
  console.error(`파싱 실패: ${err.message}`);
  process.exit(1);
});

parser.on("end", () => {
  out.end(() =>
    console.log(`인허가 ${read}건 → 영업 중·좌표 확보 ${kept}건 → ${output}`),
  );
});

const decoder = new TextDecoder(encoding);
const stream = createReadStream(path);
stream.on("data", (chunk) =>
  parser.write(decoder.decode(chunk as Buffer, { stream: true })),
);
stream.on("end", () => {
  parser.write(decoder.decode());
  parser.end();
});
