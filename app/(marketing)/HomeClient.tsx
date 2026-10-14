'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useDemoModal } from '@/components/marketing/DemoModalContext'
import WhyArcPem from '@/components/marketing/WhyArcPem'
import LedgerHero from '@/components/marketing/LedgerHero'
import './why-arcpem.css'
import ProofBand from '@/components/marketing/ProofBand'
import ProjectControl from '@/components/marketing/ProjectControl'
import Lifecycle from '@/components/marketing/Lifecycle'
import './home-sections.css'
import './ledger.css'
import {
  DashboardIcon, FolderIcon, WalletIcon, ClockIcon, ReceiptIcon,
  DocumentIcon, UsersIcon, SettingsIcon, BuildingIcon, LockIcon,
  ClipboardIcon, StoreIcon, HardHatIcon, BoltIcon, PhoneIcon,
  FileIcon, TrendingDownIcon, RocketIcon, CompassIcon,
  PrinterIcon, ExportIcon, WarningIcon, BellIcon,
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
      <LedgerHero />

      {/* ── Trusted By ── */}
      <div className="trusted">
        <div className="container">
          <div className="trusted-inner">
            <span className="trusted-label">Trusted by Indian architecture &amp; design firms</span>
            <div className="trusted-sep" />
            <div className="trusted-logos">
              {['Arch Consultancy','Munesh Associates','Archosphere','Awas Designs'].map(f=><span key={f} className="t-firm">{f}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Why ARC PEM: chaos → one platform ── */}
      <WhyArcPem />

      {/* ── Proof band: confirmed customer numbers ── */}
      <ProofBand />

      {/* ── Project Control: pinned desktop-alerts scene ── */}
      <ProjectControl />

      {/* ── Lifecycle: pinned horizontal journey ── */}
      <Lifecycle />
    </>
  )
}
