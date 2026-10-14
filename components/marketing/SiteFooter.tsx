'use client'

import { useRef } from 'react'
import Link from 'next/link'
import LedgerLogo from '@/components/LedgerLogo'
import { useDemoModal } from '@/components/marketing/DemoModalContext'
import { company, formatAddress, phoneTel, whatsappLink } from '@/lib/company'
import { SEGMENTS, COMPARISONS } from '@/lib/aeo-pages'
import { LIVE_TOOLS } from '@/lib/tools'
import DotWord from '@/components/marketing/DotWord'

/**
 * Site-wide footer (rendered by MarketingShell). HashX-style: big statement
 * band with a live version card, numbered link columns, contact cards, a
 * feature ticker and a cursor spotlight. Styles: app/(marketing)/final-cta.css (.sf).
 */

const COLS: { title: string; links: { href: string; label: string }[] }[] = [
  { title: 'Product', links: [
    { href: '/solutions#project-mgmt', label: 'Project & Budget' },
    { href: '/solutions#expense-mgmt', label: 'Expense & Finance' },
    { href: '/solutions#power-feat', label: 'Power Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/dashboard/downloads', label: 'Download App' },
  ] },
  { title: 'Built for', links: SEGMENTS.map((s) => ({ href: `/for/${s.slug}`, label: s.label })) },
  { title: 'Compare & guides', links: [
    { href: '/guides/best-construction-software-india', label: 'Software Buyer’s Guide' },
    ...COMPARISONS.map((c) => ({ href: `/compare/${c.slug}`, label: c.label })),
    { href: '/blog', label: 'Blog' },
    { href: '/resources', label: 'Guides & Templates' },
  ] },
  { title: 'Free tools', links: [...LIVE_TOOLS.map((t) => ({ href: `/tools/${t.slug}`, label: t.name.replace(' (BBS)', '') })), { href: '/tools', label: 'All Free Tools' }] },
  { title: 'Company', links: [
    { href: '/about', label: 'About & Customers' },
    { href: '/contact', label: 'Contact' },
    { href: '/resources', label: 'Help Centre' },
  ] },
]
const TICKER = ['BOQ & Budgets', 'Vendor Ledger', 'Labour & Wages', 'Contractor Bills', 'GST Purchase Register', 'Tally Export', 'Budget vs Actual', 'Works Offline', 'Windows & Mac']

const Arrow = () => (<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4.5L12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>)
const Tricolour = () => (<svg viewBox="0 0 18 12" aria-hidden="true"><rect width="18" height="4" fill="#ff9933" /><rect y="4" width="18" height="4" fill="#fff" /><rect y="8" width="18" height="4" fill="#138808" /><circle cx="9" cy="6" r="1.4" fill="none" stroke="#000080" strokeWidth="0.6" /></svg>)

export default function SiteFooter() {
  const openDemo = useDemoModal()
  const ref = useRef<HTMLElement>(null)
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--sx', `${e.clientX - r.left}px`)
    el.style.setProperty('--sy', `${e.clientY - r.top}px`)
  }
  const year = new Date().getFullYear()

  return (
    <>
      {/* Ticker band — sits directly above the footer */}
      <div className="sf-tickerwrap">
        <div className="sf-ticker" aria-hidden="true">
          <div className="sf-ticker-track">
            {[...TICKER, ...TICKER].map((t, i) => <span key={i}>{t}<i /></span>)}
          </div>
        </div>
      </div>

    <footer ref={ref} className="sf" onPointerMove={onMove}>
      <span className="sf-spot" aria-hidden="true" />
      <div className="container sf-inner">
        {/* Statement band */}
        <div className="sf-top">
          <div>
            <Link href="/" className="sf-logo" aria-label="ARC PEM home"><LedgerLogo height={48} onDark /></Link>
            <p className="sf-statement">Built for the people <span>who build India.</span></p>
            <p className="sf-tag">Project expense management for Indian architects, contractors and builders — BOQ, vendor bills, labour, GST and TallyPrime export, fully offline at the site office.</p>
          </div>
          <div className="sf-status">
            <div className="sf-status-row"><span className="sf-live" />ARC PEM v{company.product.version} · {company.product.releaseLabel}</div>
            <div className="sf-status-meta">Windows &amp; Mac · Works offline · Annual licence</div>
            <div className="sf-status-actions">
              <button className="sf-btn" onClick={openDemo}>Book a free demo <Arrow /></button>
              <Link href="/dashboard/downloads" className="sf-btn sf-btn-ghost">Download</Link>
            </div>
          </div>
        </div>

        {/* Columns */}
        <nav className="sf-cols" aria-label="Footer">
          {COLS.map((c, i) => (
            <div key={c.title} className="sf-col">
              <p className="sf-col-title"><b>{String(i + 1).padStart(2, '0')}</b> — {c.title}</p>
              <ul>
                {c.links.map((l) => (
                  <li key={l.href + l.label}><Link href={l.href} className="sf-link"><span>{l.label}</span><Arrow /></Link></li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Contact cards */}
        <div className="sf-contacts">
          <div className="sf-card"><span>Office</span><p>{formatAddress()}</p></div>
          <a className="sf-card" href={phoneTel}><span>Call · Mon–Sat</span><p>{company.phone}</p><Arrow /></a>
          <a className="sf-card" href={`mailto:${company.supportEmail}`}><span>Email</span><p>{company.supportEmail}</p><Arrow /></a>
          <a className="sf-card" href={whatsappLink} target="_blank" rel="noopener noreferrer"><span>WhatsApp</span><p>Chat with our team</p><Arrow /></a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="container sf-bottom">
        <div className="sf-copy">
          <span>© {year} {company.legalName}</span>
          <span className="sf-india"><Tricolour />Made in India</span>
          {company.gstin ? <span>GSTIN {company.gstin}</span> : null}
        </div>
        <div className="sf-legal">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/refund">Refunds</Link>
          <Link href="/shipping">Delivery</Link>
          <button className="sf-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 13V3M4 7l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>

      {/* Dot wordmark — the last thing on the page */}
      <div className="sf-word">
        <DotWord className="sf-word-canvas" />
      </div>
    </footer>
    </>
  )
}
