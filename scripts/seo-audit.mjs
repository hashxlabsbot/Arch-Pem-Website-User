#!/usr/bin/env node
/**
 * On-page SEO / AEO audit. Crawls every URL in the sitemap on a running server and checks what search engines and
 * answer engines read: title and description length and uniqueness, one H1, canonical, share images (and that they
 * load), JSON-LD that parses, image alt text, noindex, and that every internal link resolves.
 *
 *   npm run build && npm start        # in one terminal
 *   node scripts/seo-audit.mjs http://localhost:3000 [concurrency]
 *
 * Use a low concurrency (e.g. 2) against `next dev`, which compiles each page on first request.
 *
 * Exits 1 if any error is found. Warnings (soft limits) don't fail the run.
 */
const BASE = (process.argv[2] || 'http://localhost:3001').replace(/\/$/, '')
const CONCURRENCY = Math.max(1, Number(process.argv[3]) || 6)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const errors = []
const warns = []
const err = (url, msg) => errors.push(`${url}  ${msg}`)
const warn = (url, msg) => warns.push(`${url}  ${msg}`)

async function get(url) {
  for (let i = 0; i < 3; i++) {
    try {
      return await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'arcpem-seo-audit' } })
    } catch (e) {
      if (i === 2) throw e
      await sleep(300)
    }
  }
}

const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'))
  return m ? decode(m[2] ?? m[3]) : null
}
const metaContent = (html, key, by = 'name') => {
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) if (attr(m[0], by) === key) return attr(m[0], 'content')
  return null
}

const sm = await get(`${BASE}/sitemap.xml`)
if (!sm || sm.status !== 200) {
  console.error(`Cannot read ${BASE}/sitemap.xml (status ${sm?.status})`)
  process.exit(2)
}
const xml = await sm.text()
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1]))
const toLocal = (u) => u.replace(/^https?:\/\/[^/]+/, BASE)

const titles = new Map()
const descs = new Map()
const internal = new Set()
const ogImages = new Set()
let jsonLdBlocks = 0
const typeCount = {}

async function audit(loc) {
  const url = toLocal(loc)
  const path = url.replace(BASE, '') || '/'
  const res = await get(url)
  if (res.status !== 200) return err(path, `status ${res.status}`)
  const html = await res.text()

  const title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '').trim()
  if (!title) err(path, 'missing <title>')
  else {
    if (title.length < 20 || title.length > 70) warn(path, `title length ${title.length}: "${title}"`)
    titles.set(title, [...(titles.get(title) || []), path])
  }

  const desc = metaContent(html, 'description')
  if (!desc) err(path, 'missing meta description')
  else {
    if (desc.length < 70 || desc.length > 170) warn(path, `description length ${desc.length}`)
    descs.set(desc, [...(descs.get(desc) || []), path])
  }

  const h1s = [...html.matchAll(/<h1\b/gi)].length
  if (h1s !== 1) err(path, `${h1s} <h1> elements (want exactly 1)`)

  const canon = (html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i) || [])[0]
  const canonHref = canon && attr(canon, 'href')
  if (!canonHref) err(path, 'missing canonical')
  else {
    const cp = canonHref.replace(/^https?:\/\/[^/]+/, '') || '/'
    if (cp !== path) err(path, `canonical points to ${canonHref}`)
  }

  const robots = metaContent(html, 'robots')
  if (robots && /noindex/i.test(robots)) err(path, `noindex: ${robots}`)

  if (!/<html[^>]*\blang=["']en-IN["']/i.test(html)) warn(path, 'html lang is not en-IN')

  const ogImg = metaContent(html, 'og:image', 'property')
  const twImg = metaContent(html, 'twitter:image')
  if (!ogImg) err(path, 'missing og:image')
  else ogImages.add(ogImg)
  if (!twImg) warn(path, 'missing twitter:image')
  if (!metaContent(html, 'og:title', 'property')) err(path, 'missing og:title')

  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    jsonLdBlocks++
    try {
      const data = JSON.parse(m[1])
      const nodes = Array.isArray(data) ? data : data['@graph'] ? data['@graph'] : [data]
      for (const n of nodes) {
        const t = Array.isArray(n['@type']) ? n['@type'].join('+') : n['@type']
        typeCount[t] = (typeCount[t] || 0) + 1
        if (t === 'FAQPage' && !(n.mainEntity || []).length) err(path, 'FAQPage with no questions')
        if (t === 'BreadcrumbList' && !(n.itemListElement || []).length) err(path, 'empty BreadcrumbList')
      }
    } catch (e) {
      err(path, `invalid JSON-LD: ${e.message}`)
    }
  }
  if (!/application\/ld\+json/.test(html)) warn(path, 'no JSON-LD')

  const noAlt = [...html.matchAll(/<img\b[^>]*>/gi)].filter((m) => attr(m[0], 'alt') === null).length
  if (noAlt) err(path, `${noAlt} <img> without alt`)

  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ')
  const words = text.split(/\s+/).filter((w) => w.length > 1).length
  if (words < 250) warn(path, `thin content: ~${words} words`)

  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"'#?]+)[^>]*>/gi)) {
    const h = decode(m[1])
    if (h.startsWith('/') && !h.startsWith('//')) internal.add(h)
    else if (h.startsWith(BASE) || h.startsWith('https://arcpem.com')) internal.add(h.replace(/^https?:\/\/[^/]+/, '') || '/')
  }
}

