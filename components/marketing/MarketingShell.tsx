'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import LedgerLogo from '@/components/LedgerLogo'
import VapiAssistant from './VapiAssistant'
import FinalCta from './FinalCta'
import SiteFooter from './SiteFooter'
import SitePreloader from './SitePreloader'
import { DemoModalContext } from './DemoModalContext'
import { company, phoneTel } from '@/lib/company'
import { SEGMENTS, COMPARISONS } from '@/lib/aeo-pages'
import {
  ClipboardIcon, WalletIcon, BoltIcon, DocumentIcon, VideoIcon,
  DashboardIcon, DownloadIcon, ReceiptIcon, ChatIcon, CalculatorIcon,
} from '@/components/icons'

// Demo time slots the customer can request (IST, Mon–Sat).
const DEMO_SLOTS = [
  '10:00 – 11:00 AM', '11:00 AM – 12:00 PM', '12:00 – 1:00 PM',
  '2:00 – 3:00 PM', '3:00 – 4:00 PM', '4:00 – 5:00 PM', '5:00 – 6:00 PM',
]

export default function MarketingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const [drawerOpen, setDrawerOpen]     = useState(false)
  const [userDropOpen, setUserDropOpen] = useState(false)
  const [showBackTop, setShowBackTop]   = useState(false)
  const [showMobCta, setShowMobCta]     = useState(false)
  const [demoOpen, setDemoOpen]         = useState(false)
  const [demoSuccess, setDemoSuccess]   = useState(false)
  const [demoSubmitting, setDemoSubmitting] = useState(false)
  const [demoError, setDemoError]       = useState<string | null>(null)
  const [demoForm, setDemoForm]         = useState({
    name: '', email: '', whatsapp: '', company: '',
    role: 'Principal Architect', teamSize: 'Just me',
    date: '', time: '',
  })

  const initials = session?.user?.name
    ?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? '??'

  // Tool pages render their own <ToolCta> banner, so hide the global CTA there
  // to avoid a duplicate "Book a Free Demo" section.
  const hideGlobalCta = pathname?.startsWith('/tools')

  function openDemo() {
    setDemoSuccess(false); setDemoError(null)
    setDemoForm({ name: '', email: '', whatsapp: '', company: '', role: 'Principal Architect', teamSize: 'Just me', date: '', time: '' })
    setDemoOpen(true); document.body.style.overflow = 'hidden'
  }
  function hideDemo() { setDemoOpen(false); document.body.style.overflow = '' }

  async function submitDemo(e: React.FormEvent) {
    e.preventDefault()
    setDemoSubmitting(true); setDemoError(null)
    try {
      const res  = await fetch('/api/demo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demoForm),
      })
      const data = await res.json()
      if (res.ok) {
        setDemoSuccess(true)
      } else {
        setDemoError(data.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setDemoError('Network error. Please try again or call us directly.')
    } finally {
      setDemoSubmitting(false)
    }
  }

  // Close drawer / dropdown when navigating to a new page
  useEffect(() => { setDrawerOpen(false); setUserDropOpen(false) }, [pathname])

  // ── Global scroll state (navbar elevation, back-to-top, mobile CTA) ──
  useEffect(() => {
    const navbar = document.getElementById('navbar')
    const onScroll = () => {
      navbar?.classList.toggle('elevated', window.scrollY > 8)
      setShowBackTop(window.scrollY > 320)
      setShowMobCta(window.scrollY > 400)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const cursorGlow = document.querySelector<HTMLElement>('.cursor-glow')
    const onMove = (e: MouseEvent) => {
      if (!cursorGlow) return
      cursorGlow.style.left = e.clientX + 'px'
      cursorGlow.style.top  = e.clientY + 'px'
    }
    document.addEventListener('mousemove', onMove)

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') hideDemo() }
    document.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  // ── Per-page reveal / tilt / counter effects (re-run on navigation) ──
  useEffect(() => {
    // Scroll reveal
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target) } })
    }, { threshold: 0.1 })
    document.querySelectorAll('.fade-up').forEach(el => revealObs.observe(el))

    // Smooth scroll for in-page anchors
    const anchorHandlers: Array<[HTMLAnchorElement, (e: Event) => void]> = []
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(link => {
      const handler = (e: Event) => {
        const id = link.getAttribute('href')!
        if (id === '#') return
        const target = document.querySelector(id)
        if (!target) return
        e.preventDefault()
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 76, behavior: 'smooth' })
      }
      link.addEventListener('click', handler)
      anchorHandlers.push([link, handler])
    })

    // 3D card tilt
    document.querySelectorAll<HTMLElement>('.sol-card,.case-card,.pricing-card,.res-tile').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect()
        const rx = ((e.clientY - rect.top) / rect.height - 0.5) * -14
        const ry = ((e.clientX - rect.left) / rect.width - 0.5) * 14
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`
        card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%')
        card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%')
      })
      card.addEventListener('mouseleave', () => { card.style.transform = '' })
    })

    // Magnetic buttons
    document.querySelectorAll<HTMLElement>('.btn-primary,.btn-outline').forEach(btn => {
      if (btn.closest('.modal-form')) return
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect()
        btn.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * 0.22}px, ${(e.clientY - (r.top + r.height / 2)) * 0.22}px)`
      })
      btn.addEventListener('mouseleave', () => { btn.style.transform = '' })
    })

    // Counter animation
    function animateCounter(el: HTMLElement) {
      const target = parseFloat(el.dataset.target || el.textContent!.replace(/[^\d.]/g, ''))
      const suffix = el.dataset.suffix || ''
      const dur = 1800; let start: number | null = null
      function tick(ts: number) {
        if (!start) start = ts
        const progress = Math.min((ts - start) / dur, 1)
        const ease = 1 - Math.pow(1 - progress, 3)
        el.textContent = (Number.isInteger(target) ? Math.round(target * ease) : (target * ease).toFixed(1)) + suffix
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }
    const statObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement
          if (!el.dataset.target) el.dataset.target = el.textContent!.replace(/[^\d.]/g, '')
          animateCounter(el)
          statObs.unobserve(el)
        }
      })
    }, { threshold: 0.5 })
    document.querySelectorAll('.stat-num').forEach(el => statObs.observe(el))

    // Stat ring
    const ringObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const circle = entry.target as SVGCircleElement
        const pct = parseFloat((circle as unknown as HTMLElement).dataset.pct || '0')
        circle.style.strokeDashoffset = String(2 * Math.PI * 36 * (1 - pct / 100))
        ringObs.unobserve(circle)
      })
    }, { threshold: 0.5 })
    document.querySelectorAll('.stat-ring-fg').forEach(c => ringObs.observe(c))

    return () => {
      revealObs.disconnect(); statObs.disconnect(); ringObs.disconnect()
      anchorHandlers.forEach(([link, handler]) => link.removeEventListener('click', handler))
    }
  }, [pathname])

  return (
    <DemoModalContext.Provider value={openDemo}>
      <SitePreloader />
      <div className="noise-overlay" />
      <div className="cursor-glow" />

      {/* ── Navbar ── */}
      <header className="navbar" id="navbar">
        <div className="container nav-wrap">
          <Link href="/" className="nav-logo">
            <LedgerLogo height={40} />
          </Link>

          <nav className="nav-links">
            <div className="nav-item">
              <button className="nav-link">Solutions <span className="nav-chevron">▼</span></button>
              <div className="dropdown">
                <Link href="/solutions#project-mgmt" className="dd-item"><div className="dd-icon ind"><ClipboardIcon size={18} color="#4f46e5" /></div><div><div className="dd-title">Project &amp; Budget Management</div><div className="dd-sub">BOQ, templates, cost tracking</div></div></Link>
                <Link href="/solutions#expense-mgmt" className="dd-item"><div className="dd-icon sky"><WalletIcon size={18} color="#0ea5e9" /></div><div><div className="dd-title">Expense &amp; Finance Tracking</div><div className="dd-sub">Vendor, labour, GST, Tally export</div></div></Link>
                <Link href="/solutions#power-feat" className="dd-item"><div className="dd-icon grn"><BoltIcon size={18} color="#10b981" /></div><div><div className="dd-title">Power Features</div><div className="dd-sub">Search, multi-user, security</div></div></Link>
              </div>
            </div>
            <Link href="/pricing" className="nav-link">Pricing</Link>
            <Link href="/tools" className="nav-link">Free Tools</Link>
            <Link href="/blog" className="nav-link">Blog</Link>
            <Link href="/about" className="nav-link">About Us</Link>
            <div className="nav-item">
              <button className="nav-link">Resources <span className="nav-chevron">▼</span></button>
              <div className="dropdown dropdown-wide">
                <Link href="/tools" className="dd-item"><div className="dd-icon amb"><CalculatorIcon size={18} color="#f59e0b" /></div><div><div className="dd-title">Free Tools &amp; Calculators</div><div className="dd-sub">GST bills, cost &amp; concrete calculators</div></div></Link>
                <Link href="/resources" className="dd-item"><div className="dd-icon ind"><DocumentIcon size={18} color="#4f46e5" /></div><div><div className="dd-title">User Guide</div><div className="dd-sub">Full documentation</div></div></Link>
                <Link href="/resources" className="dd-item"><div className="dd-icon sky"><VideoIcon size={18} color="#0ea5e9" /></div><div><div className="dd-title">Video Tutorials</div><div className="dd-sub">Step-by-step walkthroughs</div></div></Link>
                <Link href="/about" className="dd-item"><div className="dd-icon grn"><DashboardIcon size={18} color="#10b981" /></div><div><div className="dd-title">Case Studies</div><div className="dd-sub">Customer success stories</div></div></Link>
                <Link href="/resources" className="dd-item"><div className="dd-icon amb"><DownloadIcon size={18} color="#f59e0b" /></div><div><div className="dd-title">BOQ Templates</div><div className="dd-sub">Free project templates</div></div></Link>
                <Link href="/resources" className="dd-item"><div className="dd-icon ind"><ReceiptIcon size={18} color="#4f46e5" /></div><div><div className="dd-title">GST Guide</div><div className="dd-sub">GST setup &amp; Tally export</div></div></Link>
                <Link href="/resources" className="dd-item"><div className="dd-icon sky"><ChatIcon size={18} color="#0ea5e9" /></div><div><div className="dd-title">Help Centre</div><div className="dd-sub">FAQs &amp; support</div></div></Link>
              </div>
            </div>
          </nav>

          <div className="nav-right">
            {session ? (
              <div className="user-menu" style={{ display: 'flex' }}>
                <button className="user-avatar-btn" onClick={() => setUserDropOpen(p => !p)}>
                  <div className="user-avatar">{initials}</div>
                  <span className="user-display-name">{session.user.name?.split(' ')[0]}</span>
                  <span className="nav-chevron">▼</span>
                </button>
                {userDropOpen && (
                  <div className="user-dropdown" style={{ display: 'block' }}>
                    <div className="ud-header">
                      <div className="ud-name">{session.user.name}</div>
                      <div className="ud-email">{session.user.email}</div>
                      <div className="ud-company">{session.user.planName ?? 'No Plan'}</div>
                    </div>
                    <div className="ud-divider" />
                    <Link href="/dashboard" className="ud-item">My Dashboard</Link>
                    <Link href="/dashboard/subscription" className="ud-item">My Subscription</Link>
                    <Link href="/dashboard/downloads" className="ud-item">Downloads</Link>
                    <div className="ud-divider" />
                    <button className="ud-signout" onClick={() => signOut({ callbackUrl: '/' })}>Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="nav-signin" style={{ textDecoration: 'none' }}>User Sign In</Link>
            )}
            <Link href="/pricing" className="btn btn-primary btn-sm nav-cta">Let&apos;s Talk</Link>
          </div>

          <button className="hamburger" id="hamburger" aria-label="Open menu" onClick={() => setDrawerOpen(true)}>
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      <div className={`mob-drawer${drawerOpen ? ' open' : ''}`} id="mobDrawer">
        <div className="mob-head">
          <Link href="/" className="nav-logo" style={{ fontSize: '1.1rem' }}>
            <LedgerLogo height={34} />
          </Link>
          <button className="mob-close" onClick={() => setDrawerOpen(false)}>✕</button>
        </div>
        <Link href="/solutions" className="mob-link">Solutions</Link>
        <div className="mob-sub">
          <Link href="/solutions#project-mgmt" className="mob-link">Project &amp; Budget Management</Link>
          <Link href="/solutions#expense-mgmt" className="mob-link">Expense &amp; Finance Tracking</Link>
          <Link href="/solutions#power-feat" className="mob-link">Power Features</Link>
        </div>
        <Link href="/pricing" className="mob-link">Pricing</Link>
        <Link href="/tools" className="mob-link">Free Tools</Link>
        <Link href="/blog" className="mob-link">Blog</Link>
        <Link href="/about" className="mob-link">About Us</Link>
        <Link href="/resources" className="mob-link">Resources</Link>
        <div className="mob-actions">
          {session
            ? <Link href="/dashboard" className="btn btn-outline">My Dashboard</Link>
            : <Link href="/login" className="btn btn-outline" style={{ textDecoration: 'none' }}>User Sign In</Link>}
          <Link href="/pricing" className="btn btn-primary">Let&apos;s Talk</Link>
        </div>
      </div>

      {children}

      {/* ── Closing CTA (site-wide) ── */}
      {!hideGlobalCta && <FinalCta />}

      {/* ── Footer ── */}
      <SiteFooter />

      {/* ── Shared Demo Modal ── */}
      <div className={`modal-overlay${demoOpen ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) hideDemo() }}>
        <div className="modal-box">
          <button className="modal-close" onClick={hideDemo}>✕</button>
          <div className="modal-badge"><BoltIcon size={12} color="#4f46e5" /> Free · No Credit Card</div>
          <h2 className="modal-title">Book Your Free Demo</h2>
          <p className="modal-sub">See ARC PEM live in 20 minutes. We set it up, you watch it work.</p>
          {!demoSuccess ? (
            <div id="demo-form-wrap">
              <form className="modal-form" onSubmit={submitDemo}>
                <div className="mf-2col">
                  <div className="mf-row"><label>Full Name *</label><input type="text" placeholder=" John Doe" required value={demoForm.name} onChange={e => setDemoForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div className="mf-row"><label>WhatsApp Number *</label><input type="tel" placeholder="+91 98765 43210" required value={demoForm.whatsapp} onChange={e => setDemoForm(f => ({ ...f, whatsapp: e.target.value }))} /></div>
                </div>
                <div className="mf-row"><label>Email *</label><input type="email" placeholder="you@company.com" required value={demoForm.email} onChange={e => setDemoForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div className="mf-row"><label>Firm / Company Name</label><input type="text" placeholder="Skyline Constructions pvt ltd" value={demoForm.company} onChange={e => setDemoForm(f => ({ ...f, company: e.target.value }))} /></div>
                <div className="mf-2col">
                  <div className="mf-row"><label>Your Role</label><select value={demoForm.role} onChange={e => setDemoForm(f => ({ ...f, role: e.target.value }))}><option>Principal Architect</option><option>Project Manager</option><option>Accountant / Admin</option><option>Site Engineer</option><option>Owner / Director</option></select></div>
                  <div className="mf-row"><label>Team Size</label><select value={demoForm.teamSize} onChange={e => setDemoForm(f => ({ ...f, teamSize: e.target.value }))}><option>Just me</option><option>2–5 people</option><option>6–20 people</option><option>20+ people</option></select></div>
                </div>
                <div className="mf-2col">
                  <div className="mf-row"><label>Preferred Date *</label><input type="date" required min={new Date().toISOString().slice(0, 10)} value={demoForm.date} onChange={e => setDemoForm(f => ({ ...f, date: e.target.value }))} /></div>
                  <div className="mf-row"><label>Preferred Time *</label><select required value={demoForm.time} onChange={e => setDemoForm(f => ({ ...f, time: e.target.value }))}><option value="">Select a slot</option>{DEMO_SLOTS.map(slot => <option key={slot}>{slot}</option>)}</select></div>
                </div>
                {demoError && <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', borderRadius: '10px', padding: '10px 14px', fontSize: '.8rem', marginBottom: '4px' }}>{demoError}</div>}
                <button type="submit" className="btn btn-primary btn-lg" disabled={demoSubmitting}>{demoSubmitting ? 'Submitting…' : 'Book Free Demo →'}</button>
              </form>
            </div>
          ) : (
            <div className="modal-success">
              <div className="modal-success-icon">
                <svg width="56" height="56" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-6" /></svg>
              </div>
              <h3>You&apos;re all set!</h3>
              <p>Check your email for your demo confirmation — we&apos;ll also reach you on WhatsApp within 2 hours. No spam — ever.</p>
              <div style={{ marginTop: '16px', fontSize: '.8rem', color: 'var(--gray-400)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                Or call us directly: <strong style={{ color: 'var(--navy)' }}>{company.phone}</strong>
              </div>
            </div>
          )}
          <p className="modal-note">Trusted by 30+ construction firms · Fully offline · No internet needed</p>
        </div>
      </div>

      {/* Outside click closes user dropdown */}
      {userDropOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setUserDropOpen(false)} />}

      {/* Sales voice assistant — relevant on demo-focused marketing pages, not on the
          free tool pages where a visitor is mid-calculation, not shopping. */}
      {!pathname.startsWith('/tools') && <VapiAssistant />}

      {/* ── Back to top ── */}
      <button
        className={`back-top${showBackTop ? ' visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        ↑
      </button>

      {/* ── Mobile sticky CTA ── */}
      <div className={`mob-cta-sticky${showMobCta ? ' visible' : ''}`}>
        <Link href="/register" className="btn btn-primary">Get Started Free →</Link>
        <Link href="/pricing" className="btn btn-outline">View Pricing</Link>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DemoModalContext.Provider>
  )
}
