import { normalizeShopName } from "./merge-candidates";

const ROAD = /(\S+(?:로|길))\s*\d/;

export function buildQueries(name: string, address: string): string[] {
  const base = name
    .replace(/\(.*?\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const dong = address.match(/\(([^,()]+?(?:동|가|읍|면|리))(?:,|\))/)?.[1];
  const parts = address.replace(/\(.*$/, "").split(/\s+/);
  const sigungu = parts.find((p, i) => i > 0 && /(?:시|군|구)$/.test(p));
  const lotDong = parts.find((p, i) => i > 1 && /(?:동|가|읍|면|리)$/.test(p));
  const road = address.match(ROAD)?.[1];
  const first = dong ?? lotDong ?? sigungu ?? "";
  const second = road ?? sigungu ?? "";
  return [...new Set([`${base} ${first}`.trim(), `${base} ${second}`.trim()])];
}

export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export type PlaceStatus = { status: string; card: string };

/* Daum 통합검색 장소 카드: "주소 도로명 주소 … 이용 영업중 | 08:00~20:00" */
export function extractPlaceStatus(text: string): PlaceStatus | null {
  const at = text.indexOf("도로명 주소");
  if (at < 0) return null;
  const card = text.slice(Math.max(0, at - 120), at + 400);
  const status =
    card.match(
      /이용\s+(영업중|영업 종료|영업종료|휴무|휴업|폐업|곧 영업 시작|브레이크타임)/,
    )?.[1] ?? "표기 없음";
  return { status, card };
}

export type Snippet = { text: string; date: string | null };

const DATE = /20\d{2}\.\d{2}\.\d{2}/;
/* 검색어가 페이지 제목·광고·결과 없음 안내로 되돌아온 조각 — 후기가 아니다 */
const ECHO = /Daum 검색|관련 광고|검색결과가 없습니다|본문 바로가기/;

export function hasNoResults(text: string): boolean {
  return /에 대한 검색결과가 없습니다/.test(text);
}

/* 상호(공백 무시)가 등장하는 위치마다 뒤 220자를 자르고, 그 안의 첫 날짜를 후기 날짜로 본다 */
export function extractSnippets(
  text: string,
  name: string,
  limit = 5,
): Snippet[] {
  const target = normalizeShopName(name.replace(/\(.*?\)/g, ""));
  if (target.length < 2) return [];
  const compact: { ch: string; at: number }[] = [];
  for (let i = 0; i < text.length; i++)
    if (!/\s/.test(text[i])) compact.push({ ch: text[i], at: i });
  const flat = normalizeShopName(compact.map((c) => c.ch).join(""));
  const out: Snippet[] = [];
  let from = 0;
  let lastEnd = -1;
  while (out.length < limit) {
    const k = flat.indexOf(target, from);
    if (k < 0 || k >= compact.length) break;
    const start = compact[k].at;
    from = k + target.length;
    if (start < lastEnd) continue;
    const chunk = text.slice(start, start + 220);
    lastEnd = start + 220;
    if (
      ECHO.test(chunk.slice(0, 80)) ||
      ECHO.test(text.slice(Math.max(0, start - 20), start))
    )
      continue;
    out.push({ text: chunk, date: chunk.match(DATE)?.[0] ?? null });
  }
  return out;
}

export type GalleryPost = {
  no: number;
  title: string;
  postedAt: string;
  url: string;
};

export function parseGalleryList(html: string): GalleryPost[] {
  const rows =
    html.match(/<tr class="ub-content[^"]*"[^>]*>[\s\S]*?<\/tr>/g) ?? [];
  const posts: GalleryPost[] = [];
  for (const row of rows) {
    const no = Number(row.match(/class="gall_num">\s*(\d+)\s*</)?.[1]);
    if (!no) continue;
    const anchor =
      row.match(/class="gall_tit[^"]*">\s*<a[^>]*>([\s\S]*?)<\/a>/)?.[1] ?? "";
    const postedAt = row.match(/class="gall_date" title="([^"]+)"/)?.[1] ?? "";
    posts.push({
      no,
      title: htmlToText(anchor),
      postedAt,
      url: `https://gall.dcinside.com/mini/board/view/?id=goodramen&no=${no}`,
    });
  }
  return posts;
}

const EVENT_TITLE =
  /폐업|이전|오픈|개업|[0-9]호점|휴업|영업\s?종료|문\s?닫|신규|가오픈/;

export function isEventTitle(title: string): boolean {
  return EVENT_TITLE.test(title);
}

export type GalleryBody = { title: string; postedAt: string; body: string };

export function parseGalleryPost(html: string): GalleryBody {
  const clean = html.replace(
    /<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g,
    " ",
  );
  const title = htmlToText(
    clean.match(/<span class="title_subject">([\s\S]*?)<\/span>/)?.[1] ?? "",
  );
  const postedAt = clean.match(/class="gall_date" title="([^"]+)"/)?.[1] ?? "";
  const start = clean.indexOf('class="write_div"');
  if (start < 0) return { title, postedAt, body: "" };
  const open = clean.indexOf(">", start) + 1;
  const end = clean.indexOf("btn_recommend_box", open);
  const body = htmlToText(clean.slice(open, end < 0 ? open + 5000 : end))
    .replace(/추천검색.*$/, "")
    .trim();
  return { title, postedAt, body };
}
