#!/usr/bin/env node
/**
 * Submits every URL in the live sitemap to IndexNow (Bing, Yandex, Seznam, Naver) in one request.
 * Run after a deploy that adds or changes many pages:
 *
 *   INDEXNOW_KEY=<same key as production> node scripts/indexnow-submit.mjs [https://arcpem.com]
 *
 * The key must already be served at <site>/indexnow-key.txt (set INDEXNOW_KEY in production first).
 */
const site = (process.argv[2] || 'https://arcpem.com').replace(/\/$/, '')
const key = process.env.INDEXNOW_KEY
if (!key) {
  console.error('Set INDEXNOW_KEY (the same value production serves at /indexnow-key.txt).')
  process.exit(1)
}

const served = await fetch(`${site}/indexnow-key.txt`).then((r) => (r.ok ? r.text() : ''))
if (served.trim() !== key) {
  console.error(`${site}/indexnow-key.txt does not serve this key yet; deploy with INDEXNOW_KEY set first.`)
  process.exit(1)
}

const xml = await fetch(`${site}/sitemap.xml`).then((r) => r.text())
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
if (urlList.length === 0) {
  console.error('No URLs found in the sitemap.')
  process.exit(1)
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(site).host, key, keyLocation: `${site}/indexnow-key.txt`, urlList }),
})
console.log(`Submitted ${urlList.length} URLs: HTTP ${res.status} ${res.statusText}`)
if (res.status !== 200 && res.status !== 202) {
  console.error(await res.text())
  process.exit(1)
}
