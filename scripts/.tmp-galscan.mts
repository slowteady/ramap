import { writeFileSync } from "node:fs";
import { get, sleep } from "./lib/http.ts";
import { htmlToText } from "./lib/evidence.ts";
const [out, mode, maxPages, since] = process.argv.slice(2);
type Row = { no: number; head: string; title: string; comments: number; postedAt: string; views: number; rec: number };
const rows: Row[] = [];
const stop = Date.parse(since + "T00:00:00+09:00");
for (let p = 1; p <= Number(maxPages); p++) {
  const url = `https://gall.dcinside.com/mini/board/lists/?id=goodramen&page=${p}${mode === "rec" ? "&exception_mode=recommend" : ""}`;
  let r = get(url, "https://gall.dcinside.com/");
  if (!r.ok) { sleep(5000); r = get(url, "https://gall.dcinside.com/"); }
  if (!r.ok) { console.error("fail", p, r.error); continue; }
  const trs = r.body.match(/<tr class="ub-content[^"]*"[^>]*>[\s\S]*?<\/tr>/g) ?? [];
  let oldest = Infinity;
  for (const tr of trs) {
    if (/icon_notice/.test(tr)) continue;
    const no = Number(tr.match(/class="gall_num">\s*(\d+)/)?.[1]);
    if (!no) continue;
    const head = htmlToText(tr.match(/class="gall_subject">([\s\S]*?)<\/td>/)?.[1] ?? "");
    const a = tr.match(/class="gall_tit[^"]*">\s*<a[^>]*>([\s\S]*?)<\/a>/)?.[1] ?? "";
    const comments = Number(tr.match(/class="reply_num">\[(\d+)/)?.[1] ?? 0);
    const postedAt = tr.match(/class="gall_date" title="([^"]+)"/)?.[1] ?? "";
    const views = Number(tr.match(/class="gall_count">(\d+)/)?.[1] ?? 0);
    const rec = Number(tr.match(/class="gall_recommend">(\d+)/)?.[1] ?? 0);
    rows.push({ no, head, title: htmlToText(a), comments, postedAt, views, rec });
    const t = Date.parse(postedAt.replace(" ", "T") + "+09:00");
    if (t < oldest) oldest = t;
  }
  if (p % 25 === 0) { process.stdout.write(`p${p} ${rows.length} ${new Date(oldest).toISOString().slice(0,10)}\n`); writeFileSync(out, JSON.stringify(rows)); }
  if (oldest < stop) break;
  sleep(1500);
}
writeFileSync(out, JSON.stringify(rows));
console.log("done", rows.length);
