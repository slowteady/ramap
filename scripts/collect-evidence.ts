import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import {
  buildQueries,
  extractPlaceStatus,
  extractSnippets,
  hasNoResults,
  htmlToText,
  isEventTitle,
  parseGalleryList,
  parseGalleryPost,
  type GalleryPost,
  type PlaceStatus,
  type Snippet,
} from "./lib/evidence";
import { get, sleep } from "./lib/http";

/* 갱신 라운드 2차 검수용 증거 수집 — 신규 후보 전부·게재 매장 폐업 전이 전부를 Daum 통합검색으로,
   라멘 미니갤 최근 글을 키워드 검색으로 모은다. 검색 결과 원문은 플랫폼 데이터라 레포에 커밋하지 않는다(출력은 레포 밖).
   사용: npm run collect-evidence -- data/review/<TAG> [출력.json=/tmp/refresh-evidence.json] */
const [reviewDir, out = "/tmp/refresh-evidence.json"] = process.argv.slice(2);
if (!reviewDir) {
  console.error(
    "사용법: npm run collect-evidence -- data/review/<TAG> [출력.json]",
  );
  process.exit(1);
}

const GALLERY_KEYWORDS = [
  "오픈",
  "개업",
  "폐업",
  "영업종료",
  "이전",
  "휴업",
  "2호점",
];
const GALLERY_DAYS = 21;
const GALLERY_BODY_LIMIT = 30;

function readTsv(path: string): Record<string, string>[] {
  if (!existsSync(path)) return [];
  const [head, ...lines] = readFileSync(path, "utf8")
    .split(/\r?\n/)
    .filter((l) => l.trim());
  const cols = head.split("\t");
  return lines.map((l) => {
    const v = l.split("\t");
    return Object.fromEntries(cols.map((c, i) => [c, v[i] ?? ""]));
  });
}

type Target = {
  kind: "new" | "closed";
  prior?: string;
  name: string;
  address: string;
  date: string;
  sameBuildingOpen?: string;
  searches: {
    query: string;
    ok: boolean;
    error?: string;
    noResults: boolean;
    place: PlaceStatus | null;
    snippets: Snippet[];
  }[];
};

const dir = resolve(reviewDir);

/* 직전 라운드 판정 — 영업 유지로 판정했던 매장이 다시 폐업 전이로 올라오면 근거를 다시 대조한다 */
const prior = new Map<string, string>();
const rounds = readdirSync(dirname(dir))
  .filter(
    (d) =>
      d < basename(dir) &&
      existsSync(join(dirname(dir), d, "closed-verify.tsv")),
  )
  .sort();
const lastRound = rounds.at(-1);
if (lastRound)
  for (const r of readTsv(join(dirname(dir), lastRound, "closed-verify.tsv")))
    prior.set(
      `${r["상호"]} ${r["지점명"]}`.trim(),
      `${lastRound}: ${r["판정"]} — ${r["근거(날짜 포함 1문장)"] ?? r["근거"] ?? ""}`,
    );
const targets: Target[] = [
  ...readTsv(join(dir, "refresh-new.tsv")).map((r) => ({
    kind: "new" as const,
    name: r["상호"],
    address: r["주소"],
    date: r["오픈일"],
    searches: [],
  })),
  ...readTsv(join(dir, "refresh-closed.tsv"))
    .filter((r) => r["게재"] === "Y")
    .map((r) => ({
      kind: "closed" as const,
      name: `${r["상호"]} ${r["지점명"]}`.trim(),
      address: r["주소"],
      date: r["폐업일자"],
      sameBuildingOpen: r["같은건물영업중"],
      searches: [],
    })),
];

for (const t of targets) t.prior = prior.get(t.name);

let failures = 0;
for (const t of targets) {
  for (const query of buildQueries(t.name, t.address)) {
    const res = get(
      `https://search.daum.net/search?w=tot&q=${encodeURIComponent(query)}`,
    );
    if (!res.ok) failures += 1;
    const text = res.ok ? htmlToText(res.body) : "";
    t.searches.push({
      query,
      ok: res.ok,
      error: res.error,
      noResults: res.ok && hasNoResults(text),
      place: res.ok ? extractPlaceStatus(text) : null,
      snippets: res.ok ? extractSnippets(text, t.name) : [],
    });
    sleep(1500);
  }
  process.stdout.write(".");
}
console.log();

