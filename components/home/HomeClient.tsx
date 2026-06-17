'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LogoMark from '@/components/LogoMark'

export default function HomeClient() {
  const router = useRouter()
  const { data: session } = useSession()

  // ── State ────────────────────────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen]       = useState(false)
  const [userDropOpen, setUserDropOpen]   = useState(false)
  const [activePane, setActivePane]       = useState('pane-dashboard')
  const [demoSuccess, setDemoSuccess]     = useState(false)
  const [openModal, setOpenModal]         = useState<string | null>(null)
  const [showBackTop, setShowBackTop]     = useState(false)
  const [showMobCta, setShowMobCta]       = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const initials = session?.user?.name
    ?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? '??'

  function openSignupWithPlan(planName: string) {
    router.push(`/register?plan=${planName}`)
  }

  function showModal(id: string) { setOpenModal(id); document.body.style.overflow = 'hidden' }
  function hideModal()           { setOpenModal(null); document.body.style.overflow = '' }

  // ── Effects ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Navbar elevation + back-to-top + mobile CTA visibility
    const navbar = document.getElementById('navbar')
    const onScroll = () => {
      navbar?.classList.toggle('elevated', window.scrollY > 8)
      setShowBackTop(window.scrollY > 320)
      setShowMobCta(window.scrollY > 400)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Scroll reveal
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target) } })
    }, { threshold: 0.1 })
    document.querySelectorAll('.fade-up').forEach(el => revealObs.observe(el))

    // Smooth scroll
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const id = link.getAttribute('href')!
        if (id === '#') return
        const target = document.querySelector(id)
        if (!target) return
        e.preventDefault()
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 76, behavior: 'smooth' })
      })
    })

    // Resource tile ripple
    document.querySelectorAll<HTMLElement>('.res-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        tile.style.transform = 'scale(0.97)'
        setTimeout(() => { tile.style.transform = '' }, 150)
      })
    })

    // Cursor glow
    const cursorGlow = document.querySelector<HTMLElement>('.cursor-glow')
    if (cursorGlow) {
      document.addEventListener('mousemove', e => {
        cursorGlow.style.left = e.clientX + 'px'
        cursorGlow.style.top  = e.clientY + 'px'
      })
    }

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

    // Escape key closes modals
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') hideModal() }
    document.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('scroll', onScroll)
      revealObs.disconnect(); statObs.disconnect(); ringObs.disconnect()
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  // ── Particle canvas ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let W = 0, H = 0, mouseX = -1000, mouseY = -1000
    let animId: number

    function resize() {
      W = canvas!.width  = canvas!.offsetWidth
      H = canvas!.height = canvas!.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const hero = canvas.closest('.hero')
    hero?.addEventListener('mousemove', (e: Event) => {
      const me = e as MouseEvent
      const r = canvas!.getBoundingClientRect()
      mouseX = me.clientX - r.left; mouseY = me.clientY - r.top
    })
    hero?.addEventListener('mouseleave', () => { mouseX = mouseY = -1000 })

    class Particle {
      x = 0; y = 0; vx = 0; vy = 0; r = 0; alpha = 0; pulse = 0
      constructor() { this.reset(true) }
      reset(init: boolean) {
        this.x     = Math.random() * W
        this.y     = init ? Math.random() * H : (Math.random() > 0.5 ? -4 : H + 4)
        this.vx    = (Math.random() - 0.5) * 0.45
        this.vy    = (Math.random() - 0.5) * 0.45
        this.r     = Math.random() * 1.4 + 0.4
        this.alpha = Math.random() * 0.22 + 0.06
        this.pulse = Math.random() * Math.PI * 2
      }
      update() {
        this.pulse += 0.018
        const dx = this.x - mouseX, dy = this.y - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) {
          const force = (120 - dist) / 120 * 0.6
          this.vx += (dx / dist) * force * 0.04
          this.vy += (dy / dist) * force * 0.04
        }
        this.vx *= 0.98; this.vy *= 0.98
        this.x += this.vx; this.y += this.vy
        if (this.x < -10 || this.x > W + 10 || this.y < -10 || this.y > H + 10) this.reset(false)
      }
      draw() {
        const a = this.alpha * (0.75 + 0.25 * Math.sin(this.pulse))
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(99,102,241,${a})`; ctx.fill()
      }
    }

    const particles = Array.from({ length: 140 }, () => new Particle())

    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y
          const d2 = dx * dx + dy * dy
          if (d2 < 9000) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(99,102,241,${0.045 * (1 - d2 / 9000)})`; ctx.lineWidth = 0.5; ctx.stroke()
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => { p.update(); p.draw() })
      drawLines()
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="noise-overlay" />
      <div className="cursor-glow" />

      {/* ── Announcement Bar ── */}
      <div className="ann-bar">
        <span className="ann-pill">New</span>
        🚀 &nbsp;Introducing ARC PEM v2.0 — AI-assisted GST reconciliation &amp; cross-project Tally export is now live.
        <a href="#features">Check Now →</a>
      </div>

      {/* ── Navbar ── */}
      <header className="navbar" id="navbar">
        <div className="container nav-wrap">
          <a href="/" className="nav-logo">
            <LogoMark size={32} />
            ARC <span style={{ color: 'var(--indigo)' }}>PEM</span>
          </a>

          <nav className="nav-links">
            <div className="nav-item">
              <button className="nav-link">Solutions <span className="nav-chevron">▼</span></button>
              <div className="dropdown">
                <a href="#project-mgmt" className="dd-item"><div className="dd-icon ind">📋</div><div><div className="dd-title">Project &amp; Budget Management</div><div className="dd-sub">BOQ, templates, cost tracking</div></div></a>
                <a href="#expense-mgmt" className="dd-item"><div className="dd-icon sky">💰</div><div><div className="dd-title">Expense &amp; Finance Tracking</div><div className="dd-sub">Vendor, labour, GST, Tally export</div></div></a>
                <a href="#power-feat" className="dd-item"><div className="dd-icon grn">⚡</div><div><div className="dd-title">Power Features</div><div className="dd-sub">Search, multi-user, security</div></div></a>
              </div>
            </div>
            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#about" className="nav-link">About Us</a>
            <div className="nav-item">
              <button className="nav-link">Resources <span className="nav-chevron">▼</span></button>
              <div className="dropdown dropdown-wide">
                <a href="#" className="dd-item"><div className="dd-icon ind">📝</div><div><div className="dd-title">User Guide</div><div className="dd-sub">Full documentation</div></div></a>
                <a href="#" className="dd-item"><div className="dd-icon sky">📹</div><div><div className="dd-title">Video Tutorials</div><div className="dd-sub">Step-by-step walkthroughs</div></div></a>
                <a href="#testimonials" className="dd-item"><div className="dd-icon grn">📊</div><div><div className="dd-title">Case Studies</div><div className="dd-sub">Customer success stories</div></div></a>
                <a href="#" className="dd-item"><div className="dd-icon amb">📥</div><div><div className="dd-title">BOQ Templates</div><div className="dd-sub">Free project templates</div></div></a>
                <a href="#" className="dd-item"><div className="dd-icon ind">🧾</div><div><div className="dd-title">GST Guide</div><div className="dd-sub">GST setup &amp; Tally export</div></div></a>
                <a href="#" className="dd-item"><div className="dd-icon sky">💬</div><div><div className="dd-title">Help Centre</div><div className="dd-sub">FAQs &amp; support</div></div></a>
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
                    <a href="/dashboard" className="ud-item">My Dashboard</a>
                    <a href="/dashboard/subscription" className="ud-item">My Subscription</a>
                    <a href="/dashboard/downloads" className="ud-item">Downloads</a>
                    <div className="ud-divider" />
                    <button className="ud-signout" onClick={() => signOut({ callbackUrl: '/' })}>Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <a href="/login" className="nav-signin" style={{ textDecoration: 'none' }}>User Sign In</a>
            )}
            <a href="#pricing" className="btn btn-primary btn-sm nav-cta">Let&apos;s Talk</a>
          </div>

          <button className="hamburger" id="hamburger" aria-label="Open menu" onClick={() => setDrawerOpen(true)}>
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      <div className={`mob-drawer${drawerOpen ? ' open' : ''}`} id="mobDrawer">
        <div className="mob-head">
          <a href="/" className="nav-logo" style={{ fontSize: '1.1rem' }}>
            <LogoMark size={30} />
            ARC <span style={{ color: 'var(--indigo)' }}>PEM</span>
          </a>
          <button className="mob-close" onClick={() => setDrawerOpen(false)}>✕</button>
        </div>
        <a href="#features" className="mob-link" onClick={() => setDrawerOpen(false)}>Solutions</a>
        <div className="mob-sub">
          <a href="#project-mgmt" className="mob-link" onClick={() => setDrawerOpen(false)}>Project &amp; Budget Management</a>
          <a href="#expense-mgmt" className="mob-link" onClick={() => setDrawerOpen(false)}>Expense &amp; Finance Tracking</a>
          <a href="#power-feat" className="mob-link" onClick={() => setDrawerOpen(false)}>Power Features</a>
        </div>
        <a href="#pricing" className="mob-link" onClick={() => setDrawerOpen(false)}>Pricing</a>
        <a href="#about" className="mob-link" onClick={() => setDrawerOpen(false)}>About Us</a>
        <a href="#" className="mob-link">Resources</a>
        <div className="mob-actions">
          {session
            ? <a href="/dashboard" className="btn btn-outline">My Dashboard</a>
            : <a href="/login" className="btn btn-outline" style={{ textDecoration: 'none' }}>User Sign In</a>}
          <a href="#pricing" className="btn btn-primary" onClick={() => setDrawerOpen(false)}>Let&apos;s Talk</a>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="hero">
        <canvas id="particle-canvas" ref={canvasRef} />
        <div className="hero-pgrid" />
        <div className="container hero-inner">
          <div className="hero-left">
            <div className="hero-tag">🏗️ &nbsp;Built for Indian Architects &amp; Builders</div>
            <h1>
              India&apos;s Complete<br />
              <span className="hi">Construction Finance</span><br />
              Platform
            </h1>
            <p className="hero-sub">
              ARC PEM unifies BOQ, vendor bills, labour tracking, contractor ledgers and GST into one offline desktop platform — built specifically for Indian construction firms.
            </p>
            <div className="hero-ctas">
              <button className="btn btn-primary btn-lg" onClick={() => showModal('demo-modal')}>Talk to an Expert</button>
              <button className="btn btn-outline btn-lg" onClick={() => showModal('demo-modal')}>Book Free Demo</button>
            </div>
            <div className="hero-trust">
              <p className="hero-trust-label">Trusted by 30+ construction &amp; architecture teams</p>
              <div className="hero-trust-logos">
                <span className="htl">Skyline Architects</span>
                <span className="htl">BuildRight Infra</span>
                <span className="htl">DesignCraft</span>
                <span className="htl">Vertex Constructions</span>
                <span className="htl">MetroSpace MEP</span>
              </div>
            </div>
          </div>

          {/* Hero right — App window mockup */}
          <div className="hero-right">
            <div style={{ position: 'relative' }}>
              <div className="app-window">
                <div className="win-bar">
                  <div className="win-dot" /><div className="win-dot" /><div className="win-dot" />
                  <div className="win-url">🔒 archpem.app/dashboard</div>
                </div>
                <div className="win-body">
                  {/* Sidebar */}
                  <div className="win-side">
                    <div className="ws-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', padding: '6px 10px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="26" height="26" viewBox="0 0 44 44" fill="none"><rect width="44" height="44" rx="11" fill="#3b82f6" /><path d="M11 34 L11 21 Q11 8 22 8 Q33 8 33 21 L33 34" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" /><line x1="7" y1="34" x2="37" y2="34" stroke="white" strokeWidth="4" strokeLinecap="round" /></svg>
                        <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: '0.82rem', color: 'white' }}>ARC PEM</span>
                      </div>
                      <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginLeft: '2px' }}>Project Expense Manager</span>
                    </div>
                    <div className="ws-section">Main</div>
                    {[
                      { id: 'pane-dashboard', icon: '📊', label: 'Dashboard' },
                      { id: 'pane-projects',  icon: '📁', label: 'Projects'  },
                      { id: 'pane-expenses',  icon: '💰', label: 'Expenses'  },
                    ].map(({ id, icon, label }) => (
                      <div
                        key={id}
                        className={`ws-item${activePane === id ? ' active' : ''}`}
                        onClick={() => setActivePane(id)}
                      >
                        <span className="ico">{icon}</span>{label}
                      </div>
                    ))}
                    <div className="ws-section">Reports</div>
                    {[
                      { id: 'pane-pending', icon: '⏳', label: 'Pending Payments' },
                      { id: 'pane-gst',     icon: '🧾', label: 'GST Report'       },
                      { id: 'pane-summary', icon: '📑', label: 'Summary Sheet'    },
                    ].map(({ id, icon, label }) => (
                      <div key={id} className={`ws-item${activePane === id ? ' active' : ''}`} onClick={() => setActivePane(id)}>
                        <span className="ico">{icon}</span>{label}
                      </div>
                    ))}
                    <div className="ws-section">Directory</div>
                    <div className={`ws-item${activePane === 'pane-vendors' ? ' active' : ''}`} onClick={() => setActivePane('pane-vendors')}>
                      <span className="ico">👥</span>Party Directory
                    </div>
                    <div className="ws-item"><span className="ico">⚙️</span>Settings</div>
                    <div style={{ marginTop: 'auto', padding: '10px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '8px', fontSize: '0.65rem', color: '#93c5fd', textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>100% Offline</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>All data stored locally.</div>
                    </div>
                  </div>
                  {/* Main area */}
                  <div className="win-main">
                    {/* Dashboard Pane */}
                    <div id="pane-dashboard" className={`app-pane${activePane === 'pane-dashboard' ? ' active' : ''}`} style={{ display: activePane === 'pane-dashboard' ? 'flex' : 'none' }}>
                      <div className="win-topbar">
                        <span className="wt-title" style={{ whiteSpace: 'nowrap' }}>Dashboard</span>
                        <div className="wt-actions" style={{ flexShrink: 0 }}>
                          <button className="wt-btn sec" style={{ whiteSpace: 'nowrap', fontSize: '.62rem', padding: '4px 8px' }}>⌘K</button>
                          <button className="wt-btn prim" style={{ whiteSpace: 'nowrap', fontSize: '.62rem', padding: '4px 8px' }}>+ New</button>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px', padding: '10px 12px 0', flexShrink: 0 }}>
                        {[['Projects','3','Active'],['Expenses','₹82.4L g','Jun 2026'],['GST','₹1,05,268','Jun 2026'],['Pending','₹24.86L a','5 dues']].map(([lbl,val,chg],i) => (
                          <div key={i} className="ws-card" style={{ padding: '8px 9px' }}>
                            <div className="ws-card-lbl" style={{ fontSize: '.52rem', whiteSpace: 'nowrap' }}>{lbl}</div>
                            <div className={`ws-card-val${val.endsWith('g') ? ' g' : val.endsWith('a') ? ' a' : ''}`} style={{ fontSize: '.88rem', color: lbl==='GST' ? 'var(--indigo)' : undefined }}>{val.replace(/[ga]$/,'')}</div>
                            <div className="ws-card-chg" style={{ fontSize: '.52rem', whiteSpace: 'nowrap', color: lbl==='Pending' ? 'var(--amber)' : undefined }}>{chg}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', padding: '8px 12px 0', flexShrink: 0 }}>
                        <div className="wc-card" style={{ padding: '10px 12px', overflow: 'hidden' }}>
                          <div className="wc-head"><span className="wc-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Expense Distribution</span><span className="wc-sub" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>May–Jun 2026</span></div>
                          <div className="wc-bars" style={{ height: '55px' }}>
                            {[30,44,38,56,94,100].map((h,i) => <div key={i} className={`wc-bar${h>80?' hi':''}`} style={{ height: `${h}%` }} />)}
                          </div>
                          <div className="wc-months">{['Jan','Feb','Mar','Apr','May','Jun'].map(m=><div key={m} className="wc-month">{m}</div>)}</div>
                        </div>
                        <div className="wc-card" style={{ padding: '8px 12px', minWidth: '130px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--gray-500)', marginBottom: '6px' }}>By Project</div>
                          <div className="dash-donut dash-donut-proj" style={{ margin: '0 auto 8px' }} />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {[['#3b82f6','50 CS','39%'],['#0ea5e9','41A Cafe','27%'],['#10b981','Resident Villa','34%']].map(([color,label,pct])=>(
                              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.58rem', color: '#334155' }}>
                                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, flexShrink: 0 }} /><span>{label}</span><span style={{ marginLeft: 'auto', fontWeight: 700 }}>{pct}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="win-table" style={{ padding: '8px 14px 10px' }}>
                        <div className="wt-card">
                          <div className="wt-head" style={{ gridTemplateColumns: '2fr 1fr 1fr 56px' }}>
                            {['Project','Expenses','Last Entry','Status'].map(h=><div key={h} className="wt-th" style={{ whiteSpace: 'nowrap' }}>{h}</div>)}
                          </div>
                          {[
                            ['Resident Villa','M.K Thakur · Delhi','₹28,42,500','13-Jun-26'],
                            ['41A Cafe','Rahul · Omax','₹22,18,640','09-May-26'],
                            ['50 CS','Ankit · NIT Faridabad','₹31,82,760','07-May-26'],
                          ].map(([name,city,amt,date])=>(
                            <div key={name} className="wt-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 56px' }}>
                              <div><div className="wt-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div><div className="wt-city" style={{ whiteSpace: 'nowrap' }}>{city}</div></div>
                              <div className="wt-amt" style={{ color: 'var(--indigo)', whiteSpace: 'nowrap' }}>{amt}</div>
                              <div className="wt-city" style={{ whiteSpace: 'nowrap' }}>{date}</div>
                              <div><span className="wt-tag tag-a">Active</span></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Projects Pane */}
                    <div id="pane-projects" className={`app-pane${activePane === 'pane-projects' ? ' active' : ''}`} style={{ display: activePane === 'pane-projects' ? 'flex' : 'none', padding: 0, background: '#f8fafc' }}>
                      <div style={{ background: 'linear-gradient(135deg,#2563eb,#3b82f6)', padding: '12px 16px 14px', flexShrink: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <div><div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: '.88rem', color: 'white' }}>Projects</div><div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.6)', marginTop: '1px' }}>Active 3 · On Hold 0 · Completed 0</div></div>
                          <button className="wt-btn" style={{ background: 'rgba(255,255,255,.15)', color: 'white', border: '1px solid rgba(255,255,255,.25)', fontSize: '.65rem' }}>+ New Project</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                          {[['Projects','3 Active','white'],['Total Expenses','₹7,66,294','#a5f3d0'],['Latest Entry','13-Jun-2026','#fde68a']].map(([lbl,val,color])=>(
                            <div key={lbl} style={{ background: 'rgba(255,255,255,.1)', borderRadius: '8px', padding: '7px 9px', backdropFilter: 'blur(8px)' }}>
                              <div style={{ fontSize: '.55rem', color: 'rgba(255,255,255,.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{lbl}</div>
                              <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: '.85rem', color, marginTop: '2px' }}>{val}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                          { id: '403_B', name: 'Resident Villa', client: 'M.K Thakur · Delhi-101110', amt: '₹28,42,500', pct: 82 },
                          { id: '41A',   name: 'Cafe',           client: 'Client: Rahul · Omax',       amt: '₹22,18,640', pct: 58 },
                          { id: '50',    name: 'CS',             client: 'Client: Ankit · NIT Faridabad', amt: '₹31,82,760', pct: 65 },
                        ].map(p => (
                          <div key={p.id} className="proj-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <div style={{ background: '#eff6ff', color: '#2563eb', borderRadius: '7px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '.75rem' }}>📁</div>
                                <div>
                                  <div style={{ fontSize: '.5rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '.06em' }}>{p.id}</div>
                                  <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: '.78rem', color: '#0f172a' }}>{p.name}</div>
                                  <div style={{ fontSize: '.6rem', color: '#64748b', marginTop: '1px' }}>{p.client}</div>
                                </div>
                              </div>
                              <span className="wt-tag tag-a" style={{ fontSize: '.56rem' }}>Active</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div><div style={{ fontSize: '.55rem', color: '#64748b', fontWeight: 600, marginBottom: '2px' }}>Total Expenses</div><div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: '.82rem', color: '#2563eb' }}>{p.amt}</div></div>
                            </div>
                            <div style={{ marginTop: '8px', height: '4px', background: '#e2e8f0', borderRadius: '100px', overflow: 'hidden' }}>
                              <div style={{ width: `${p.pct}%`, height: '100%', background: 'linear-gradient(to right,#3b82f6,#93c5fd)', borderRadius: '100px' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expenses Pane */}
                    <div id="pane-expenses" className={`app-pane${activePane === 'pane-expenses' ? ' active' : ''}`} style={{ display: activePane === 'pane-expenses' ? 'flex' : 'none', padding: '14px' }}>
                      <div className="win-topbar" style={{ margin: '-14px -14px 14px', flexShrink: 0 }}>
                        <span className="wt-title">Expenses</span>
                        <div className="wt-actions"><button className="wt-btn sec">Filter</button><button className="wt-btn prim">+ Add Expense</button></div>
                      </div>
                      <div style={{ flex: 1, overflowY: 'auto' }}>
                        {[
                          { dot: 'v', name: 'Shree Cement Ltd.', sub: 'Invoice #4021 - Today',    amt: '₹3,85,000',  status: 'paid'    },
                          { dot: 'l', name: 'Weekly Labour Payment', sub: 'Site A - Yesterday',   amt: '₹1,24,800',  status: 'paid'    },
                          { dot: 's', name: 'Site Safety Gear',  sub: 'Hardware Store - 2 days',  amt: '₹42,500',  status: 'pending' },
                          { dot: 'v', name: 'Ultratech Concrete', sub: 'Invoice #912 - 3 days',   amt: '₹8,90,000', status: 'pending' },
                        ].map(r => (
                          <div key={r.name} className="exp-row">
                            <div className={`exp-dot ${r.dot}`} />
                            <div className="exp-name">{r.name}<div className="exp-date">{r.sub}</div></div>
                            <div className="exp-amt">{r.amt}</div>
                            <div className={`exp-status es-${r.status}`}>{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Vendors Pane */}
                    <div id="pane-vendors" className={`app-pane${activePane === 'pane-vendors' ? ' active' : ''}`} style={{ display: activePane === 'pane-vendors' ? 'flex' : 'none', padding: '14px' }}>
                      <div className="win-topbar" style={{ margin: '-14px -14px 14px', flexShrink: 0 }}><span className="wt-title">Vendors</span><div className="wt-actions"><button className="wt-btn prim">+ Add Vendor</button></div></div>
                      <div className="win-table" style={{ flex: 1, padding: 0, overflowY: 'auto' }}>
                        <div className="wt-card">
                          <div className="wt-head">{['Vendor Name','Category','Paid','Pending'].map(h=><div key={h} className="wt-th">{h}</div>)}</div>
                          {[['Shree Cement Ltd.','+91 98765 43210','Materials','₹2.4L','₹45K'],['R.K. Hardware','+91 91234 56780','Hardware','₹80K','₹0'],['Praveen Electricals','+91 99887 76655','Electrical','₹1.1L','₹12K']].map(([name,phone,cat,paid,pend])=>(
                            <div key={name} className="wt-row">
                              <div><div className="wt-name">{name}</div><div className="wt-city">{phone}</div></div>
                              <div className="wt-city">{cat}</div><div className="wt-amt">{paid}</div>
                              <div className="wt-amt" style={{ color: pend==='₹0'?undefined:'var(--amber)' }}>{pend}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* GST Pane (simplified) */}
                    <div id="pane-gst" className={`app-pane${activePane === 'pane-gst' ? ' active' : ''}`} style={{ display: activePane === 'pane-gst' ? 'flex' : 'none', flexDirection: 'column', overflow: 'hidden', background: '#f8fafc' }}>
                      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '9px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                        <div><div style={{ fontFamily: "'Poppins',sans-serif", fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>GST Purchase Sheet</div><div style={{ fontSize: '0.58rem', color: '#64748b' }}>Monthly · share with CA for filing</div></div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {['🖨️ Print','📄 PDF','📊 Excel'].map(b=><button key={b} className="rep-btn" style={{ padding: '4px 7px', fontSize: '0.58rem' }}>{b}</button>)}
                        </div>
                      </div>
                      <div style={{ flex: 1, overflow: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                          {[['Total Taxable','Rs.5,84,820','#0f172a'],['Total GST','Rs.1,05,268','#2563eb'],['Net Amount','Rs.6,90,088','#16a34a']].map(([lbl,val,color])=>(
                            <div key={lbl} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px' }}>
                              <div style={{ fontSize: '0.52rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: '1.3' }}>{lbl}</div>
                              <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: '0.72rem', fontWeight: 800, color, marginTop: '3px' }}>{val}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', fontSize: '0.6rem', color: '#64748b' }}>
                          GST detail table — June 2026 · All Projects · 4 entries · Total GST: Rs.1,05,268
                        </div>
                      </div>
                    </div>

                    {/* Pending Pane (simplified) */}
                    <div id="pane-pending" className={`app-pane${activePane === 'pane-pending' ? ' active' : ''}`} style={{ display: activePane === 'pane-pending' ? 'flex' : 'none', flexDirection: 'column', padding: '16px', overflow: 'auto', background: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexShrink: 0 }}>
                        <div><div style={{ fontFamily: "'Poppins',sans-serif", fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Pending Payments</div><div style={{ fontSize: '0.6rem', color: '#64748b' }}>All unpaid bills · oldest first</div></div>
                        <button className="rep-btn" style={{ flexShrink: 0, fontSize: '0.6rem', padding: '4px 8px' }}>📊 Export</button>
                      </div>
                      <div className="warning-banner" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '10px 14px', marginBottom: '14px' }}>
                        <span style={{ fontSize: '1.1rem', color: '#f59e0b' }}>⚠️</span>
                        <div><div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400e' }}>Rs.24,86,340 pending across 5 bills</div><div style={{ fontSize: '0.6rem', color: '#b45309', marginTop: '1px' }}>2 bills are over 30 days old</div></div>
                      </div>
                      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.62rem', color: '#64748b', padding: '12px' }}>
                        5 pending bills · Total pending: Rs.24,86,340
                      </div>
                    </div>

                    {/* Summary Sheet (simplified) */}
                    <div id="pane-summary" className={`app-pane${activePane === 'pane-summary' ? ' active' : ''}`} style={{ display: activePane === 'pane-summary' ? 'flex' : 'none', flexDirection: 'column', padding: '16px', overflow: 'auto', background: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div><h1 style={{ fontFamily: "'Poppins',sans-serif", fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Summary Sheet</h1><p style={{ fontSize: '0.68rem', color: '#64748b', margin: '2px 0 0' }}>Skyline Residency • Mr. Mehta • Pune, MH</p></div>
                        <div style={{ display: 'flex', gap: '6px' }}>{['📊 Excel','📄 PDF','🖨️ Print'].map(b=><button key={b} className="rep-btn">{b}</button>)}</div>
                      </div>
                      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', fontSize: '0.65rem' }}>
                        Full ledger: Labour ₹31,40,000 · Site ₹5,80,000 · Contractors ₹5,30,000 · Vendors ₹3,20,000<br />
                        <strong>Total: ₹45,70,000 · GST: ₹1,49,000</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trusted By ── */}
      <div className="trusted">
        <div className="container">
          <div className="trusted-inner">
            <span className="trusted-label">Trusted by teams of 2 to 200</span>
            <div className="trusted-sep" />
            <div className="trusted-logos">
              {['Skyline Arch Studio','BuildRight Infra','DesignCraft Associates','Vertex Constructions','MetroSpace MEP','Pinnacle Interiors'].map(f=><span key={f} className="t-firm">{f}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Comparison ── */}
      <section className="cmp-section">
        <div className="container">
          <div className="cmp-head fade-up">
            <span className="cmp-badge">Why ARC PEM</span>
            <h2>One Platform Replaces Them All</h2>
            <p>Stop managing your construction projects across disconnected Excel sheets, Tally entries, and WhatsApp threads. ARC PEM unifies everything — out of the box.</p>
          </div>
          <div className="cmp-flex">
            <div className="cmp-col fade-up">
              <div className="cmp-before">
                <svg className="cmp-svg" viewBox="0 0 340 340" fill="none">
                  <circle cx="170" cy="170" r="50" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                  <circle cx="170" cy="170" r="100" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                  <circle cx="170" cy="170" r="148" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                  <line x1="170" y1="170" x2="170" y2="60" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeDasharray="4 3"/>
                  <line x1="170" y1="170" x2="60" y2="170" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeDasharray="4 3"/>
                  <line x1="170" y1="170" x2="280" y2="170" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeDasharray="4 3"/>
                  <line x1="170" y1="170" x2="170" y2="280" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeDasharray="4 3"/>
                  <circle cx="170" cy="170" r="5" fill="rgba(255,255,255,0.2)"/>
                </svg>
                {[{cls:'cmp-n-top',ico:'📋',lbl:'BOQ &\nBudget'},{cls:'cmp-n-left',ico:'🏪',lbl:'Vendor\nTracking'},{cls:'cmp-n-right',ico:'👷',lbl:'Labour\nTracking'},{cls:'cmp-n-bottom',ico:'💰',lbl:'Finance\nControl'}].map(n=>(
                  <div key={n.cls} className={`cmp-node ${n.cls}`}><div className="cmp-node-ring"><div className="cmp-node-circle">{n.ico}</div></div><span>{n.lbl.split('\n').map((l,i)=><span key={i}>{l}{i===0&&<br/>}</span>)}</span></div>
                ))}
                <div className="tool-chip tc-1"><span className="tc-dot" style={{ background: '#1D6F42' }} />Excel</div>
                <div className="tool-chip tc-2">Tally</div>
                <div className="tool-chip tc-3">📱 WhatsApp</div>
                <div className="tool-chip tc-4">📄 Paper Bills</div>
                <div className="tool-chip tc-5">📋 Registers</div>
                <div className="tool-chip tc-6" style={{ color: '#e24c4b' }}>📁 PDF Files</div>
              </div>
              <div className="cmp-label-block"><h3>Different Software for every use case</h3><p>NEVER ENDING SPREADSHEET CHAOS</p></div>
            </div>
            <div className="cmp-arrow fade-up">
              <div className="cmp-chevrons">
                <svg width="64" height="44" viewBox="0 0 64 44" fill="none">
                  <path d="M2 4 L22 22 L2 40" stroke="rgba(255,255,255,0.22)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 4 L40 22 L20 40" stroke="rgba(255,255,255,0.40)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M38 4 L58 22 L38 40" stroke="rgba(255,255,255,0.65)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="cmp-col fade-up">
              <div className="cmp-after">
                <div className="cmp-outer-ring"><span className="cmp-ring-label">SMART EXPENSE MANAGEMENT</span></div>
                <div className="cmp-glow" />
                {[{cls:'cp-top',ico:'📋',lbl:'BOQ &\nBudget'},{cls:'cp-left',ico:'🏪',lbl:'Vendor\nTracking'},{cls:'cp-right',ico:'👷',lbl:'Labour\nTracking'},{cls:'cp-bottom',ico:'💰',lbl:'Finance\nControl'}].map(p=>(
                  <div key={p.cls} className={`cmp-petal ${p.cls}`}><div className="cp-icon">{p.ico}</div><div className="cp-text">{p.lbl.split('\n').map((l,i)=><span key={i}>{l}{i===0&&<br/>}</span>)}</div></div>
                ))}
                <div className="cmp-center"><div className="cmp-center-icon">⚡</div><div className="cmp-center-name">Arch<br/>PEM</div></div>
              </div>
              <div className="cmp-label-block"><h3>Everything on ARC PEM</h3><p>ALL SET IN UNDER 15 MINUTES</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Solutions ── */}
      <section className="section bg-gray" id="features">
        <div className="container">
          <div className="sec-hd fade-up">
            <span className="badge badge-indigo">All Your Construction Management</span>
            <h2>Everything Your Firm Needs, Out of the Box</h2>
            <p>From the first sketch budget to the final handover report — ARC PEM covers every financial workflow your team needs, without spreadsheets or an internet connection.</p>
          </div>
          <div className="sol-grid">
            {[
              { id: 'project-mgmt', icon: '📋', cls: 'si-blue', title: 'Project & Budget Management', desc: 'Build precise cost estimates, track project status, and generate client-ready budget summaries with automatic GST and cost-per-sq.ft.', modal: 'modal-boq', cta: 'Explore BOQ Features', feats: [['b','Bill of Quantities (BOQ)'],['b','Project Dashboard & Status Tracking'],['b','BOQ Templates (Reusable)'],['b','Duplicate Projects'],['b','Cost Per Sq.Ft Calculator'],['b','Contingency & GST Auto-Compute'],['b','PDF & Excel Export']] },
              { id: 'expense-mgmt', icon: '💰', cls: 'si-sky', title: 'Expense & Finance Management', desc: 'Track every rupee across vendor bills, labour wages, contractor invoices, and site expenses. Auto-compute GST and export directly to Tally.', modal: 'modal-expense', cta: 'Explore Finance Tools', feats: [['s','Vendor Ledger with GST Toggle'],['s','Labour Tracking (Daily Headcount)'],['s','Contractor Bill Management'],['s','Site Expense Tracking'],['s','GST Purchase Register'],['s','Pending Payments Dashboard'],['s','Tally ERP / Prime CSV Export']] },
              { id: 'power-feat',   icon: '⚡', cls: 'si-green', title: 'Power & Productivity Features', desc: 'Enterprise-grade tools built for the field — offline operation, multi-user sharing, global search, and machine-locked security.', modal: 'modal-power', cta: 'Explore Power Tools', feats: [['g','Global Search (Ctrl+K)'],['g','Multi-User Database Sharing'],['g','PDF Manpower Report Import'],['g','Vendor Directory & Autocomplete'],['g','PIN Lock & RSA-2048 Licensing'],['g','Auto-Backup & JSON Export'],['g','Silent Auto-Update']] },
            ].map((s, i) => (
              <div key={s.id} className={`sol-card fade-up${i===1?' d1':i===2?' d2':''}`} id={s.id}>
                <div className={`sol-icon ${s.cls}`}>{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <ul className="sol-feats">
                  {s.feats.map(([dot, f]) => (
                    <li key={f} className="sol-feat"><div className={`sf-dot ${dot}`} />{f}</li>
                  ))}
                </ul>
                <button className="sol-link" style={{ background: 'none', border: 'none' }} onClick={() => showModal(s.modal)}>{s.cta} &nbsp;→</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Band ── */}
      <div className="stats-band">
        <div className="container">
          <div className="stats-grid">
            {[
              { icon: '📉', num: '10%', target: 10, suffix: '%', title: 'Budget Overrun Reduction', sub: 'Faster visibility on cost vs. budget across all projects', pct: 10 },
              { icon: '⚡', num: '80%', target: 80, suffix: '%', title: 'Faster Accounting Handoff', sub: 'Tally CSV eliminates manual CA re-entry', pct: 80 },
              { icon: '🚀', num: '<15 min', target: null, suffix: '', title: 'Setup Guarantee', sub: 'No server, no IT department required', pct: 95 },
              { icon: '🏗️', num: '30+', target: 30, suffix: '+', title: 'Construction Teams', sub: 'Architecture & construction firms trust ARC PEM', pct: 60 },
            ].map((s, i) => (
              <div key={s.title} className={`stat-block fade-up${i>0?' d'+i:''}`}>
                <div className="stat-ring-wrap">
                  <svg className="stat-ring-svg" width="84" height="84" viewBox="0 0 84 84">
                    <circle className="stat-ring-bg" cx="42" cy="42" r="36"/>
                    <circle className="stat-ring-fg" cx="42" cy="42" r="36" data-pct={s.pct}/>
                  </svg>
                  <div className="stat-ring-icon">{s.icon}</div>
                </div>
                <div className="stat-num" {...(s.target ? { 'data-target': s.target, 'data-suffix': s.suffix } : {})}>{s.num}</div>
                <div className="stat-title">{s.title}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Feature Rows ── */}
      <section className="feat-section">
        <div className="container">
          {/* Row 1: BOQ */}
          <div className="feat-row fade-up">
            <div className="feat-text">
              <span className="badge badge-indigo">Project &amp; Budget Management</span>
              <h3>Replace spreadsheet BOQs with a proper budget engine</h3>
              <p>Build structured Bills of Quantities with colour-coded categories, line items, units, and rates. Watch the subtotal, contingency, GST, and cost-per-sq.ft update live as you type.</p>
              <ul className="feat-bullets">
                {['Colour-coded categories — Civil, MEP, Finishing, Landscaping','Save any BOQ as a reusable template for future projects','One-click PDF and Excel export — client-ready format','Duplicate entire projects to reuse budget structure'].map(b=>(
                  <li key={b} className="feat-bullet"><span className="fb-check">✓</span> {b}</li>
                ))}
              </ul>
            </div>
            <div className="feat-panel">
              <div className="fp-label">BOQ — Skyline Residency, Pune</div>
              {[{cls:'var(--indigo-lt)',dot:'var(--indigo)',name:'Civil & Structure',cnt:'12 items',amt:'₹24,80,000',col:'var(--indigo)'},
                {cls:'var(--amber-lt)',dot:'var(--amber)',name:'Electrical & Plumbing',cnt:'8 items',amt:'₹9,40,000',col:'var(--amber)'},
                {cls:'var(--green-lt)',dot:'var(--green)',name:'Finishing & Interiors',cnt:'15 items',amt:'₹18,60,000',col:'var(--green)'}].map((c,i)=>(
                <div key={c.name}>
                  <div className="boq-cat" style={{ background: c.cls, marginTop: i>0?'6px':'0' }}>
                    <div className="boq-cat-dot" style={{ background: c.dot }} />
                    <div className="boq-cat-name">{c.name}</div>
                    <div className="boq-cat-count">{c.cnt}</div>
                    <div className="boq-cat-amt" style={{ color: c.col }}>{c.amt}</div>
                  </div>
                  {i===0&&<>
                    <div className="boq-sub-item"><span style={{ flex: 2 }}>RCC Columns &amp; Beams</span><span style={{ color: 'var(--gray-400)' }}>120 m³ × ₹5,500</span><span style={{ fontWeight: 700, color: 'var(--navy)', marginLeft: 'auto' }}>₹6,60,000</span></div>
                    <div className="boq-sub-item"><span style={{ flex: 2 }}>Brick Masonry</span><span style={{ color: 'var(--gray-400)' }}>450 m² × ₹1,800</span><span style={{ fontWeight: 700, color: 'var(--navy)', marginLeft: 'auto' }}>₹8,10,000</span></div>
                  </>}
                </div>
              ))}
              <div className="gst-box">
                {[['Sub-total','₹52,80,000'],['Contingency (5%)','₹2,64,000']].map(([k,v])=><div key={k} className="gst-row"><span className="k">{k}</span><span className="v">{v}</span></div>)}
                <div className="gst-divider"/>
                <div className="gst-row"><span className="k">GST (18%)</span><span className="v">₹9,93,120</span></div>
                <div className="gst-divider"/>
                <div className="gst-row tot"><span className="k">Grand Total</span><span className="v">₹65,37,120</span></div>
                <div className="gst-row"><span className="k">Rate / sq.ft (3,200 sq.ft)</span><span className="v" style={{ color: 'var(--gray-500)' }}>₹2,043 / sq.ft</span></div>
              </div>
            </div>
          </div>

          {/* Row 2: Expense */}
          <div className="feat-row rev fade-up">
            <div className="feat-text">
              <span className="badge badge-teal">Expense &amp; Finance Management</span>
              <h3>Every bill. Every worker. Every rupee — tracked.</h3>
              <p>Log vendor bills with per-entry GST, track daily labour headcount by role, manage contractor invoices, and capture site costs — all in one ledger per project.</p>
              <ul className="feat-bullets">
                {['Per-bill GST toggle — auto-calculates CGST + SGST','Payment tracking: advance, cash, cheque, pending balance','Attach bill photos or scanned PDFs to each entry','4-second undo window on accidental deletes'].map(b=>(
                  <li key={b} className="feat-bullet"><span className="fb-check">✓</span> {b}</li>
                ))}
              </ul>
            </div>
            <div className="feat-panel">
              <div className="fp-label">Vendor Ledger — Resident Villa</div>
              {[
                {dot:'l',name:'Labour — Daily Wages',date:'Cash · 01 Jun 2026',amt:'₹35,100',st:'paid'},
                {dot:'s',name:'Site Expenses',date:'Bill · 04 Jun 2026',amt:'₹38,349',st:'pending',due:'₹18,349 due'},
                {dot:'s',name:'Site Expenses',date:'Bill · 13 Jun 2026',amt:'₹10,266',st:'pending',due:'₹10,266 due'},
                {dot:'c',name:'AK Tiles',date:'Cash · 10 Jun 2026',amt:'₹26,550',st:'paid'},
                {dot:'c',name:'Shakir Painter',date:'Cheque: 15,000 · 11 Jun 2026',amt:'₹18,054',st:'pending',due:'₹3,054 due'},
                {dot:'c',name:'Aggarwal RMC Contractor',date:'Cheque: 5,000 · 13 Jun 2026',amt:'₹10,266',st:'pending',due:'₹5,266 due'},
              ].map(r=>(
                <div key={r.name+r.date} className="exp-row">
                  <div className={`exp-dot ${r.dot}`}/>
                  <div style={{ flex: 1 }}><div className="exp-name">{r.name}</div><div className="exp-date">{r.date}</div></div>
                  <div className="exp-amt">{r.amt}</div>
                  <div className={`exp-status es-${r.st}`}>{r.due ?? 'Paid'}</div>
                </div>
              ))}
              <div className="gst-box" style={{ marginTop: '12px' }}>
                <div className="gst-row"><span className="k">Total Billed</span><span className="v">₹28,42,500</span></div>
                <div className="gst-row"><span className="k">Total Pending</span><span className="v" style={{ color: 'var(--amber)' }}>₹3,18,650</span></div>
                <div className="gst-divider"/>
                <div className="gst-row tot"><span className="k">Tally CSV</span><span className="v">✓ Export Ready</span></div>
              </div>
            </div>
          </div>

          {/* Row 3: Power */}
          <div className="feat-row fade-up">
            <div className="feat-text">
              <span className="badge badge-amber">Power Features</span>
              <h3>Enterprise security. Zero server. Works on-site.</h3>
              <p>ARC PEM is fully offline — your data never touches a cloud server. Share the database over LAN or Google Drive for multi-user access, protected by RSA-2048 machine-locked licensing.</p>
              <ul className="feat-bullets">
                {['Global search with Ctrl+K — find any project, vendor, or bill instantly','Multi-user via LAN, Google Drive, OneDrive, Dropbox','RSA-2048 signed, machine-locked licenses','Works fully offline — no internet after activation'].map(b=>(
                  <li key={b} className="feat-bullet"><span className="fb-check">✓</span> {b}</li>
                ))}
              </ul>
            </div>
            <div className="feat-panel">
              <div className="fp-label">Global Search — Ctrl+K</div>
              <div className="search-box">
                <div className="search-bar"><span style={{ color: 'rgba(255,255,255,.4)', fontSize: '.85rem' }}>🔍</span><span className="search-input">Resident Villa</span><span className="search-kbd">⌘K</span></div>
                <div className="search-results">
                  <div className="sr-group-label">Projects</div>
                  <div className="sr-item active"><span className="sr-item-icon">🏠</span><div><div className="sr-item-name">Resident Villa — Delhi</div><div className="sr-item-sub">M.K Thakur · Plot 403_B, Delhi-101110 · <span style={{ color: '#10b981', fontWeight: 700 }}>Active</span></div></div><span className="sr-item-arrow">Open →</span></div>
                  <div className="sr-group-label">Contractors</div>
                  <div className="sr-item"><span className="sr-item-icon">🚛</span><div><div className="sr-item-name">Aggarwal RMC Contractor</div><div className="sr-item-sub">Cheque: Rs.5,000 · <span style={{ color: '#f59e0b', fontWeight: 700 }}>Pending: Rs.5,266</span></div></div></div>
                  <div className="sr-group-label">Expenses</div>
                  <div className="sr-item"><span className="sr-item-icon">🧾</span><div><div className="sr-item-name">Site Expenses — Rs.58,881</div><div className="sr-item-sub">Resident Villa · Period: 01-01-2024 – 31-12-2027</div></div><div style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '.62rem', background: 'var(--amber-lt)', color: '#92400e', padding: '2px 7px', borderRadius: '100px', fontWeight: 700 }}>Pending Rs.28,615</div></div>
                </div>
              </div>
              <div className="sec-tiles">
                {[['🔒','RSA-2048','Machine-locked license'],['🌐','100% Offline','No cloud, no internet'],['👥','Multi-User','LAN / Google Drive'],['🔄','Auto-Update','Silent background']].map(([ico,name,sub])=>(
                  <div key={name} className="sec-tile"><span className="st-icon">{ico}</span><div><div className="st-name">{name}</div><div className="st-sub">{sub}</div></div></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section bg-gray" id="testimonials">
        <div className="container">
          <div className="sec-hd fade-up">
            <span className="badge badge-indigo">Customer Stories</span>
            <h2>Our Customer Success Stories</h2>
            <p>See how architecture studios and construction firms across India use ARC PEM to reduce costs, speed up accounting, and take complete control of project finances.</p>
          </div>
          <div className="case-grid">
            {[
              { initials: 'DC', company: 'DesignCraft Architects', badge: 'badge-indigo', badgeTxt: 'Interior & Fit-out', grad: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', metric: '80% Faster GST Filing', metricSub: 'Monthly GST reconciliation: 2 days → 2 hours', quote: 'We used to maintain 14 separate Excel sheets per project. ARC PEM consolidated everything. The GST Purchase Register alone saves us two full days every month during filing season.', avInitials: 'AR', name: 'Arun Rajan', role: 'Director · Bengaluru', delay: '' },
              { initials: 'VC', company: 'Vertex Constructions', badge: 'badge-gray', badgeTxt: 'Residential', grad: 'linear-gradient(135deg,#0ea5e9,#0284c7)', metric: '₹35L Pending Recovered', metricSub: '35% reduction in outstanding dues in 3 months', quote: 'The Pending Payments dashboard gave us instant visibility across all 12 active projects. We follow up on dues the same week — not after a month of confusion.', avInitials: 'PS', name: 'Priya Sharma', role: 'Project Head · Pune', delay: ' d1' },
              { initials: 'BR', company: 'BuildRight Infra', badge: 'badge-green', badgeTxt: 'MEP & Civil', grad: 'linear-gradient(135deg,#10b981,#059669)', metric: 'Zero Labour Disputes', metricSub: 'Daily wage records verified against PDF muster rolls', quote: 'The site supervisor imports the daily muster PDF, wages are auto-calculated, and everyone signs off on the same number. Labour disputes have become a thing of the past.', avInitials: 'MK', name: 'Mohammed Khan', role: 'Owner · Hyderabad', delay: ' d2' },
            ].map(c => (
              <div key={c.company} className={`case-card fade-up${c.delay}`}>
                <div className="cc-top">
                  <div className="cc-company-row">
                    <div className="cc-logo"><div className="cc-initials" style={{ background: c.grad }}>{c.initials}</div>{c.company}</div>
                    <span className={`badge ${c.badge}`}>{c.badgeTxt}</span>
                  </div>
                  <div className="cc-metric-box"><div className="cc-metric-val">{c.metric}</div><div className="cc-metric-label">{c.metricSub}</div></div>
                  <div className="cc-quote"><div className="cc-quote-inner">{c.quote}</div></div>
                </div>
                <div className="cc-foot">
                  <div className="cc-person"><div className="cc-avatar" style={{ background: c.grad }}>{c.avInitials}</div><div><div className="cc-name">{c.name}</div><div className="cc-role">{c.role}</div></div></div>
                  <a href="#" className="cc-read">Read more →</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Resources ── */}
      <section className="section" id="about">
        <div className="container">
          <div className="sec-hd fade-up">
            <span className="badge badge-indigo">Resources</span>
            <h2>One Stop Shop for All Resources</h2>
            <p>Everything you need to get started and get the most out of ARC PEM.</p>
          </div>
          <div className="res-grid">
            {[
              {i:'📝',t:'User Guide',d:'Complete 860-page documentation covering every feature with step-by-step screenshots.',delay:''},
              {i:'📹',t:'Video Tutorials',d:'Step-by-step walkthroughs for BOQ creation, expense entry, and report generation.',delay:' d1'},
              {i:'📊',t:'Case Studies',d:'How 30+ firms reduced budget overruns and streamlined accounting with ARC PEM.',delay:' d2'},
              {i:'📥',t:'BOQ Templates',d:'Pre-built Bill of Quantities templates for residential, commercial, and MEP projects.',delay:' d3'},
              {i:'🧾',t:'GST Guide',d:'How to set up GST categories, generate the Purchase Register, and export to Tally.',delay:''},
              {i:'🆚',t:'ARC PEM vs. Others',d:'Side-by-side comparison with Excel, Tally, and other construction management tools.',delay:' d1'},
              {i:'🔔',t:'Product Updates',d:'Changelog, new features, and release notes for every ARC PEM version.',delay:' d2'},
              {i:'💬',t:'Help Centre',d:'FAQs, troubleshooting guides, and live support from the HashX Labs team.',delay:' d3'},
            ].map(r=>(
              <div key={r.t} className={`res-tile fade-up${r.delay}`}>
                <div className="res-tile-icon">{r.i}</div>
                <div className="res-tile-title">{r.t}</div>
                <div className="res-tile-desc">{r.d}</div>
                <div className="res-tile-link">Learn More →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="section bg-gray" id="pricing" style={{ overflow: 'visible' }}>
        <div className="container">
          <div className="sec-hd fade-up">
            <span className="badge badge-indigo">Pricing</span>
            <h2>Simple, Transparent Pricing</h2>
            <p>One license. One machine. No hidden fees. Cancel anytime. Updates included for 12 months. Your data stays yours — always.</p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card fade-up">
              <div className="plan-tier" style={{ color: 'var(--gray-500)' }}>Solo</div>
              <div className="plan-price"><span className="plan-cur">₹</span><span className="plan-num">4,999</span><span className="plan-per">/month</span></div>
              <p className="plan-desc">For individual architects managing up to 10 active projects on a single machine.</p>
              <ul className="plan-feats">
                {[['yes','Single machine license'],['yes','Up to 10 active projects'],['yes','BOQ + all expense ledgers'],['yes','PDF & Excel exports'],['yes','Vendor directory'],['yes','12 months of updates'],['no','Multi-user sharing'],['no','Tally CSV export']].map(([t,f])=>(
                  <li key={f} className="plan-feat"><span className={`pf-${t}`}>{t==='yes'?'✓':'✗'}</span> {f}</li>
                ))}
              </ul>
              <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => openSignupWithPlan('Solo')}>Get Started</button>
            </div>
            <div className="pricing-card pop fade-up d1">
              <div className="pop-chip">Most Popular</div>
              <div className="plan-tier" style={{ color: 'var(--indigo)' }}>Studio</div>
              <div className="plan-price"><span className="plan-cur">₹</span><span className="plan-num">9,999</span><span className="plan-per">/month</span></div>
              <p className="plan-desc">For studios and construction firms with teams. Unlimited projects and multi-user database sharing.</p>
              <ul className="plan-feats">
                {[['yes','Up to 5 machine licenses'],['yes','Unlimited projects'],['yes','All exports incl. Tally CSV'],['yes','Multi-user database sharing'],['yes','GST Purchase Register'],['yes','Pending Payments Report'],['yes','Priority email support'],['yes','PIN lock & security']].map(([t,f])=>(
                  <li key={f} className="plan-feat"><span className={`pf-${t}`}>{t==='yes'?'✓':'✗'}</span> {f}</li>
                ))}
              </ul>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => openSignupWithPlan('Studio')}>Get Started</button>
            </div>
            <div className="pricing-card fade-up d2">
              <div className="plan-tier" style={{ color: 'var(--gray-500)' }}>Enterprise</div>
              <div className="plan-price"><span className="plan-num" style={{ fontSize: '2rem' }}>Custom</span></div>
              <p className="plan-desc">For large firms managing 50+ projects, multiple offices, custom integrations, and SLA support.</p>
              <ul className="plan-feats">
                {[['yes','Unlimited machines'],['yes','Custom onboarding & training'],['yes','Dedicated account manager'],['yes','White-label option'],['yes','Custom integrations'],['yes','SLA support agreement'],['yes','Volume pricing'],['yes','Machine transfer support']].map(([t,f])=>(
                  <li key={f} className="plan-feat"><span className={`pf-${t}`}>✓</span> {f}</li>
                ))}
              </ul>
              <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => openSignupWithPlan('Enterprise')}>Contact Sales</button>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button className="btn btn-outline btn-lg" onClick={() => showModal('modal-compare')}>📊 &nbsp;Compare All Plans in Detail</button>
          </div>
          <p style={{ textAlign: 'center', fontSize: '.84rem', color: 'var(--gray-400)', marginTop: '28px' }}>All plans include a 14-day free trial · No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* ── CTA Dark ── */}
      <div className="cta-dark">
        <div className="container inner">
          <h2>Ready to Take Control of Your Project Finances?</h2>
          <p>Join 30+ architecture and construction firms already using ARC PEM to track budgets, manage vendors, and generate professional reports — without a single spreadsheet.</p>
          <div className="btns">
            <a href="mailto:hashxlabs@gmail.com" className="btn btn-white btn-lg">Talk to an Expert</a>
            <a href="#pricing" className="btn btn-ghost btn-lg">Book Free Demo</a>
          </div>
          <div className="cta-contact">
            <div className="cc-item">📞 &nbsp;<strong>+91 9266103145</strong></div>
            <div className="cc-item">✉️ &nbsp;<strong>hashxlabs@gmail.com</strong></div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-logo"><LogoMark size={28} /><span className="f-logo-text">ARC PEM</span></div>
              <p className="f-desc">Project expense management software built for Indian architecture consultancies and construction firms. By HashX Labs.</p>
              <div className="f-investor">🏗️ &nbsp; Made with ♥ in India</div>
            </div>
            <div><h4>Solutions</h4><a href="#project-mgmt" className="f-link">Project &amp; Budget Management</a><a href="#expense-mgmt" className="f-link">Expense &amp; Finance Tracking</a><a href="#power-feat" className="f-link">Power Features</a><a href="#pricing" className="f-link">Pricing</a></div>
            <div><h4>Quick Links</h4><a href="#about" className="f-link">About Us</a><a href="#" className="f-link">Blog</a><a href="#" className="f-link">Help Centre</a><a href="#" className="f-link">Product Updates</a><a href="/dashboard/downloads" className="f-link">Download App</a></div>
            <div><h4>Resources</h4><a href="#" className="f-link">User Guide (PDF)</a><a href="#" className="f-link">BOQ Templates</a><a href="#" className="f-link">GST Export Guide</a><a href="#" className="f-link">Tally Integration</a><a href="mailto:hashxlabs@gmail.com" className="f-link">Contact Sales</a></div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 HashX Labs. All rights reserved.</span>
            <div className="f-socials"><a href="#" className="f-soc" title="LinkedIn">in</a><a href="#" className="f-soc" title="Twitter/X">𝕏</a><a href="#" className="f-soc" title="YouTube">▶</a><a href="mailto:hashxlabs@gmail.com" className="f-soc" title="Email">✉</a></div>
            <div className="f-legal"><a href="#">Privacy Policy</a><a href="#">Terms of Service</a></div>
          </div>
        </div>
      </footer>

      {/* ── Modals ── */}
      {/* Demo Modal */}
      <div id="demo-modal" className={`modal-overlay${openModal==='demo-modal'?' open':''}`} onClick={e=>{if(e.target===e.currentTarget)hideModal()}}>
        <div className="modal-box">
          <button className="modal-close" onClick={hideModal}>✕</button>
          <div className="modal-badge">⚡ Free · No Credit Card</div>
          <h2 className="modal-title">Book Your Free Demo</h2>
          <p className="modal-sub">See ARC PEM live in 20 minutes. We set it up, you watch it work.</p>
          {!demoSuccess ? (
            <div id="demo-form-wrap">
              <form className="modal-form" onSubmit={e=>{e.preventDefault();setDemoSuccess(true)}}>
                <div className="mf-2col">
                  <div className="mf-row"><label>Full Name *</label><input type="text" placeholder="Rahul Vashisth" required /></div>
                  <div className="mf-row"><label>WhatsApp Number *</label><input type="tel" placeholder="+91 98765 43210" required /></div>
                </div>
                <div className="mf-row"><label>Firm / Company Name</label><input type="text" placeholder="Skyline Architects" /></div>
                <div className="mf-2col">
                  <div className="mf-row"><label>Your Role</label><select><option>Principal Architect</option><option>Project Manager</option><option>Accountant / Admin</option><option>Site Engineer</option><option>Owner / Director</option></select></div>
                  <div className="mf-row"><label>Team Size</label><select><option>Just me</option><option>2–5 people</option><option>6–20 people</option><option>20+ people</option></select></div>
                </div>
                <button type="submit" className="btn btn-primary btn-lg">Book Free Demo →</button>
              </form>
            </div>
          ) : (
            <div className="modal-success">
              <div className="modal-success-icon">✅</div>
              <h3>You&apos;re all set!</h3>
              <p>We&apos;ll reach you on WhatsApp within 2 hours to schedule your demo. No spam — ever.</p>
              <div style={{ marginTop: '16px', fontSize: '.8rem', color: 'var(--gray-400)' }}>📞 Or call us directly: <strong style={{ color: 'var(--navy)' }}>+91 9266103145</strong></div>
            </div>
          )}
          <p className="modal-note">Trusted by 30+ construction firms · Fully offline · No internet needed</p>
        </div>
      </div>

      {/* Feature Modals */}
      {[
        { id: 'modal-boq', cls: 'si-blue', icon: '📋', title: 'Project & Budget Management', sub: 'Precision BOQ engine built for Indian construction firms', cards: [
          {i:'🏗️',t:'Bill of Quantities (BOQ)',d:'Structured line items with units, rates, and colour-coded categories — Civil, MEP, Finishing, Landscaping. Live subtotal, contingency, and GST.'},
          {i:'📐',t:'Cost-Per-Sq.Ft Calculator',d:'Automatically computes and displays cost per sq.ft as you enter BOQ items. Instant benchmark for client negotiations.'},
          {i:'📁',t:'Reusable BOQ Templates',d:'Save any BOQ as a template. Apply it to future projects in one click — perfect for standard villa, office, or fit-out budgets.'},
          {i:'📊',t:'Project Dashboard',d:'Live status board showing budget vs. actual spend, % complete, and outstanding payments — all in real time.'},
          {i:'🔄',t:'Duplicate Projects',d:'Copy an entire project structure — BOQ, categories, team — to kickstart similar projects without starting from zero.'},
          {i:'📤',t:'PDF & Excel Export',d:'Generate a client-ready PDF BOQ or detailed Excel export. Professional formatting with your firm name and project details.'},
        ]},
        { id: 'modal-expense', cls: 'si-sky', icon: '💰', title: 'Expense & Finance Management', sub: 'Track every rupee across vendors, labour, contractors, and site', cards: [
          {i:'🏪',t:'Vendor Ledger with GST',d:'Log vendor bills with GSTIN, invoice number, and GST rate. Toggle between GST-inclusive and exclusive views. Auto-fills CGST/SGST split.'},
          {i:'👷',t:'Labour Tracking',d:'Daily headcount entry for every site. Weekly payment summaries, skill-wise breakdowns, and exportable attendance sheets.'},
          {i:'🤝',t:'Contractor Bill Management',d:'Manage civil, MEP, and interior contractors with running bill tracking, retention amounts, and advance deduction calculations.'},
          {i:'🧾',t:'GST Purchase Register',d:'Auto-generated monthly GST detail sheet — ready to share with your CA for GST filing. Exportable to Excel and PDF.'},
          {i:'⏳',t:'Pending Payments Dashboard',d:'See all unpaid bills across every project in one view. Overdue alerts with days-past-due counter.'},
          {i:'📥',t:'Tally ERP / Prime Export',d:'One-click CSV export formatted for Tally ERP 9 and Tally Prime. Eliminates manual double-entry and CA reconciliation time.'},
        ]},
        { id: 'modal-power', cls: 'si-green', icon: '⚡', title: 'Power & Productivity Features', sub: 'Enterprise tools for the field — offline, secure, and fast', cards: [
          {i:'🔍',t:'Global Search (Ctrl+K)',d:'Search across every project, vendor, bill, and entry in milliseconds. Fuzzy match finds records even with partial names.'},
          {i:'👥',t:'Multi-User Sharing',d:'Share the database via LAN, Google Drive, or OneDrive. Multiple team members access the same data simultaneously.'},
          {i:'🔐',t:'RSA-2048 Machine Lock',d:'License is tied to your hardware. Even if the software is copied, it will not run on another machine.'},
          {i:'📋',t:'PDF Manpower Import',d:'Import labour attendance from standard PDF reports. Auto-parses headcount, skill categories, and daily wages — zero manual entry.'},
          {i:'💾',t:'Auto-Backup & JSON Export',d:'Scheduled automatic backups to a folder of your choice. Full JSON export lets you migrate data or keep an off-site archive.'},
          {i:'🔄',t:'Silent Auto-Update',d:'New features and bug fixes deploy silently in the background. You always have the latest version without disrupting your workflow.'},
        ]},
      ].map(m => (
        <div key={m.id} id={m.id} className={`modal-overlay${openModal===m.id?' open':''}`} onClick={e=>{if(e.target===e.currentTarget)hideModal()}}>
          <div className="modal-box feat-modal-box">
            <button className="modal-close" onClick={hideModal}>✕</button>
            <div className="feat-modal-header">
              <div className={`feat-modal-icon ${m.cls}`}>{m.icon}</div>
              <div><div className="feat-modal-title">{m.title}</div><div className="feat-modal-sub">{m.sub}</div></div>
            </div>
            <div className="feat-modal-grid">
              {m.cards.map(c=><div key={c.t} className="fmg-card"><div className="fmg-icon">{c.i}</div><div className="fmg-title">{c.t}</div><div className="fmg-desc">{c.d}</div></div>)}
            </div>
            <div className="feat-modal-ctas">
              <button className="btn btn-primary" onClick={() => { hideModal(); showModal('demo-modal') }}>Book Free Demo →</button>
              <button className="btn btn-outline" onClick={hideModal}>Close</button>
            </div>
          </div>
        </div>
      ))}

      {/* Compare Modal */}
      <div id="modal-compare" className={`modal-overlay${openModal==='modal-compare'?' open':''}`} onClick={e=>{if(e.target===e.currentTarget)hideModal()}}>
        <div className="modal-box" style={{ maxWidth: '720px', padding: '40px' }}>
          <button className="modal-close" onClick={hideModal}>✕</button>
          <div className="modal-badge">Plan Comparison</div>
          <h2 className="modal-title">Compare All Plans</h2>
          <p className="modal-sub">Choose the plan that fits your firm — all plans include offline operation and free setup support.</p>
          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead><tr><th style={{ width: '40%' }}>Feature</th><th>Solo<br/><span style={{ fontWeight: 400, fontSize: '.8rem', textTransform: 'none' }}>₹4,999/mo</span></th><th className="pop-col">Studio ⭐<br/><span style={{ fontWeight: 400, fontSize: '.8rem', textTransform: 'none' }}>₹9,999/mo</span></th><th>Enterprise<br/><span style={{ fontWeight: 400, fontSize: '.8rem', textTransform: 'none' }}>Custom</span></th></tr></thead>
              <tbody>
                {[['Projects','Up to 5','Unlimited','Unlimited'],['Users','1 user','Up to 5','Unlimited'],['BOQ & Budget Management','✓','✓','✓'],['Vendor / Labour / Contractor Ledgers','✓','✓','✓'],['GST Purchase Register','✓','✓','✓'],['Tally ERP / Prime Export','✓','✓','✓'],['PDF & Excel Export','✓','✓','✓'],['Multi-User LAN Sharing','—','✓','✓'],['Google Drive / OneDrive Sync','—','✓','✓'],['PDF Manpower Import','—','✓','✓'],['Priority WhatsApp Support','—','✓','✓'],['Custom Branding on Reports','—','—','✓'],['Dedicated Onboarding Manager','—','—','✓'],['API / Custom Integration','—','—','✓']].map(([feat,...cols])=>(
                  <tr key={feat}><td>{feat}</td>{cols.map((v,i)=><td key={i} className={i===1?'pop-col':''}>{v}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => { hideModal(); showModal('demo-modal') }}>Get Started Free →</button>
            <button className="btn btn-outline" onClick={hideModal}>Close</button>
          </div>
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

      {/* ── Mobile sticky CTA (hidden on desktop via CSS) ── */}
      <div className={`mob-cta-sticky${showMobCta ? ' visible' : ''}`}>
        <a href="/register" className="btn btn-primary">Get Started Free →</a>
        <a href="#pricing"  className="btn btn-outline">View Pricing</a>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
