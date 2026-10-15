'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  AnimatePresence, LayoutGroup, animate, motion, useInView, useMotionTemplate, useMotionValue,
  useReducedMotion, useScroll, useSpring, useTransform,
} from 'framer-motion'
import BrandedCover from './BrandedCover'
import { getCategoryStyle } from './categoryStyle'
import { onReveal } from '@/components/marketing/SitePreloader'
import type { JCategory, JPost, JRole, JTool } from './journal-data'

type Sort = 'new' | 'quick' | 'deep'

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })

/* ─────────────────────────── small primitives ─────────────────────────── */

function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduce = useReducedMotion()
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!inView) return
    if (reduce) { setV(to); return }
    const c = animate(0, to, { duration: 1.5, ease: 'easeOut', onUpdate: (x) => setV(Math.round(x)) })
    return () => c.stop()
  }, [inView, to, reduce])
  return <span ref={ref}>{v}{suffix}</span>
}

/** Pointer-driven 3D tilt with a moving highlight. No-op on touch / reduced motion. */
function Tilt({ children, className = '', max = 7 }: { children: React.ReactNode; className?: string; max?: number }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const rx = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 })
  const ry = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 })
  const gx = useMotionValue(50)
  const gy = useMotionValue(50)
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(245,180,0,0.22), transparent 58%)`
  const [on, setOn] = useState(false)

  const move = (e: React.PointerEvent) => {
    if (reduce || e.pointerType === 'touch' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    ry.set((px - 0.5) * 2 * max)
    rx.set(-(py - 0.5) * 2 * max)
    gx.set(px * 100); gy.set(py * 100)
    setOn(true)
  }
  const leave = () => { rx.set(0); ry.set(0); setOn(false) }

  return (
    <motion.div
      ref={ref}
      className={`jn-tilt ${className}`}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      onPointerMove={move}
      onPointerLeave={leave}
    >
      {children}
      <motion.span className="jn-glare" aria-hidden="true" style={{ background: glare, opacity: on ? 1 : 0 }} />
    </motion.div>
  )
}

function Cover({ post, sizes, priority = false }: { post: JPost; sizes: string; priority?: boolean }) {
  return post.coverImage ? (
    <Image src={post.coverImage} alt={post.coverImageAlt || post.title} fill sizes={sizes} priority={priority} style={{ objectFit: 'cover' }} />
  ) : (
    <BrandedCover categorySlug={post.categorySlug} category={post.category} />
  )
}

function Tag({ post }: { post: JPost }) {
  const { color, ink } = getCategoryStyle(post.categorySlug)
  return <span className="jn-tag" style={{ background: color, color: ink }}>{post.category}</span>
}

function Pips({ minutes }: { minutes: number }) {
  const n = Math.min(5, Math.max(1, Math.round(minutes / 3)))
  return (
    <span className="jn-pips" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => <i key={i} className={i < n ? 'on' : ''} />)}
    </span>
  )
}

/* ─────────────────────────── hero: 3D document stack ─────────────────────────── */

function Stack({ posts, go }: { posts: JPost[]; go: boolean }) {
  const reduce = useReducedMotion()
  const mx = useSpring(useMotionValue(0), { stiffness: 90, damping: 16 })
  const my = useSpring(useMotionValue(0), { stiffness: 90, damping: 16 })
  const rotY = useTransform(mx, [-1, 1], [-16, 16])
  const rotX = useTransform(my, [-1, 1], [12, -12])
  const ref = useRef<HTMLDivElement>(null)

  const move = (e: React.PointerEvent) => {
    if (reduce || e.pointerType === 'touch' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 2)
    my.set(((e.clientY - r.top) / r.height - 0.5) * 2)
  }
  const leave = () => { mx.set(0); my.set(0) }
  const list = posts.slice(0, 4)

  return (
    <div className="jn-stack" ref={ref} onPointerMove={move} onPointerLeave={leave}>
      <motion.div className="jn-stack-in" style={{ rotateX: reduce ? 0 : rotX, rotateY: reduce ? 0 : rotY }}>
        {list.map((p, i) => (
          <motion.div
            key={p.slug}
            className="jn-sheet-wrap"
            initial={{ y: -520, rotate: -6 }}
            animate={go ? { y: 0, rotate: 0 } : { y: -520, rotate: -6 }}
            transition={{ type: 'spring', stiffness: 70, damping: 14, mass: 1.1, delay: 0.15 + (list.length - 1 - i) * 0.13 }}
          >
            <Link href={`/blog/${p.slug}`} className="jn-sheet" style={{ ['--i' as string]: i } as React.CSSProperties}>
              <Tag post={p} />
              <span className="jn-sheet-art"><Cover post={p} sizes="340px" priority={i === 0} /></span>
              <b className="jn-sheet-title">{p.title}</b>
              <span className="jn-sheet-meta">{fmt(p.date)} · {p.minutes} min read</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <svg className="jn-badge" viewBox="0 0 120 120" aria-hidden="true">
        <defs><path id="jn-circ" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" /></defs>
        <g className="jn-badge-spin">
          <text><textPath href="#jn-circ" startOffset="0">FIELD NOTES • FOR THE SITE OFFICE • FIELD NOTES • FOR THE SITE OFFICE •</textPath></text>
        </g>
        <circle cx="60" cy="60" r="26" className="jn-badge-core" />
        <text x="60" y="68" textAnchor="middle" className="jn-badge-n">{posts.length}</text>
      </svg>
    </div>
  )
}

/* ─────────────────────────── cards ─────────────────────────── */

function Card({ post, n }: { post: JPost; n: number }) {
  return (
    <motion.li
      layout
      className="jn-cell"
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1], layout: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] } }}
    >
      <Tilt className="jn-card-tilt" max={5}>
        <Link href={`/blog/${post.slug}`} className="jn-card" aria-label={post.title}>
          <span className="jn-card-media">
            <Cover post={post} sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw" />
            <Tag post={post} />
            <span className="jn-no">No.{String(n).padStart(2, '0')}</span>
          </span>
          <span className="jn-card-body">
            <span className="jn-card-date">{fmt(post.date)}</span>
            <span className="jn-card-title">{post.title}</span>
            <span className="jn-card-desc">{post.description}</span>
            <span className="jn-card-foot">
              <span className="jn-read"><Pips minutes={post.minutes} />{post.minutes} min read</span>
              <span className="jn-go" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </span>
          </span>
        </Link>
      </Tilt>
    </motion.li>
  )
}

/* ─────────────────────────── main ─────────────────────────── */

export default function JournalIndex({
  posts, categories, tools, roles, featuredSlug, mode = 'index', categoryName, categorySlug,
}: {
  posts: JPost[]
  categories: JCategory[]
  tools: JTool[]
  roles: JRole[]
  featuredSlug?: string
  mode?: 'index' | 'category'
  categoryName?: string
  categorySlug?: string
}) {
  const reduce = useReducedMotion()
  const [go, setGo] = useState(false)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const [sort, setSort] = useState<Sort>('new')
  const [focus, setFocus] = useState(false)
  const heroRef = useRef<HTMLElement>(null)
  const exploreRef = useRef<HTMLElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => onReveal(() => setGo(true)), [])

  // "/" focuses the search, like a docs site
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (e.key !== '/' || (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el?.isContentEditable)) return
      e.preventDefault()
      searchRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const ghostX = useTransform(scrollYProgress, [0, 1], ['0%', '-22%'])
  const ghostY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  const featured = posts.find((p) => p.slug === featuredSlug) ?? posts.find((p) => p.featured) ?? posts[0]
  const filtering = q.trim() !== '' || cat !== 'all'
  const showFeatured = mode === 'index' && !filtering && !!featured

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    let list = posts.filter((p) => {
      if (cat !== 'all' && p.categorySlug !== cat) return false
      if (!needle) return true
      return (
        p.title.toLowerCase().includes(needle) ||
        p.description.toLowerCase().includes(needle) ||
        p.category.toLowerCase().includes(needle) ||
        p.tags.some((t) => t.toLowerCase().includes(needle))
      )
    })
    if (showFeatured && featured) list = list.filter((p) => p.slug !== featured.slug)
    if (sort === 'quick') list = [...list].sort((a, b) => a.minutes - b.minutes)
    if (sort === 'deep') list = [...list].sort((a, b) => b.minutes - a.minutes)
    return list
  }, [posts, q, cat, sort, showFeatured, featured])

  const suggestions = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return []
    return posts.filter((p) => `${p.title} ${p.category} ${p.tags.join(' ')}`.toLowerCase().includes(needle)).slice(0, 4)
  }, [posts, q])

  const topics = useMemo(() => {
    const set = new Set<string>(categories.map((c) => c.name))
    posts.forEach((p) => p.tags.forEach((t) => set.add(t)))
    return Array.from(set).slice(0, 14)
  }, [categories, posts])

  const totalMinutes = posts.reduce((s, p) => s + p.minutes, 0)
  const newest = posts.reduce((a, p) => (p.date > a ? p.date : a), posts[0]?.date ?? '')
  const heroPosts = mode === 'index' ? [featured, ...posts.filter((p) => p.slug !== featured?.slug)].filter(Boolean) as JPost[] : posts

  const toResults = () => exploreRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  const reset = () => { setQ(''); setCat('all'); setSort('new') }

  const rise = (d: number) => ({
    initial: { y: '110%' },
    animate: go ? { y: '0%' } : { y: '110%' },
    transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] as const, delay: d },
  })
  const fade = (d: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: go ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    transition: { duration: 0.7, ease: 'easeOut' as const, delay: d },
  })

  const isCategory = mode === 'category'
  const lines = isCategory
    ? [categoryName ?? 'Category', 'field notes.']
    : ['Field notes', 'for people who', 'build India.']

  return (
    <div className="jn">
      <noscript><style>{'.jn *{opacity:1!important;transform:none!important}'}</style></noscript>

      {/* ───────── hero ───────── */}
      <section ref={heroRef} className={`jn-hero${isCategory ? ' is-cat' : ''}`}>
        <div className="jn-hero-bg" aria-hidden="true">
          <i className="jn-glow g1" /><i className="jn-glow g2" />
          <motion.span className="jn-ghost" style={reduce ? undefined : { x: ghostX, y: ghostY }}>JOURNAL</motion.span>
        </div>

        <div className="container jn-hero-in">
          <div className="jn-copy">
            <motion.div className="jn-kicker" {...fade(0.05)}>
              <i className="jn-live" />
              {isCategory ? (
                <><Link href="/blog">The Site Journal</Link><span>/</span>{categoryName}</>
              ) : (
                <>The Site Journal<span>·</span>{posts.length} field notes</>
              )}
            </motion.div>

            <h1 className="jn-h1">
              {lines.map((l, i) => (
                <span className="jn-line" key={l}>
                  <motion.span className={`jn-line-in${i === lines.length - 1 ? ' is-hot' : ''}`} {...rise(0.12 + i * 0.12)}>{l}</motion.span>
                </span>
              ))}
              {!isCategory && <span className="jn-sr"> — BOQ, GST and contractor billing guides for Indian builders</span>}
            </h1>

            <motion.p className="jn-lede" {...fade(0.55)}>
              {isCategory
                ? `${posts.length} worked ${posts.length === 1 ? 'guide' : 'guides'} on ${categoryName} for Indian architects, builders and site teams.`
                : 'Worked examples on GST, BOQ and contractor billing — written for Indian architects, builders and the people running the site.'}
            </motion.p>

            <motion.div className="jn-search-wrap" {...fade(0.68)}>
              <label className={`jn-search${focus ? ' is-focus' : ''}`}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2.4" /><path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
                <input
                  ref={searchRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onFocus={() => setFocus(true)}
                  onBlur={() => setTimeout(() => setFocus(false), 120)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { toResults(); (e.target as HTMLInputElement).blur() } if (e.key === 'Escape') setQ('') }}
                  placeholder="Search GST, BOQ, TMT, contractor bills…"
                  aria-label="Search the journal"
                />
                {q ? (
                  <button type="button" className="jn-clear" onClick={() => setQ('')} aria-label="Clear search">×</button>
                ) : (
                  <kbd>/</kbd>
                )}
              </label>
              <AnimatePresence>
                {focus && suggestions.length > 0 && (
                  <motion.ul
                    className="jn-suggest"
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16 }}
                  >
                    {suggestions.map((s) => (
                      <li key={s.slug}>
                        <Link href={`/blog/${s.slug}`}>
                          <em>{s.category}</em>
                          <span>{s.title}</span>
                        </Link>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.div>

            {!isCategory && (
              <motion.div className="jn-chips" {...fade(0.8)}>
                {categories.slice(0, 5).map((c) => (
                  <button key={c.slug} type="button" onClick={() => { setCat(c.slug); toResults() }}>
                    <i style={{ background: getCategoryStyle(c.slug).color }} />{c.name}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <Stack posts={heroPosts} go={go} />
        </div>

        <div className="container jn-stats">
          {[
            { n: posts.length, l: isCategory ? 'Articles here' : 'Field notes' },
            { n: isCategory ? 1 : categories.length, l: isCategory ? 'Topic' : 'Topics' },
            { n: totalMinutes, l: 'Minutes of reading', s: '' },
          ].map((s, i) => (
            <motion.div key={s.l} className="jn-stat" {...fade(0.95 + i * 0.08)}>
              <b><CountUp to={s.n} suffix={s.s} /></b><span>{s.l}</span>
            </motion.div>
          ))}
          {newest && (
            <motion.div className="jn-stat" {...fade(1.2)}>
              <b className="is-txt">{new Date(newest).toLocaleDateString('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' })}</b>
              <span>Latest note</span>
            </motion.div>
          )}
        </div>
        <div className="jn-hazard" aria-hidden="true" />
      </section>

      {/* ───────── topic ticker ───────── */}
      <div className="jn-ticker" aria-hidden="true">
        <div className="jn-ticker-track">
          {[...topics, ...topics].map((t, i) => <span key={i}>{t}<i /></span>)}
        </div>
      </div>

      {/* ───────── explorer ───────── */}
      <section ref={exploreRef} className="jn-explore" id="notes">
        <div className="jn-bar">
          <div className="container jn-bar-in">
            <div className="jn-bar-chips" role="tablist" aria-label="Categories">
              {isCategory ? (
                <>
                  <Link href="/blog" className="jn-chip">All notes</Link>
                  {categories.map((c) => (
                    <Link key={c.slug} href={`/blog/category/${c.slug}`} className={`jn-chip${c.slug === categorySlug ? ' is-on' : ''}`}>
                      {c.name}<small>{c.count}</small>
                    </Link>
                  ))}
                </>
              ) : (
                <>
                  <button type="button" className={`jn-chip${cat === 'all' ? ' is-on' : ''}`} onClick={() => setCat('all')}>
                    All notes<small>{posts.length}</small>
                  </button>
                  {categories.map((c) => (
                    <button key={c.slug} type="button" className={`jn-chip${cat === c.slug ? ' is-on' : ''}`} onClick={() => setCat(c.slug)}>
                      <i style={{ background: getCategoryStyle(c.slug).color }} />{c.name}<small>{c.count}</small>
                    </button>
                  ))}
                </>
              )}
            </div>
            <div className="jn-bar-tools">
              <label className="jn-mini-search">
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2.6" /><path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter notes" aria-label="Filter notes" />
              </label>
              <div className="jn-sort" role="group" aria-label="Sort">
                {([['new', 'Newest'], ['quick', 'Quick'], ['deep', 'Deep']] as [Sort, string][]).map(([k, l]) => (
                  <button key={k} type="button" className={sort === k ? 'is-on' : ''} onClick={() => setSort(k)}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          {/* lead story */}
          <AnimatePresence initial={false}>
            {showFeatured && featured && (
              <motion.div
                key="lead"
                className="jn-lead-wrap"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.2 } }}
                viewport={{ once: true, margin: '0px 0px -10% 0px' }} transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <Tilt className="jn-lead-tilt" max={4}>
                  <Link href={`/blog/${featured.slug}`} className="jn-lead">
                    <span className="jn-lead-media">
                      <Cover post={featured} sizes="(max-width: 900px) 100vw, 55vw" priority />
                      <span className="jn-lead-flag">★ Lead story</span>
                    </span>
                    <span className="jn-lead-body">
                      <Tag post={featured} />
                      <span className="jn-lead-title">{featured.title}</span>
                      <span className="jn-lead-desc">{featured.description}</span>
                      <span className="jn-lead-meta">{featured.author} · {fmt(featured.date)} · {featured.minutes} min read</span>
                      <span className="jn-lead-cta">Read the field note
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                    </span>
                  </Link>
                </Tilt>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="jn-status" aria-live="polite">
            <span>
              {filtering
                ? <>Showing <b>{results.length}</b> of {posts.length} notes{q.trim() && <> for “{q.trim()}”</>}</>
                : <>All <b>{posts.length}</b> notes</>}
            </span>
            {filtering && <button type="button" onClick={reset}>Clear filters ×</button>}
          </div>

          {/* grid */}
          <LayoutGroup>
            <motion.ul layout className="jn-grid">
              <AnimatePresence mode="popLayout" initial={false}>
                {results.map((p) => (
                  <Card key={p.slug} post={p} n={posts.findIndex((x) => x.slug === p.slug) + 1} />
                ))}
              </AnimatePresence>
            </motion.ul>
          </LayoutGroup>

          {results.length === 0 && (
            <div className="jn-empty">
              <div className="jn-empty-stamp">No<br />entry</div>
              <h3>Nothing filed under “{q.trim() || categories.find((c) => c.slug === cat)?.name}”.</h3>
              <p>Try a broader word like “GST”, “BOQ” or “bill”, or browse every note.</p>
              <button type="button" onClick={reset}>Show all notes</button>
            </div>
          )}
        </div>
      </section>

      {/* ───────── roles ───────── */}
      {roles.length > 0 && (
        <section className="jn-paths">
          <div className="container">
            <div className="jn-sec-head">
              <span>Start with your role</span>
              <h2>How ARC PEM fits your work.</h2>
            </div>
            <div className="jn-paths-grid">
              {roles.map((r, i) => (
                <motion.div
                  key={r.slug}
                  initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -8% 0px' }} transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <Link href={`/for/${r.slug}`} className="jn-path">
                    <em>{String(i + 1).padStart(2, '0')}</em>
                    <b>{r.label}</b>
                    <span>{r.description}</span>
                    <i aria-hidden="true">→</i>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────── tools ───────── */}
      {tools.length > 0 && (
        <section className="jn-tools">
          <div className="container">
            <div className="jn-sec-head is-dark">
              <span>Free tools</span>
              <h2>Put the numbers to work.</h2>
            </div>
            <div className="jn-tools-grid">
              {tools.map((t, i) => (
                <motion.div
                  key={t.slug}
                  initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -8% 0px' }} transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <Link href={`/tools/${t.slug}`} className="jn-tool">
                    <em>{String(i + 1).padStart(2, '0')}</em>
                    <b>{t.name}</b>
                    <span>{t.short}</span>
                    <i>Open tool →</i>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
