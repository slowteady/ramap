import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { decodeCsvBuffer, parseCsv } from "./lib/csv";
import { licToSanggwonCsv, type LicRow } from "./lib/lic-convert";

/* LOCALDATA 계열 인허가 CSV → 상가정보 스키마. 컬럼명이 지자체마다 달라(부산 영문·대구 한글)
   후보 목록으로 탐색한다. 사용: npm run extract-lic -- <입력.csv> <출력.csv> */
const CANDIDATES = {
  name: ["bplcnm", "사업장명", "업소명"],
  roadAddress: ["rdnwhladdr", "도로명전체주소", "도로명주소"],
  state: ["dtlstatenm", "상세영업상태명", "trdstatenm", "영업상태명"],
  x: ["x", "좌표정보X(EPSG5174)", "좌표정보x(epsg5174)"],
  y: ["y", "좌표정보Y(EPSG5174)", "좌표정보y(epsg5174)"],
} as const;

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("사용법: npm run extract-lic -- <인허가.csv> <출력.csv>");
  process.exit(1);
}

const lines = parseCsv(decodeCsvBuffer(readFileSync(resolve(input))));
if (lines.length < 2) {
  console.error("행이 없습니다");
  process.exit(1);
}
const header = lines[0].map((h) => h.trim().replace(/^﻿/, ""));
const idx = Object.fromEntries(
  Object.entries(CANDIDATES).map(([key, names]) => [
    key,
    names.map((n) => header.indexOf(n)).find((i) => i >= 0) ?? -1,
  ]),
) as Record<keyof typeof CANDIDATES, number>;

const missing = Object.entries(idx).filter(([, i]) => i < 0);
if (missing.length > 0) {
  console.error(
    `컬럼을 찾지 못했습니다: ${missing.map(([k]) => k).join(", ")}`,
  );
  console.error(`헤더: ${header.slice(0, 40).join(", ")}`);
  process.exit(1);
}

const rows: LicRow[] = lines.slice(1).map((c) => ({
  name: c[idx.name]?.trim() ?? "",
  roadAddress: c[idx.roadAddress]?.trim() ?? "",
  state: c[idx.state]?.trim() ?? "",
  x: Number(c[idx.x]),
  y: Number(c[idx.y]),
}));

const csv = licToSanggwonCsv(rows);
writeFileSync(resolve(output), csv);
const kept = csv.split("\n").length - 2;
console.log(
  `인허가 ${rows.length}건 → 영업 중·좌표 확보 ${kept}건 → ${output}`,
);
