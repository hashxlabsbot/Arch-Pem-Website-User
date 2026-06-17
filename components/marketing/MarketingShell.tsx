'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import LogoMark from '@/components/LogoMark'
import { DemoModalContext } from './DemoModalContext'

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
    name: '', whatsapp: '', company: '',
    role: 'Principal Architect', teamSize: 'Just me',
  })

  const initials = session?.user?.name
    ?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? '??'

  function openDemo() {
    setDemoSuccess(false); setDemoError(null)
    setDemoForm({ name: '', whatsapp: '', company: '', role: 'Principal Architect', teamSize: 'Just me' })
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
      <div className="noise-overlay" />
      <div className="cursor-glow" />

      {/* ── Announcement Bar ── */}
      <div className="ann-bar">
        <span className="ann-pill">New</span>
        🚀 &nbsp;Introducing ARC PEM v2.0 — AI-assisted GST reconciliation &amp; cross-project Tally export is now live.
        <Link href="/solutions">Check Now →</Link>
      </div>

      {/* ── Navbar ── */}
      <header className="navbar" id="navbar">
        <div className="container nav-wrap">
          <Link href="/" className="nav-logo">
            <LogoMark size={32} />
            ARC <span style={{ color: 'var(--indigo)' }}>PEM</span>
          </Link>

          <nav className="nav-links">
            <div className="nav-item">
              <button className="nav-link">Solutions <span className="nav-chevron">▼</span></button>
              <div className="dropdown">
                <Link href="/solutions#project-mgmt" className="dd-item"><div className="dd-icon ind">📋</div><div><div className="dd-title">Project &amp; Budget Management</div><div className="dd-sub">BOQ, templates, cost tracking</div></div></Link>
                <Link href="/solutions#expense-mgmt" className="dd-item"><div className="dd-icon sky">💰</div><div><div className="dd-title">Expense &amp; Finance Tracking</div><div className="dd-sub">Vendor, labour, GST, Tally export</div></div></Link>
                <Link href="/solutions#power-feat" className="dd-item"><div className="dd-icon grn">⚡</div><div><div className="dd-title">Power Features</div><div className="dd-sub">Search, multi-user, security</div></div></Link>
              </div>
            </div>
            <Link href="/pricing" className="nav-link">Pricing</Link>
            <Link href="/about" className="nav-link">About Us</Link>
            <div className="nav-item">
              <button className="nav-link">Resources <span className="nav-chevron">▼</span></button>
              <div className="dropdown dropdown-wide">
                <Link href="/resources" className="dd-item"><div className="dd-icon ind">📝</div><div><div className="dd-title">User Guide</div><div className="dd-sub">Full documentation</div></div></Link>
                <Link href="/resources" className="dd-item"><div className="dd-icon sky">📹</div><div><div className="dd-title">Video Tutorials</div><div className="dd-sub">Step-by-step walkthroughs</div></div></Link>
                <Link href="/about" className="dd-item"><div className="dd-icon grn">📊</div><div><div className="dd-title">Case Studies</div><div className="dd-sub">Customer success stories</div></div></Link>
                <Link href="/resources" className="dd-item"><div className="dd-icon amb">📥</div><div><div className="dd-title">BOQ Templates</div><div className="dd-sub">Free project templates</div></div></Link>
                <Link href="/resources" className="dd-item"><div className="dd-icon ind">🧾</div><div><div className="dd-title">GST Guide</div><div className="dd-sub">GST setup &amp; Tally export</div></div></Link>
                <Link href="/resources" className="dd-item"><div className="dd-icon sky">💬</div><div><div className="dd-title">Help Centre</div><div className="dd-sub">FAQs &amp; support</div></div></Link>
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
                      <div className="ud-company">{session.user.planName ?? 'Free Trial'}</div>
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
            <LogoMark size={30} />
            ARC <span style={{ color: 'var(--indigo)' }}>PEM</span>
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

      {/* ── CTA Section — Premium Gradient Mesh ── */}
      <div className="cta-premium">
        {/* Animated background orbs */}
        <div className="cta-orb cta-orb-1" />
        <div className="cta-orb cta-orb-2" />
        <div className="cta-orb cta-orb-3" />
        <div className="cta-mesh-grid" />

        <div className="container cta-inner">
          <div className="cta-badge-row">
            <span className="cta-badge">🚀 Free Demo · No Credit Card Required</span>
          </div>
          <h2 className="cta-headline">
            Ready to Take Control of<br />
            <span className="cta-gradient-text">Your Project Finances?</span>
          </h2>
          <p className="cta-sub">
            Join 30+ architecture and construction firms already using ARC PEM to track budgets, manage vendors, and generate professional reports — without a single spreadsheet.
          </p>
          <div className="cta-actions">
            <button className="cta-btn-primary" onClick={openDemo}>
              <span>Talk to an Expert</span>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
            <Link href="/pricing" className="cta-btn-secondary">
              <span>Book Free Demo</span>
            </Link>
          </div>
          <div className="cta-trust-strip">
            <div className="cta-trust-item">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              <span>Bank-grade Security</span>
            </div>
            <div className="cta-trust-divider" />
            <div className="cta-trust-item">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span>Works 100% Offline</span>
            </div>
            <div className="cta-trust-divider" />
            <div className="cta-trust-item">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <span>+91-8810235570</span>
            </div>
            <div className="cta-trust-divider" />
            <div className="cta-trust-item">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <span>hashxlabs.info@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="footer-v2">
        <div className="container">
          {/* Top: brand + columns */}
          <div className="fv2-top">
            <div className="fv2-brand">
              <div className="fv2-logo">
                <LogoMark size={30} />
                <span className="fv2-logo-text">ARC <span style={{ color: 'var(--indigo)' }}>PEM</span></span>
              </div>
              <p className="fv2-tagline">Project expense management software built for Indian architecture consultancies and construction firms.</p>
              <div className="fv2-newsletter">
                <div className="fv2-nl-label">Stay in the loop</div>
                <form className="fv2-nl-form" onSubmit={e => e.preventDefault()}>
                  <input type="email" placeholder="your@email.com" className="fv2-nl-input" />
                  <button type="submit" className="fv2-nl-btn">→</button>
                </form>
              </div>
              <div className="fv2-socials">
                <a href="#" className="fv2-soc" title="LinkedIn" aria-label="LinkedIn">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="#" className="fv2-soc" title="Twitter / X" aria-label="Twitter">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" className="fv2-soc" title="YouTube" aria-label="YouTube">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="mailto:hashxlabs.info@gmail.com" className="fv2-soc" title="Email" aria-label="Email">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </a>
              </div>
            </div>

            <div className="fv2-cols">
              <div className="fv2-col">
                <h4 className="fv2-col-title">Solutions</h4>
                <Link href="/solutions#project-mgmt" className="fv2-link">Project &amp; Budget Management</Link>
                <Link href="/solutions#expense-mgmt" className="fv2-link">Expense &amp; Finance Tracking</Link>
                <Link href="/solutions#power-feat" className="fv2-link">Power Features</Link>
                <Link href="/pricing" className="fv2-link">Pricing</Link>
              </div>
              <div className="fv2-col">
                <h4 className="fv2-col-title">Company</h4>
                <Link href="/about" className="fv2-link">About Us</Link>
                <Link href="/resources" className="fv2-link">Blog</Link>
                <Link href="/resources" className="fv2-link">Help Centre</Link>
                <Link href="/resources" className="fv2-link">Product Updates</Link>
                <Link href="/dashboard/downloads" className="fv2-link">Download App</Link>
              </div>
              <div className="fv2-col">
                <h4 className="fv2-col-title">Resources</h4>
                <Link href="/resources" className="fv2-link">User Guide (PDF)</Link>
                <Link href="/resources" className="fv2-link">BOQ Templates</Link>
                <Link href="/resources" className="fv2-link">GST Export Guide</Link>
                <Link href="/resources" className="fv2-link">Tally Integration</Link>
                <a href="mailto:hashxlabs.info@gmail.com" className="fv2-link">Contact Sales</a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="fv2-bottom">
            <div className="fv2-copy">
              <span>© 2026 HashX Labs. All rights reserved.</span>
              <span className="fv2-india-badge">🇮🇳 Made with ♥ in India</span>
            </div>
            <div className="fv2-legal">
              <a href="#">Privacy Policy</a>
              <span className="fv2-dot">·</span>
              <a href="#">Terms of Service</a>
              <span className="fv2-dot">·</span>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Shared Demo Modal ── */}
      <div className={`modal-overlay${demoOpen ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) hideDemo() }}>
        <div className="modal-box">
          <button className="modal-close" onClick={hideDemo}>✕</button>
          <div className="modal-badge">⚡ Free · No Credit Card</div>
          <h2 className="modal-title">Book Your Free Demo</h2>
          <p className="modal-sub">See ARC PEM live in 20 minutes. We set it up, you watch it work.</p>
          {!demoSuccess ? (
            <div id="demo-form-wrap">
              <form className="modal-form" onSubmit={submitDemo}>
                <div className="mf-2col">
                  <div className="mf-row"><label>Full Name *</label><input type="text" placeholder="Rahul Vashisth" required value={demoForm.name} onChange={e => setDemoForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div className="mf-row"><label>WhatsApp Number *</label><input type="tel" placeholder="+91 98765 43210" required value={demoForm.whatsapp} onChange={e => setDemoForm(f => ({ ...f, whatsapp: e.target.value }))} /></div>
                </div>
                <div className="mf-row"><label>Firm / Company Name</label><input type="text" placeholder="Skyline Architects" value={demoForm.company} onChange={e => setDemoForm(f => ({ ...f, company: e.target.value }))} /></div>
                <div className="mf-2col">
                  <div className="mf-row"><label>Your Role</label><select value={demoForm.role} onChange={e => setDemoForm(f => ({ ...f, role: e.target.value }))}><option>Principal Architect</option><option>Project Manager</option><option>Accountant / Admin</option><option>Site Engineer</option><option>Owner / Director</option></select></div>
                  <div className="mf-row"><label>Team Size</label><select value={demoForm.teamSize} onChange={e => setDemoForm(f => ({ ...f, teamSize: e.target.value }))}><option>Just me</option><option>2–5 people</option><option>6–20 people</option><option>20+ people</option></select></div>
                </div>
                {demoError && <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', borderRadius: '10px', padding: '10px 14px', fontSize: '.8rem', marginBottom: '4px' }}>{demoError}</div>}
                <button type="submit" className="btn btn-primary btn-lg" disabled={demoSubmitting}>{demoSubmitting ? 'Submitting…' : 'Book Free Demo →'}</button>
              </form>
            </div>
          ) : (
            <div className="modal-success">
              <div className="modal-success-icon">✅</div>
              <h3>You&apos;re all set!</h3>
              <p>We&apos;ll reach you on WhatsApp within 2 hours to schedule your demo. No spam — ever.</p>
              <div style={{ marginTop: '16px', fontSize: '.8rem', color: 'var(--gray-400)' }}>📞 Or call us directly: <strong style={{ color: 'var(--navy)' }}>+91-8810235570</strong></div>
            </div>
          )}
          <p className="modal-note">Trusted by 30+ construction firms · Fully offline · No internet needed</p>
        </div>
      </div>

      {/* Outside click closes user dropdown */}
      {userDropOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setUserDropOpen(false)} />}

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
