'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useDemoModal } from '@/components/marketing/DemoModalContext'
import Comparison3D from '@/components/marketing/Comparison3D'
import {
  DashboardIcon, FolderIcon, WalletIcon, ClockIcon, ReceiptIcon,
  DocumentIcon, UsersIcon, SettingsIcon, BuildingIcon, LockIcon,
  ClipboardIcon, StoreIcon, HardHatIcon, BoltIcon, PhoneIcon,
  FileIcon, TrendingDownIcon, RocketIcon, CompassIcon,
  PrinterIcon, ExportIcon, WarningIcon,
} from '@/components/icons'

export default function HomeClient() {
  const openDemo = useDemoModal()
  const [activePane, setActivePane] = useState('pane-dashboard')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // ── Particle canvas (hero only) ──
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
    const onMove = (e: Event) => {
      const me = e as MouseEvent
      const r = canvas!.getBoundingClientRect()
      mouseX = me.clientX - r.left; mouseY = me.clientY - r.top
    }
    const onLeave = () => { mouseX = mouseY = -1000 }
    hero?.addEventListener('mousemove', onMove)
    hero?.addEventListener('mouseleave', onLeave)

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

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      hero?.removeEventListener('mousemove', onMove)
      hero?.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  const navMain = [
    { id: 'pane-dashboard', icon: <DashboardIcon size={14} />, label: 'Dashboard' },
    { id: 'pane-projects',  icon: <FolderIcon size={14} />,    label: 'Projects'  },
    { id: 'pane-expenses',  icon: <WalletIcon size={14} />,    label: 'Expenses'  },
  ]

  const navReports = [
    { id: 'pane-pending', icon: <ClockIcon size={14} />,    label: 'Pending Payments' },
    { id: 'pane-gst',     icon: <ReceiptIcon size={14} />,  label: 'GST Report'       },
    { id: 'pane-summary', icon: <DocumentIcon size={14} />, label: 'Summary Sheet'    },
  ]

  const cmpNodes = [
    { cls: 'cmp-n-top',    ico: <ClipboardIcon size={22} color="white" />, lbl: 'BOQ &\nBudget'    },
    { cls: 'cmp-n-left',   ico: <StoreIcon size={22} color="white" />,     lbl: 'Vendor\nTracking' },
    { cls: 'cmp-n-right',  ico: <HardHatIcon size={22} color="white" />,   lbl: 'Labour\nTracking' },
    { cls: 'cmp-n-bottom', ico: <WalletIcon size={22} color="white" />,    lbl: 'Finance\nControl' },
  ]

  const cmpPetals = [
    { cls: 'cp-top',    ico: <ClipboardIcon size={20} color="white" />, lbl: 'BOQ &\nBudget'    },
    { cls: 'cp-left',   ico: <StoreIcon size={20} color="white" />,     lbl: 'Vendor\nTracking' },
    { cls: 'cp-right',  ico: <HardHatIcon size={20} color="white" />,   lbl: 'Labour\nTracking' },
    { cls: 'cp-bottom', ico: <WalletIcon size={20} color="white" />,    lbl: 'Finance\nControl' },
  ]

  const statItems = [
    { icon: <TrendingDownIcon size={22} color="#6366f1" strokeWidth={2.5} />, num: '10%',    target: 10,   suffix: '%',  title: 'Budget Overrun Reduction', sub: 'Faster visibility on cost vs. budget across all projects', pct: 10  },
    { icon: <BoltIcon size={22} color="#6366f1" />,                           num: '80%',    target: 80,   suffix: '%',  title: 'Faster Accounting Handoff', sub: 'Tally CSV eliminates manual CA re-entry',                pct: 80  },
    { icon: <RocketIcon size={22} color="#6366f1" strokeWidth={1.5} />,       num: '<15 min',target: null, suffix: '',   title: 'Setup Guarantee',           sub: 'No server, no IT department required',                  pct: 95  },
    { icon: <BuildingIcon size={22} color="#6366f1" strokeWidth={2} />,       num: '30+',    target: 30,   suffix: '+',  title: 'Construction Teams',        sub: 'Architecture & construction firms trust ARC PEM',       pct: 60  },
  ]

  const showcaseCards = [
    { img: '/images/architecture-modern.jpg', chipIcon: <CompassIcon size={11} />,  chip: 'Architecture', title: 'Design to Budget',      desc: 'Turn drawings and BOQs into precise, client-ready cost estimates with GST and cost-per-sq.ft built in.' },
    { img: '/images/construction-frame.jpg',  chipIcon: <BuildingIcon size={11} />, chip: 'Construction', title: 'Every Site, Tracked',   desc: 'Labour headcount, vendor bills and site expenses captured on the ground — foundation to handover.' },
    { img: '/images/finance-laptop.jpg',      chipIcon: <WalletIcon size={11} />,   chip: 'Finance',      title: 'Every Rupee Accounted', desc: 'Vendor ledgers, contractor bills, GST registers and one-click Tally export — without a spreadsheet.' },
    { img: '/images/management-meeting.jpg',  chipIcon: <DashboardIcon size={11} />,chip: 'Management',   title: 'One Source of Truth',   desc: 'Give principals and project managers live visibility on budget vs. actual across every project.' },
  ]

  const reportBtns = [
    { key: 'print', icon: <PrinterIcon size={10} />, label: 'Print' },
    { key: 'pdf',   icon: <FileIcon size={10} />,    label: 'PDF'   },
    { key: 'excel', icon: <ExportIcon size={10} />,  label: 'Excel' },
  ]

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <canvas id="particle-canvas" ref={canvasRef} />
        <div className="container hero-inner">
          <div className="hero-left">
            <div className="hero-tag">
              <BuildingIcon size={13} style={{ marginRight: 6 }} />
              Built for Indian Architects &amp; Builders
            </div>
            <h1>
              India&apos;s Complete<br />
              <span className="hi">Construction Finance</span><br />
              Platform
            </h1>
            <p className="hero-sub">
              ARC PEM unifies BOQ, vendor bills, labour tracking, contractor ledgers and GST into one offline desktop platform  built specifically for Indian construction firms.
            </p>
            <div className="hero-ctas">
              <button className="btn btn-primary btn-lg" onClick={openDemo}>Book a Free Demo</button>
            </div>
          </div>

          {/* Hero right — App window mockup */}
          <div className="hero-right">
            <div style={{ position: 'relative' }}>
              <div className="app-window">
                <div className="win-bar">
                  <div className="win-dot" /><div className="win-dot" /><div className="win-dot" />
                  <div className="win-url">
                    <LockIcon size={10} color="#22c55e" style={{ marginRight: 4 }} />
                    archpem.app/dashboard
                  </div>
                </div>
                <div className="win-body">
                  <div className="win-side">
                    <div className="ws-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', padding: '6px 10px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="26" height="26" viewBox="0 0 44 44" fill="none"><rect width="44" height="44" rx="11" fill="#3b82f6" /><path d="M11 34 L11 21 Q11 8 22 8 Q33 8 33 21 L33 34" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" /><line x1="7" y1="34" x2="37" y2="34" stroke="white" strokeWidth="4" strokeLinecap="round" /></svg>
                        <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '0.82rem', color: 'white' }}>ARC PEM</span>
                      </div>
                      <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginLeft: '2px' }}>Project Expense Manager</span>
                    </div>
                    <div className="ws-section">Main</div>
                    {navMain.map(({ id, icon, label }) => (
                      <div
                        key={id}
                        className={`ws-item${activePane === id ? ' active' : ''}`}
                        onClick={() => setActivePane(id)}
                      >
                        <span className="ico">{icon}</span>{label}
                      </div>
                    ))}
                    <div className="ws-section">Reports</div>
                    {navReports.map(({ id, icon, label }) => (
                      <div key={id} className={`ws-item${activePane === id ? ' active' : ''}`} onClick={() => setActivePane(id)}>
                        <span className="ico">{icon}</span>{label}
                      </div>
                    ))}
                    <div className="ws-section">Directory</div>
                    <div className={`ws-item${activePane === 'pane-vendors' ? ' active' : ''}`} onClick={() => setActivePane('pane-vendors')}>
                      <span className="ico"><UsersIcon size={14} /></span>Party Directory
                    </div>
                    <div className="ws-item"><span className="ico"><SettingsIcon size={14} /></span>Settings</div>
                    <div style={{ marginTop: 'auto', padding: '10px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '8px', fontSize: '0.65rem', color: '#93c5fd', textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>100% Offline</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>All data stored locally.</div>
                    </div>
                  </div>
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
                          <div><div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '.88rem', color: 'white' }}>Projects</div><div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.6)', marginTop: '1px' }}>Active 3 · On Hold 0 · Completed 0</div></div>
                          <button className="wt-btn" style={{ background: 'rgba(255,255,255,.15)', color: 'white', border: '1px solid rgba(255,255,255,.25)', fontSize: '.65rem' }}>+ New Project</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                          {[['Projects','3 Active','white'],['Total Expenses','₹7,66,294','#a5f3d0'],['Latest Entry','13-Jun-2026','#fde68a']].map(([lbl,val,color])=>(
                            <div key={lbl} style={{ background: 'rgba(255,255,255,.1)', borderRadius: '8px', padding: '7px 9px', backdropFilter: 'blur(8px)' }}>
                              <div style={{ fontSize: '.55rem', color: 'rgba(255,255,255,.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{lbl}</div>
                              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '.85rem', color, marginTop: '2px' }}>{val}</div>
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
                                <div style={{ background: '#eff6ff', color: '#2563eb', borderRadius: '7px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <FolderIcon size={14} color="#2563eb" />
                                </div>
                                <div>
                                  <div style={{ fontSize: '.5rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '.06em' }}>{p.id}</div>
                                  <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: '.78rem', color: '#0f172a' }}>{p.name}</div>
                                  <div style={{ fontSize: '.6rem', color: '#64748b', marginTop: '1px' }}>{p.client}</div>
                                </div>
                              </div>
                              <span className="wt-tag tag-a" style={{ fontSize: '.56rem' }}>Active</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div><div style={{ fontSize: '.55rem', color: '#64748b', fontWeight: 600, marginBottom: '2px' }}>Total Expenses</div><div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: '.82rem', color: '#2563eb' }}>{p.amt}</div></div>
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

                    {/* GST Pane */}
                    <div id="pane-gst" className={`app-pane${activePane === 'pane-gst' ? ' active' : ''}`} style={{ display: activePane === 'pane-gst' ? 'flex' : 'none', flexDirection: 'column', overflow: 'hidden', background: '#f8fafc' }}>
                      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '9px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                        <div><div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>GST Purchase Sheet</div><div style={{ fontSize: '0.58rem', color: '#64748b' }}>Monthly · share with CA for filing</div></div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {reportBtns.map(b => (
                            <button key={b.key} className="rep-btn" style={{ padding: '4px 7px', fontSize: '0.58rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              {b.icon}{b.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={{ flex: 1, overflow: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                          {[['Total Taxable','Rs.5,84,820','#0f172a'],['Total GST','Rs.1,05,268','#2563eb'],['Net Amount','Rs.6,90,088','#16a34a']].map(([lbl,val,color])=>(
                            <div key={lbl} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px' }}>
                              <div style={{ fontSize: '0.52rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: '1.3' }}>{lbl}</div>
                              <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '0.72rem', fontWeight: 800, color, marginTop: '3px' }}>{val}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', fontSize: '0.6rem', color: '#64748b' }}>
                          GST detail table — June 2026 · All Projects · 4 entries · Total GST: Rs.1,05,268
                        </div>
                      </div>
                    </div>

                    {/* Pending Pane */}
                    <div id="pane-pending" className={`app-pane${activePane === 'pane-pending' ? ' active' : ''}`} style={{ display: activePane === 'pane-pending' ? 'flex' : 'none', flexDirection: 'column', padding: '16px', overflow: 'auto', background: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexShrink: 0 }}>
                        <div><div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Pending Payments</div><div style={{ fontSize: '0.6rem', color: '#64748b' }}>All unpaid bills · oldest first</div></div>
                        <button className="rep-btn" style={{ flexShrink: 0, fontSize: '0.6rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <ExportIcon size={10} />Export
                        </button>
                      </div>
                      <div className="warning-banner" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '10px 14px', marginBottom: '14px' }}>
                        <WarningIcon size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
                        <div><div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400e' }}>Rs.24,86,340 pending across 5 bills</div><div style={{ fontSize: '0.6rem', color: '#b45309', marginTop: '1px' }}>2 bills are over 30 days old</div></div>
                      </div>
                      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.62rem', color: '#64748b', padding: '12px' }}>
                        5 pending bills · Total pending: Rs.24,86,340
                      </div>
                    </div>

                    {/* Summary Sheet Pane */}
                    <div id="pane-summary" className={`app-pane${activePane === 'pane-summary' ? ' active' : ''}`} style={{ display: activePane === 'pane-summary' ? 'flex' : 'none', flexDirection: 'column', padding: '16px', overflow: 'auto', background: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div><div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Summary Sheet</div><p style={{ fontSize: '0.68rem', color: '#64748b', margin: '2px 0 0' }}>Skyline Residency • Mr. Mehta • Pune, MH</p></div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {[
                            { key: 'excel', icon: <ExportIcon size={10} />,  label: 'Excel' },
                            { key: 'pdf',   icon: <FileIcon size={10} />,    label: 'PDF'   },
                            { key: 'print', icon: <PrinterIcon size={10} />, label: 'Print' },
                          ].map(b => (
                            <button key={b.key} className="rep-btn" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              {b.icon}{b.label}
                            </button>
                          ))}
                        </div>
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
          <Comparison3D />
        </div>
      </section>

      {/* ── Stats Band ── */}
      <div className="stats-band">
        <div className="container">
          <div className="stats-grid">
            {statItems.map((s, i) => (
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

      {/* ── Industry Showcase ── */}
      <section className="showcase">
        <div className="container">
          <div className="sec-hd fade-up">
            <span className="badge badge-indigo">Built for how India builds</span>
            <h2>From the First Sketch to the Final Handover</h2>
            <p>One platform across every stage of a project — design budgets, live construction sites, day-to-day finances, and the partners steering it all.</p>
          </div>
          <div className="showcase-grid">
            {showcaseCards.map((c, i) => (
              <div key={c.title} className={`show-card fade-up${i>0?' d'+i:''}`}>
                <Image src={c.img} alt={c.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                <div className="show-card-body">
                  <span className="show-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>{c.chipIcon}{c.chip}</span>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
