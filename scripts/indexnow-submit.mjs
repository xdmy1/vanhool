// One-shot: submit every sitemap URL to IndexNow (Bing/Yandex/Seznam).
// Run after a deploy that changes many pages:  node scripts/indexnow-submit.mjs
const SITE = "https://www.inter-bus.md";
const KEY = "b13a626494d7753a193b696248c03071";

const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
const urls = [...xml.matchAll(/<(?:loc|xhtml:link[^>]*href=")([^<"]+)/g)]
  .map((m) => m[1])
  .filter((u) => u.startsWith(SITE));
const unique = [...new Set(urls)];
console.log(`Submitting ${unique.length} URLs to IndexNow...`);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: new URL(SITE).host,
    key: KEY,
    keyLocation: `${SITE}/${KEY}.txt`,
    urlList: unique.slice(0, 10000),
  }),
});
console.log(`IndexNow response: ${res.status} ${res.statusText}`);
