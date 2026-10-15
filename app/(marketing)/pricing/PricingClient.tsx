'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import {
  Receipt,
  FileSpreadsheet,
  FileText,
  Clock,
  Lock,
  Palette,
  Users,
  Repeat,
  Monitor,
  FolderKanban,
  IndianRupee,
  HelpCircle,
  ChevronDown,
  Check,
  Minus,
  Mail,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CalendarCheck,
  BadgeCheck,
  Gauge,
  type LucideIcon,
} from 'lucide-react'
import { company } from '@/lib/company'
import { annualPrice } from '@/lib/pricing'
import { PRICING_FAQS as FAQS } from '@/lib/pricing-faqs'

interface Plan {
  id: string
  name: string
  price: number
  period: string
  description: string
  features: string
  maxProjects: number
  maxUsers: number
}

function inr(n: number) {
  return n.toLocaleString('en-IN')
}

function parseFeatures(raw: string): string[] {
  try {
    const arr = JSON.parse(raw || '[]')
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

const PLAN_CTA: Record<string, string> = {
  Solo: 'Get Solo',
  Studio: 'Get Studio',
  Enterprise: 'Get Enterprise',
}

const COMPARISON_ROWS: { feature: string; note?: string; icon: LucideIcon; solo: boolean | string; studio: boolean | string; enterprise: boolean | string }[] = [
  { feature: 'Expense Tracking',           icon: Receipt,         solo: true,   studio: true,   enterprise: true,
    note: 'Labour, vendor, contractor and site ledgers' },
  { feature: 'Budget vs. Actual & Milestones', icon: Gauge,       solo: true,   studio: true,   enterprise: true,
    note: 'Overrun alerts and overdue milestone warnings' },
  { feature: 'Tally CSV Export',           icon: FileSpreadsheet, solo: true,   studio: true,   enterprise: true   },
  { feature: 'GST Purchase Register',      icon: FileText,        solo: true,   studio: true,   enterprise: true   },
  { feature: 'Pending Payments Report',    icon: Clock,           solo: true,   studio: true,   enterprise: true   },
  { feature: 'PIN Lock & Security',        icon: Lock,            solo: true,   studio: true,   enterprise: true   },
  { feature: 'Custom Branding on PDF Reports', icon: Palette,     solo: true,   studio: true,   enterprise: true,
    note: 'Your logo and firm name on every exported report' },
  { feature: 'Multi-User Database Sharing',icon: Users,           solo: false,  studio: true,   enterprise: true,
    note: 'Share one database over LAN, Google Drive or OneDrive' },
  { feature: 'Machine Transfer Support',   icon: Repeat,          solo: false,  studio: true,   enterprise: true,
    note: 'Moving to a new PC? Transfer the license yourself' },
  { feature: 'Machines',                   icon: Monitor,         solo: '1',    studio: '3',    enterprise: '10'   },
  { feature: 'Max Projects',               icon: FolderKanban,    solo: '10',   studio: '30',   enterprise: '50'   },
  { feature: 'Monthly Price',              icon: IndianRupee,     solo: '₹2,499', studio: '₹4,999', enterprise: '₹9,999' },
]

function CellValue({ val, highlight }: { val: boolean | string; highlight?: boolean }) {
  if (val === true) {
    return (
      <motion.span
        initial={{ scale: 0, rotate: -30, opacity: 0 }}
        whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ type: 'spring', stiffness: 420, damping: 20 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: highlight
            ? 'linear-gradient(135deg, var(--indigo), var(--indigo-d))'
            : 'linear-gradient(135deg, rgba(16,185,129,.16), rgba(16,185,129,.06))',
          color: highlight ? '#fff' : 'var(--green)',
          boxShadow: highlight ? '0 4px 12px rgba(79,70,229,.35)' : 'none',
        }}
      >
        <Check size={14} strokeWidth={3} />
      </motion.span>
    )
  }
  if (val === false) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 26,
          height: 26,
          borderRadius: '50%',
          color: 'var(--gray-300)',
        }}
      >
        <Minus size={14} strokeWidth={2.5} />
      </span>
    )
  }
  return (
    <span style={{ fontWeight: 700, color: highlight ? 'var(--indigo)' : 'var(--gray-700)' }}>{val}</span>
  )
}