async function pool(items, n, fn) {
  const q = [...items]
  await Promise.all(Array.from({ length: n }, async () => { while (q.length) await fn(q.shift()) }))
}

console.log(`Auditing ${urls.length} URLs from ${BASE}/sitemap.xml …`)
await pool(urls, CONCURRENCY, audit)

for (const [t, ps] of titles) if (ps.length > 1) err(ps.join(', '), `duplicate title "${t}"`)
for (const [d, ps] of descs) if (ps.length > 1) err(ps.join(', '), `duplicate description "${d.slice(0, 60)}…"`)

const known = new Set(urls.map((u) => toLocal(u).replace(BASE, '') || '/'))
const toCheck = [...internal].filter((h) => !known.has(h) && !/^\/(api|_next|dashboard|login|register|forgot-password|reset-password)/.test(h))
await pool(toCheck, CONCURRENCY, async (h) => {
  const r = await get(`${BASE}${h}`)
  if (r.status >= 400) err(h, `internal link returns ${r.status}`)
})

await pool([...ogImages].slice(0, 80), CONCURRENCY, async (src) => {
  const u = src.startsWith('http') ? toLocal(src) : `${BASE}${src}`
  const r = await get(u)
  const type = r.headers.get('content-type') || ''
  if (r.status !== 200 || !/^image\//.test(type)) err(src, `share image not loadable (${r.status} ${type})`)
})

const robotsRes = await get(`${BASE}/robots.txt`)
const robotsTxt = robotsRes.status === 200 ? await robotsRes.text() : ''
if (!/Sitemap:/i.test(robotsTxt)) err('/robots.txt', 'no Sitemap: line')
for (const f of ['/llms.txt', '/llms-full.txt', '/manifest.webmanifest']) {
  const r = await get(`${BASE}${f}`)
  if (r.status !== 200) err(f, `status ${r.status}`)
}

console.log(`\nPages: ${urls.length} · JSON-LD blocks: ${jsonLdBlocks} · internal links checked: ${toCheck.length} · share images: ${ogImages.size}`)
console.log('Schema types:', Object.entries(typeCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}×${v}`).join('  '))
if (warns.length) console.log(`\nWarnings (${warns.length}):\n  ` + warns.sort().join('\n  '))
if (errors.length) {
  console.log(`\nERRORS (${errors.length}):\n  ` + errors.sort().join('\n  '))
  process.exit(1)
}
console.log('\nNo errors.')