const since = Date.now() - GALLERY_DAYS * 86_400_000;
const gallery = new Map<number, GalleryPost & { keyword: string }>();
const galleryErrors: string[] = [];
for (const keyword of GALLERY_KEYWORDS) {
  const res = get(
    `https://gall.dcinside.com/mini/board/lists/?id=goodramen&s_type=search_subject_memo&s_keyword=${encodeURIComponent(keyword)}`,
    "https://gall.dcinside.com/",
  );
  if (!res.ok) {
    galleryErrors.push(`${keyword}: ${res.error}`);
    continue;
  }
  for (const p of parseGalleryList(res.body))
    if (
      Date.parse(p.postedAt.replace(" ", "T") + "+09:00") >= since &&
      !gallery.has(p.no)
    )
      gallery.set(p.no, { ...p, keyword });
  sleep(3000);
}

const bodies: {
  no: number;
  title: string;
  postedAt: string;
  body: string;
  url: string;
}[] = [];
for (const p of [...gallery.values()]
  .filter((g) => isEventTitle(g.title))
  .slice(0, GALLERY_BODY_LIMIT)) {
  const res = get(
    p.url,
    "https://gall.dcinside.com/mini/board/lists/?id=goodramen",
  );
  if (res.ok)
    bodies.push({ no: p.no, url: p.url, ...parseGalleryPost(res.body) });
  sleep(3000);
}

const searches = targets.flatMap((t) => t.searches).length;
const blocked = searches > 0 && failures === searches;
writeFileSync(
  out,
  JSON.stringify(
    {
      collectedAt: new Date().toISOString(),
      blocked,
      failures,
      searches,
      targets,
      gallery: [...gallery.values()],
      galleryErrors,
    },
    null,
    2,
  ),
);
const digest = [
  ...targets.map((t, i) =>
    [
      `#${i} [${t.kind === "new" ? "신규" : "게재 폐업"}] ${t.name} | ${t.address} | ${t.kind === "new" ? "인허가" : "폐업"} ${t.date}`,
      t.prior ? `  직전 판정: ${t.prior}` : "",
      t.sameBuildingOpen
        ? `  같은 건물 영업 인허가: ${t.sameBuildingOpen.slice(0, 200)}`
        : "",
      ...t.searches.flatMap((q) => [
        `  검색 "${q.query}": ${q.ok ? (q.noResults ? "결과 없음" : "") : `실패(${q.error})`}`,
        q.place
          ? `    장소카드 [${q.place.status}] ${q.place.card.slice(80, 330)}`
          : "",
        ...q.snippets.map(
          (sn) => `    - (${sn.date ?? "날짜없음"}) ${sn.text.slice(0, 200)}`,
        ),
      ]),
    ]
      .filter(Boolean)
      .join("\n"),
  ),
  "\n=== 라멘 미니갤 사건 글 본문",
  ...bodies.map(
    (b) =>
      `${b.postedAt.slice(0, 10)} [${b.title}] ${b.body.slice(0, 300)} ${b.url}`,
  ),
  "\n=== 라멘 미니갤 제목 목록",
  ...[...gallery.values()]
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt))
    .map((g) => `${g.postedAt.slice(0, 10)} ${g.title} ${g.url}`),
].join("\n");
writeFileSync(out.replace(/\.json$/, "") + ".txt", digest);

console.log(
  `대상 ${targets.length}건(신규 ${targets.filter((t) => t.kind === "new").length}·게재 폐업 ${targets.filter((t) => t.kind === "closed").length}) 검색 ${searches}회 중 실패 ${failures}` +
    ` / 라멘갤 ${GALLERY_DAYS}일 글 ${gallery.size}건(본문 ${bodies.length})(실패 키워드 ${galleryErrors.length}) → ${out}`,
);
if (blocked || galleryErrors.length === GALLERY_KEYWORDS.length) {
  console.error(
    "검수 소스 접속 차단 — 환경 허용 도메인(search.daum.net·gall.dcinside.com) 확인 필요",
  );
  process.exit(2);
}