function TiltPanel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)
  const springX = useSpring(x, { stiffness: 150, damping: 20 })
  const springY = useSpring(y, { stiffness: 150, damping: 20 })
  const rotateX = useTransform(springY, [0, 1], [3, -3])
  const rotateY = useTransform(springX, [0, 1], [-3, 3])
  const glowX = useTransform(springX, [0, 1], ['0%', '100%'])
  const glowY = useTransform(springY, [0, 1], ['0%', '100%'])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left) / rect.width)
    y.set((e.clientY - rect.top) / rect.height)
  }

  function handleMouseLeave() {
    x.set(0.5)
    y.set(0.5)
  }

  return (
    <div style={{ perspective: '1400px' }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          position: 'relative',
          ...style,
        }}
      >
        <motion.div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            background: useTransform(
              [glowX, glowY],
              ([gx, gy]: string[]) => `radial-gradient(480px circle at ${gx} ${gy}, rgba(99,102,241,.10), transparent 60%)`
            ),
            zIndex: 2,
          }}
        />
        {children}
      </motion.div>
    </div>
  )
}

export default function PricingClient() {
  const router = useRouter()
  const { data: session } = useSession()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  // Desktop app (machine licenses) or ARC PEM Web (per firm, in the browser). /pricing?product=web opens on Web.
  const [product, setProduct] = useState<'DESKTOP' | 'WEB'>('DESKTOP')

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('product')?.toLowerCase() === 'web') setProduct('WEB')
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    fetch(`/api/plans?product=${product}`)
      .then((r) => r.json())
      .then((d) => {
        if (active) setPlans(d.plans ?? [])
      })
      .catch(() => active && setPlans([]))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [product])

  useEffect(() => {
    if (loading) return
    const id = requestAnimationFrame(() => {
      document.querySelectorAll('#pricing .fade-up').forEach((el) => el.classList.add('in'))
    })
    return () => cancelAnimationFrame(id)
  }, [loading])

  function openSignupWithPlan(planName: string) {
    const anchor = product === 'WEB' ? '#web' : ''
    if (session) {
      router.push(`/dashboard/subscription?plan=${encodeURIComponent(planName)}${anchor}`)
    } else {
      router.push(`/register?plan=${encodeURIComponent(planName)}`)
    }
  }

  return (
    <>
      {/* ── Plan Cards ── */}
      <section className="section bg-gray" id="pricing" style={{ overflow: 'visible', paddingTop: '120px' }}>
        <div className="container">
          <div className="sec-hd fade-up">
            <span className="badge badge-indigo">Pricing</span>
            <h1>Simple Pricing for Every Firm Size</h1>
            <p>
              {product === 'WEB'
                ? 'ARC PEM Web runs in the browser for your whole firm. Choose by team seats and active projects.'
                : 'Choose your plan based on how many machines you need. All the essentials are included from day one.'}
            </p>
            <div
              role="tablist"
              aria-label="Product"
              style={{ display: 'inline-flex', gap: '4px', marginTop: '18px', padding: '4px', borderRadius: '999px', background: 'var(--gray-100, #f1f5f9)' }}
            >
              {(['DESKTOP', 'WEB'] as const).map((p) => (
                <button
                  key={p}
                  role="tab"
                  aria-selected={product === p}
                  onClick={() => setProduct(p)}
                  className={`btn ${product === p ? 'btn-primary' : ''}`}
                  style={{ borderRadius: '999px', padding: '8px 18px', fontSize: '.85rem', ...(product === p ? {} : { background: 'transparent', color: 'var(--gray-500)' }) }}
                >
                  {p === 'DESKTOP' ? 'Desktop app' : 'ARC PEM Web'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--gray-400)' }}>Loading plans…</p>
          ) : plans.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--gray-400)' }}>
              No plans are available right now. Please check back soon.
            </p>
          ) : (
            <div className="pricing-grid">
              {plans.map((plan, i) => {
                const popular = plans.length === 3 && i === 1
                const features = parseFeatures(plan.features)
                const yearly = annualPrice(plan.price)
                const ctaLabel = PLAN_CTA[plan.name] ?? 'Get Started'

                return (
                  <div key={plan.id} className={`pricing-card fade-up${popular ? ' pop' : ''}`}>
                    {popular && <div className="pop-chip">Most Popular</div>}
                    <div className="plan-tier" style={{ color: popular ? 'var(--indigo)' : 'var(--gray-500)' }}>
                      {plan.name}
                    </div>
                    <div className="plan-price">
                      <span className="plan-cur">₹</span>
                      <span className="plan-num">{inr(yearly)}</span>
                      <span className="plan-per">/year</span>
                    </div>
                    <p style={{ fontSize: '.8rem', color: 'var(--gray-400)', minHeight: '18px', marginTop: '-6px' }}>
                      ≈ ₹{inr(plan.price)}/mo · billed annually
                    </p>
                    <p className="plan-desc">{plan.description}</p>
                    <ul className="plan-feats">
                      {features.map((f) => (
                        <li key={f} className="plan-feat">
                          <span className="pf-yes">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`btn ${popular ? 'btn-primary' : 'btn-outline'}`}
                      style={{ width: '100%' }}
                      onClick={() => openSignupWithPlan(plan.name)}
                    >
                      {ctaLabel}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          <p style={{ textAlign: 'center', fontSize: '.84rem', color: 'var(--gray-400)', marginTop: '28px' }}>
            {product === 'WEB'
              ? 'One-year subscription per firm · Invite your team from inside the app · Secure checkout by Razorpay'
              : 'One-year license · 12 months of updates included · Secure checkout by Razorpay'}
          </p>
          <p style={{ textAlign: 'center', fontSize: '.78rem', color: 'var(--gray-400)', marginTop: '8px' }}>
            All prices are in Indian Rupees (₹).{' '}
            {company.pricesIncludeGst
              ? `Inclusive of ${company.gstRatePct}% GST.`
              : `Exclusive of ${company.gstRatePct}% GST, which is added at checkout where applicable.`}{' '}
            Secure payments by Razorpay. See our{' '}
            <a href="/refund" style={{ color: 'var(--indigo)' }}>Refund Policy</a> and{' '}
            <a href="/terms" style={{ color: 'var(--indigo)' }}>Terms</a>.
          </p>
        </div>
      </section>

      {/* ── Feature Comparison Table ── */}
      <section className="section" style={{ paddingTop: '80px', paddingBottom: '80px', position: 'relative', overflow: 'hidden' }}>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-120px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '640px',
            height: '320px',
            background: 'radial-gradient(circle, rgba(99,102,241,.14), transparent 70%)',
            filter: 'blur(10px)',
            pointerEvents: 'none',
          }}
        />
        <div className="container">
          <motion.div
            className="sec-hd"
            style={{ marginBottom: '44px' }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span className="badge badge-indigo">Side by Side</span>
            <h2 style={{ fontSize: '1.8rem' }}>Compare Plans</h2>
            <p>Every plan is packed with the essentials — pick the one that matches your team&apos;s scale.</p>
          </motion.div>

          <TiltPanel style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div
              style={{
                overflowX: 'auto',
                borderRadius: '20px',
                border: '1px solid var(--gray-200)',
                boxShadow: 'var(--sh-lg)',
                background: '#fff',
                position: 'relative',
              }}
            >
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '.9rem',
                minWidth: '560px',
              }}>
                <thead>
                  <tr>
                    <th style={thStyle('left')}>Feature</th>
                    <th style={thStyle('center')}>Solo</th>
                    <th
                      style={{
                        ...thStyle('center'),
                        color: '#fff',
                        background: 'linear-gradient(135deg, var(--indigo), var(--indigo-d))',
                        position: 'relative',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        Studio
                        <motion.span
                          aria-hidden="true"
                          animate={{ opacity: [0.55, 1, 0.55] }}
                          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                          style={{
                            fontSize: '.56rem',
                            letterSpacing: '.05em',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '999px',
                            background: 'rgba(255,255,255,.22)',
                          }}
                        >
                          POPULAR
                        </motion.span>
                      </span>
                    </th>
                    <th style={thStyle('center')}>Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => {
                    const Icon = row.icon
                    return (
                      <motion.tr
                        key={row.feature}
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.4, delay: i * 0.045, ease: 'easeOut' }}
                        whileHover={{ backgroundColor: 'rgba(99,102,241,.05)' }}
                        style={{ background: i % 2 === 0 ? 'var(--gray-50, #f9fafb)' : '#fff' }}
                      >
                        <td style={tdStyle('left')}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 28,
                                height: 28,
                                borderRadius: '8px',
                                background: 'var(--indigo-lt)',
                                color: 'var(--indigo)',
                                flexShrink: 0,
                              }}
                            >
                              <Icon size={14} strokeWidth={2.2} />
                            </span>
                            <span>
                              {row.feature}
                              {row.note && (
                                <span style={{ display: 'block', fontSize: '.72rem', fontWeight: 500, color: 'var(--gray-500)', marginTop: 2, lineHeight: 1.4 }}>
                                  {row.note}
                                </span>
                              )}
                            </span>
                          </span>
                        </td>
                        <td style={tdStyle('center')}><CellValue val={row.solo} /></td>
                        <td style={{ ...tdStyle('center'), background: 'rgba(99,102,241,.045)' }}>
                          <CellValue val={row.studio} highlight />
                        </td>
                        <td style={tdStyle('center')}><CellValue val={row.enterprise} /></td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </TiltPanel>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section bg-gray" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        <div className="container" style={{ maxWidth: '760px' }}>
          <motion.div
            className="sec-hd"
            style={{ marginBottom: '44px' }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span className="badge badge-indigo">Got Questions?</span>
            <h2 style={{ fontSize: '1.8rem' }}>Frequently Asked Questions</h2>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FAQS.map((faq, i) => {
              const open = openFaq === i
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.45, delay: i * 0.05, ease: 'easeOut' }}
                  whileHover={{ y: -2 }}
                  style={{
                    border: `1px solid ${open ? 'var(--indigo-md)' : 'var(--gray-200)'}`,
                    borderRadius: '14px',
                    background: '#fff',
                    overflow: 'hidden',
                    boxShadow: open ? '0 12px 28px rgba(79,70,229,.12)' : '0 1px 2px rgba(15,23,42,.03)',
                    transition: 'border-color .25s, box-shadow .25s',
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '18px 22px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: 600,
                      fontSize: '.96rem',
                      color: open ? 'var(--indigo)' : 'var(--gray-800)',
                    }}
                    aria-expanded={open}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                      <span
                        style={{
                          flexShrink: 0,
                          width: 30,
                          height: 30,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '9px',
                          background: open ? 'linear-gradient(135deg, var(--indigo), var(--indigo-d))' : 'var(--indigo-lt)',
                          color: open ? '#fff' : 'var(--indigo)',
                          transition: 'background .25s, color .25s',
                        }}
                      >
                        <HelpCircle size={15} strokeWidth={2.2} />
                      </span>
                      {faq.q}
                    </span>
                    <motion.span
                      animate={{ rotate: open ? 180 : 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                      style={{
                        flexShrink: 0,
                        width: '26px',
                        height: '26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        background: open ? 'var(--indigo)' : 'var(--gray-100)',
                        color: open ? '#fff' : 'var(--gray-500)',
                      }}
                    >
                      <ChevronDown size={15} strokeWidth={2.4} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p style={{
                          margin: 0,
                          padding: '0 22px 20px 66px',
                          color: 'var(--gray-600)',
                          fontSize: '.9rem',
                          lineHeight: 1.65,
                        }}>
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA Strip ── */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '88px 24px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 55%, #3730a3 100%)',
        }}
      >
        {/* drifting glow orbs */}
        <motion.div
          aria-hidden="true"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '-140px',
            left: '8%',
            width: '360px',
            height: '360px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,.16), transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <motion.div
          aria-hidden="true"
          animate={{ x: [0, -50, 0], y: [0, -20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{
            position: 'absolute',
            bottom: '-160px',
            right: '10%',
            width: '420px',
            height: '420px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(129,140,248,.28), transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <motion.div
          aria-hidden="true"
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '260px',
            background: 'radial-gradient(ellipse, rgba(255,255,255,.10), transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        <motion.div
          className="container"
          style={{ maxWidth: '620px', position: 'relative', zIndex: 1 }}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,.14)',
              border: '1px solid rgba(255,255,255,.22)',
              color: '#e0e7ff',
              fontSize: '.76rem',
              fontWeight: 700,
              letterSpacing: '.03em',
              marginBottom: '22px',
            }}
          >
            <Sparkles size={13} strokeWidth={2.4} />
            Need help deciding?
          </motion.span>

          <h2 style={{ color: '#fff', fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', marginBottom: '14px', fontWeight: 800 }}>
            Not sure which plan is right for you?
          </h2>
          <p style={{ color: 'rgba(255,255,255,.78)', marginBottom: '32px', fontSize: '1rem' }}>
            Talk to us — we&apos;ll help you pick the right fit for your firm.
          </p>

          <motion.a
            href={`mailto:${company.salesEmail}`}
            initial="rest"
            whileHover="hover"
            whileTap={{ scale: 0.97 }}
            animate="rest"
            style={{
              background: '#fff',
              color: 'var(--indigo)',
              fontWeight: 700,
              borderRadius: '10px',
              padding: '14px 26px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              fontSize: '.98rem',
              boxShadow: '0 12px 30px rgba(0,0,0,.22)',
            }}
          >
            <motion.span
              variants={{ rest: { rotate: 0 }, hover: { rotate: -12 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              style={{ display: 'inline-flex' }}
            >
              <Mail size={17} strokeWidth={2.3} />
            </motion.span>
            Contact Hash X Labs
            <motion.span
              variants={{ rest: { x: 0 }, hover: { x: 5 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              style={{ display: 'inline-flex' }}
            >
              <ArrowRight size={16} strokeWidth={2.3} />
            </motion.span>
          </motion.a>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '32px',
            }}
          >
            {[
              { icon: CalendarCheck, label: 'Annual license' },
              { icon: BadgeCheck, label: 'Excl. of GST' },
              { icon: ShieldCheck, label: 'Licensed, not sold' },
            ].map(({ icon: PillIcon, label }, i) => (
              <motion.span
                key={label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,.08)',
                  border: '1px solid rgba(255,255,255,.16)',
                  color: 'rgba(255,255,255,.7)',
                  fontSize: '.76rem',
                  fontWeight: 500,
                }}
              >
                <PillIcon size={12} strokeWidth={2.2} />
                {label}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </section>
    </>
  )
}

function thStyle(align: 'left' | 'center'): React.CSSProperties {
  return {
    textAlign: align,
    padding: '12px 16px',
    fontWeight: 700,
    fontSize: '.8rem',
    textTransform: 'uppercase',
    letterSpacing: '.05em',
    color: 'var(--gray-500)',
    borderBottom: '2px solid var(--gray-200)',
  }
}

function tdStyle(align: 'left' | 'center'): React.CSSProperties {
  return {
    textAlign: align,
    padding: '12px 16px',
    borderBottom: '1px solid var(--gray-100)',
    color: 'var(--gray-700)',
    verticalAlign: 'middle',
  }
}
