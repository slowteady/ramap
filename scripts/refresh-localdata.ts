import {
  closeSync,
  createReadStream,
  openSync,
  readFileSync,
  readSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { parse } from "csv-parse";
import { detectEncoding, pickColumn } from "./lib/lic-stream";
import { RAMEN_KEYWORDS, toSheetTsv, type LocalDataRow } from "./lib/localdata";
import { normalizeShopName, sameRoadAddress } from "./lib/merge-candidates";
import {
  classifyRefresh,
  namesMatch,
  roadCore,
  sameBuilding,
  type KnownRow,
} from "./lib/refresh";
import { SHEET_HEADER } from "./lib/sheet-parser";

/* LOCALDATA 전국 최신본(700MB)과 기지 후보(candidates.tsv)·게재분(shops.json)을 대조해
   신규 라멘 후보 / 폐업 전이 / 최신본에서 사라진 게재 매장을 보고한다.
   사용: npm run refresh-localdata -- <전국인허가.csv> [라운드태그=YYYY-MM] */
const [input, roundTag = new Date().toISOString().slice(0, 7)] =
  process.argv.slice(2);
if (!input) {
  console.error(
    "사용법: npm run refresh-localdata -- <전국인허가.csv> [라운드태그]",
  );
  process.exit(1);
}

const COLUMNS = {
  name: ["사업장명"],
  roadAddress: ["도로명주소", "도로명전체주소"],
  status: ["영업상태명"],
  category: ["업태구분명"],
  x: ["좌표정보(X)", "좌표정보X(EPSG5174)"],
  y: ["좌표정보(Y)", "좌표정보Y(EPSG5174)"],
  closedAt: ["폐업일자"],
  licenseNo: ["관리번호"],
  lotAddress: ["지번주소", "소재지전체주소"],
} as const;
const OPTIONAL_COLUMNS = new Set(["closedAt", "licenseNo", "lotAddress"]);

const buildingKey = (addr: string) =>
  addr.replace(/\(.*$/, "").replace(/,.*$/, "").replace(/\s+/g, " ").trim();

/* 기지 후보 로드 — 시트 TSV의 상호·지점명·주소 */
const sheetLines = readFileSync(resolve("data/out/candidates.tsv"), "utf8")
  .split(/\r?\n/)
  .filter((l) => l.trim() !== "");
const col = (h: (typeof SHEET_HEADER)[number]) => SHEET_HEADER.indexOf(h);
const shops = JSON.parse(readFileSync(resolve("data/shops.json"), "utf8")) as {
  name: string;
  branch: string | null;
  address: string | null;
}[];
const isPublished = (fullName: string, addr: string) =>
  shops.some(
    (s) =>
      normalizeShopName(s.name + (s.branch ?? "")) ===
        normalizeShopName(fullName) &&
      s.address !== null &&
      sameRoadAddress(s.address, addr),
  );
const known: KnownRow[] = sheetLines.slice(1).map((line) => {
  const v = line.split("\t");
  const name = v[col("상호")] ?? "";
  const branch = v[col("지점명")] ?? "";
  const roadAddress = v[col("주소")] ?? "";
  return {
    name,
    branch,
    roadAddress,
    published: isPublished(name + branch, roadAddress),
  };
});
const knownNames = new Set(
  known.map((k) => normalizeShopName(k.name + k.branch)),
);
const knownBuildings = new Set(known.map((k) => buildingKey(k.roadAddress)));
const knownCores = new Set(
  known.map((k) => roadCore(k.roadAddress)).filter((c): c is string => !!c),
);
console.log(
  `기지 후보 ${known.length}건 (게재 ${known.filter((k) => k.published).length})`,
);

/* 스트리밍 — 라멘 키워드·기지 상호·기지 건물 중 하나라도 걸리는 행만 보존 */
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

type Picked = Record<keyof typeof COLUMNS, string | null>;
let cols: Picked | null = null;
let read = 0;
const kept: LocalDataRow[] = [];
const extra = new Map<LocalDataRow, { closedAt: string; licenseNo: string }>();
const num = (v: string | undefined) => {
  const n = Number(v?.trim());
  return v?.trim() && !Number.isNaN(n) ? n : null;
};

parser.on("readable", () => {
  let record: Record<string, string> | null;
  while ((record = parser.read() as Record<string, string> | null)) {
    read += 1;
    if (!cols) {
      const header = Object.keys(record);
      cols = Object.fromEntries(
        Object.entries(COLUMNS).map(([k, names]) => [
          k,
          pickColumn(header, names),
        ]),
      ) as Picked;
      const missing = Object.entries(cols)
        .filter(([k, v]) => v === null && !OPTIONAL_COLUMNS.has(k))
        .map(([k]) => k);
      if (missing.length > 0) {
        console.error(`컬럼을 찾지 못했습니다: ${missing.join(", ")}`);
        console.error(`헤더: ${header.join(", ")}`);
        process.exit(1);
      }
    }
    const c = cols;
    const name = record[c.name!]?.trim() ?? "";
    if (!name) continue;
    /* 도로명이 비면 지번으로 대신 — 조사 단계에서 보정되는 시딩 후보라 빈 주소보다 낫다 */
    const roadAddress =
      record[c.roadAddress!]?.trim() ||
      (c.lotAddress ? (record[c.lotAddress]?.trim() ?? "") : "");
    const core = roadAddress ? roadCore(roadAddress) : null;
    const hit =
      RAMEN_KEYWORDS.some((k) => name.includes(k)) ||
      knownNames.has(normalizeShopName(name)) ||
      (roadAddress !== "" && knownBuildings.has(buildingKey(roadAddress))) ||
      (core !== null && knownCores.has(core));
    if (!hit) continue;
    const row: LocalDataRow = {
      name,
      roadAddress,
      status: (record[c.status!]?.trim() ?? "").startsWith("영업")
        ? "open"
        : "closed",
      category: record[c.category!]?.trim() ?? "",
      x: num(record[c.x!]),
      y: num(record[c.y!]),
    };
    kept.push(row);
    extra.set(row, {
      closedAt: c.closedAt ? (record[c.closedAt]?.trim() ?? "") : "",
      licenseNo: c.licenseNo ? (record[c.licenseNo]?.trim() ?? "") : "",
    });
  }
});

parser.on("error", (err) => {
  console.error(`파싱 실패: ${err.message}`);
  process.exit(1);
});

parser.on("end", () => {
  console.log(`인허가 ${read}건 → 대조 대상 ${kept.length}건`);
  const { newCandidates, closed, unmatched } = classifyRefresh(kept, known);

  const newTsv = toSheetTsv(newCandidates).replaceAll(
    "LOCALDATA 시딩",
    `LOCALDATA 시딩 ${roundTag}`,
  );
  writeFileSync(resolve("data/out/refresh-new.tsv"), newTsv);

  /* 같은 건물에서 다른 상호로 영업 중이면 양도·재인허가 가능성 — 폐업 확정 전 검토 대상 */
  const openAtBuilding = (addr: string) =>
    kept
      .filter((r) => r.status === "open" && sameBuilding(addr, r.roadAddress))
      .map((r) => r.name);
  const closedTsv = [
    "상호\t지점명\t주소\t게재\t폐업일자\t관리번호\t같은건물영업중",
    ...closed.map(({ known: k, fresh }) =>
      [
        k.name,
        k.branch,
        k.roadAddress,
        k.published ? "Y" : "",
        extra.get(fresh)?.closedAt ?? "",
        extra.get(fresh)?.licenseNo ?? "",
        openAtBuilding(k.roadAddress).join(" / "),
      ].join("\t"),
    ),
  ].join("\n");
  writeFileSync(resolve("data/out/refresh-closed.tsv"), `${closedTsv}\n`);

  /* 신규 후보의 상호가 폐업·미발견 매장과 겹치면 이전(移轉) 가능성 — 신규 등록 대신 주소 갱신 검토 */
  const gone = [...closed.map((c) => c.known), ...unmatched];
  const moves = newCandidates.flatMap((n) => {
    const from = gone.filter((k) =>
      namesMatch(
        normalizeShopName(k.name + k.branch),
        normalizeShopName(n.name),
      ),
    );
    return from.map((k) => [
      n.name,
      n.roadAddress,
      k.name,
      k.branch,
      k.roadAddress,
    ]);
  });
  writeFileSync(
    resolve("data/out/refresh-moves.tsv"),
    `${["신규상호\t신규주소\t기존상호\t기존지점\t기존주소", ...moves.map((m) => m.join("\t"))].join("\n")}\n`,
  );

  const unmatchedTsv = [
    "상호\t지점명\t주소",
    ...unmatched.map((k) => [k.name, k.branch, k.roadAddress].join("\t")),
  ].join("\n");
  writeFileSync(resolve("data/out/refresh-unmatched.tsv"), `${unmatchedTsv}\n`);

  const closedPublished = closed.filter((c) => c.known.published).length;
  console.log(`신규 후보 ${newCandidates.length}건 → data/out/refresh-new.tsv`);
  console.log(
    `폐업 전이 ${closed.length}건 (게재 ${closedPublished}) → data/out/refresh-closed.tsv`,
  );
  console.log(
    `최신본 미발견 게재 매장 ${unmatched.length}건 → data/out/refresh-unmatched.tsv`,
  );
  console.log(
    `이전 의심(신규↔폐업·미발견 상호 일치) ${moves.length}건 → data/out/refresh-moves.tsv`,
  );
  const bySido = new Map<string, number>();
  for (const r of newCandidates) {
    const sido = r.roadAddress.split(" ")[0] || "(주소없음)";
    bySido.set(sido, (bySido.get(sido) ?? 0) + 1);
  }
  for (const [sido, n] of [...bySido.entries()].sort((a, b) => b[1] - a[1]))
    console.log(`  신규 ${sido}: ${n}`);
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
