/* IndexNow 푸시 — 네이버 공식 지원(2023-07 공지), Bing에도 전파.
   기본은 프로덕션 sitemap.xml 전체(색인 대상과 정합), 인자로 개별 URL 지정 가능.
   사용: npm run indexnow [-- https://ramap.kr/shop/xxx ...] */

const HOST = "ramap.kr";
const KEY = "63ade0b0eb4cc68704f932e7e046aade";
const ENDPOINT = "https://searchadvisor.naver.com/indexnow";
const BATCH_MAX = 10000;

async function urlsFromSitemap(): Promise<string[]> {
  const res = await fetch(`https://${HOST}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap fetch 실패: ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const args = process.argv.slice(2);
const urlList = (args.length > 0 ? args : await urlsFromSitemap()).slice(
  0,
  BATCH_MAX,
);

const res = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, urlList }),
});
console.log(
  `IndexNow ${urlList.length}건 → ${res.status} ${res.status === 200 || res.status === 202 ? "접수" : "실패"}`,
);
if (res.status !== 200 && res.status !== 202) {
  console.error(await res.text());
  process.exit(1);
}
