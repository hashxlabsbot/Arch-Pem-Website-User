'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CountUp, Reveal, Stagger, StaggerItem } from '@/components/motion/Motion'
import ClassicHero from '@/components/home/ClassicHero'
import WhyArcPem from '@/components/home/WhyArcPem'
import ProofBand from '@/components/home/ProofBand'
import EarlyWarning from '@/components/home/EarlyWarning'
import FitsYourOffice from '@/components/home/FitsYourOffice'
import { SegmentAccordion, SiteBand, StoryMarquee } from '@/components/home/Showcase'
import {
  BellIcon, CheckIcon, ClockIcon, DashboardIcon, DocumentIcon, ExportIcon, GlobeIcon, LockIcon, PhoneIcon, ReceiptIcon, RefreshIcon, UsersIcon, WalletIcon, SaveIcon, HardHatIcon,
} from '@/components/icons'
import { company } from '@/lib/company'
import { annualSavingPct, DEFAULT_BILLING_RULES, subscriptionPrice, type BillingInterval, type BillingRules } from '@/lib/pricing'
import { isQuoted, isUnlimited } from '@/lib/plan-order'
import type { Faq, PublicPlan } from '@/lib/seo-entity'
import './home-sections.css'

const FEATURES = [
  { icon: DashboardIcon, title: 'Live dashboards', text: 'Spend, pending payments and budget burn for every project, the moment a bill is entered on site.', tone: 'ind', span: 'w-span-2' },
  { icon: UsersIcon, title: 'Roles & project access', text: 'Eight roles from Owner to Site engineer. Limit people to their projects and the areas they need.', tone: 'vio' },
  { icon: CheckIcon, title: 'Payment approvals', text: 'Nothing goes out until an Admin or Owner approves it. Every decision is recorded.', tone: 'grn' },
  { icon: ReceiptIcon, title: 'GST & GSTR-2B', text: 'GST purchase register and reconciliation against the GSTR-2B you download from the portal.', tone: 'sky' },
  { icon: DocumentIcon, title: 'Project documents', text: 'Drawings, BOQs and agreements with versions and review, in one place per project.', tone: 'ind' },
  { icon: WalletIcon, title: 'Vendor, labour & contractor ledgers', text: 'Bills, advances, settlements and TDS for every party, with statements to share.', tone: 'amb', span: 'w-span-2' },
  { icon: PhoneIcon, title: 'Built for site teams', text: 'Install it on any phone, add bills with photos, get push reminders for what’s due.', tone: 'vio' },
  { icon: ExportIcon, title: 'Tally, Excel & PDF', text: 'One-click exports your accountant already understands, branded with your firm.', tone: 'grn' },
  { icon: RefreshIcon, title: 'Change history', text: 'Who changed which entry, when, and what it was before. Nothing silently disappears.', tone: 'sky', span: 'w-span-2' },
]

const steps = (trialDays: number) => [
  trialDays > 0
    ? { n: 1, title: 'Start your free trial', text: `${trialDays} days free on Starter, Studio or Business. Set up auto-pay by card, UPI or e-mandate; nothing is charged until the trial ends.` }
    : { n: 1, title: 'Choose a plan', text: 'Starter, Studio or Business, monthly or annual. Pay by card, UPI AutoPay or e-mandate; it renews itself.' },
  { n: 2, title: 'Sign in with your ARC PEM account', text: 'Your firm’s workspace is ready at once. Bring existing projects across from Excel or the earlier desktop app.' },
  { n: 3, title: 'Invite your team', text: 'Send invites from the Team page. Each person sets their own password and lands in the right role.' },
]

const ROLES: { key: string; label: string; who: string; can: string[] }[] = [
  { key: 'owner', label: 'Owner', who: 'The firm’s principal', can: ['Everything, across every project', 'Plan and billing at arcpem.com', 'Final say on approvals'] },
  { key: 'admin', label: 'Admin', who: 'Office head or accounts lead', can: ['Invite and manage the team', 'Approve payments and documents', 'Settings, backups and exports'] },
  { key: 'pm', label: 'Project manager', who: 'Runs one or more projects', can: ['Budgets and milestones', 'Entries for their projects', 'Reports for their clients'] },
  { key: 'site', label: 'Site engineer', who: 'On site every day', can: ['Add bills, wages and site expenses', 'Attach photos of receipts', 'Only the projects they’re on'] },
  { key: 'acct', label: 'Member', who: 'Accounts or data entry', can: ['Enter and edit ledger entries', 'Pending payments and statements', 'No access to settings or team'] },
]

const SECURITY = [
  { icon: LockIcon, title: 'Isolated in the database', text: 'Row-level security keeps every firm’s rows separate, even if a query forgets to.' },
  { icon: SaveIcon, title: 'Daily backups', text: 'An automatic copy of your firm’s data every day, ready to restore or download.' },
  { icon: RefreshIcon, title: 'Every change recorded', text: 'An audit trail on the ledger, so mistakes are traceable and reversible.' },
  { icon: ClockIcon, title: 'Never held hostage', text: 'If a plan lapses your data stays readable and exportable. Nothing is deleted.' },
]


const parseFeatures = (raw: string): string[] => {
  try {
    const arr = JSON.parse(raw || '[]')
    return Array.isArray(arr) ? arr.map((f: string) => f.replace(/\bWeb (Solo|Starter|Studio|Business|Enterprise)\b/g, '$1')) : []
  } catch {
    return []
  }
}

export default function HomeClient({ plans, faqs, rules = DEFAULT_BILLING_RULES }: { plans: PublicPlan[]; faqs: Faq[]; rules?: BillingRules }) {
  const STEPS = steps(rules.trialDays)
  const reduce = useReducedMotion()
  const { data: session } = useSession()
  const [role, setRole] = useState(ROLES[0].key)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [interval, setBilling] = useState<BillingInterval>('MONTH')
  const activeRole = ROLES.find((r) => r.key === role) ?? ROLES[0]
  const popular = plans.find((p) => p.tier === 'STUDIO')?.id ?? (plans.length >= 3 ? plans[1]?.id : undefined)
  const saving = annualSavingPct(rules)
  const planHref = (name: string) => {
    const q = `plan=${encodeURIComponent(name)}&billing=${interval === 'YEAR' ? 'annual' : 'monthly'}`
    return session ? `/dashboard/subscription?${q}#web` : `/register?${q}`
  }

  return (
    <>
    <ClassicHero />
    <div className="wp">

      {/* ── Stats ── */}
      <section className="w-stats">
        <div className="container">
          <Stagger className="w-stats-grid">
            {[
              { v: <CountUp to={30} suffix="+" />, l: 'architecture and construction firms onboard' },
              { v: <CountUp to={120} prefix="₹" suffix=" Cr+" />, l: 'of project value tracked' },
              { v: <>8</>, l: 'team roles, from Owner to Site engineer' },
              { v: <>₹0</>, l: 'to set up — nothing to install or maintain' },
            ].map((s, i) => (
              <StaggerItem key={i} className="w-stat">
                <div className="w-stat-v">{s.v}</div>
                <div className="w-stat-l">{s.l}</div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <WhyArcPem />
      <SegmentAccordion />

      {/* ── Features bento ── */}
      <section className="w-section" id="features">
        <div className="container">
          <Reveal className="w-head">
            <span className="w-eyebrow">Everything a project office needs</span>
            <h2 className="w-h2">From the site to the books, <span className="w-grad">in one place</span></h2>
            <p className="w-sub">Built for a firm that works together in real time — office, accounts and site.</p>
          </Reveal>
          <Stagger className="w-bento">
            {FEATURES.map((f) => (
              <StaggerItem key={f.title} className={`w-tile ${f.span ?? ''}`}>
                <div className={`w-tile-ico ${f.tone}`}><f.icon size={20} /></div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
                <div className="w-tile-glow" aria-hidden />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <SiteBand />
      <FitsYourOffice />
      <EarlyWarning />

      {/* ── How it works ── */}
      <section className="w-section w-section-tint">
        <div className="container">
          <Reveal className="w-head">
            <span className="w-eyebrow">Live in three steps</span>
            <h2 className="w-h2">From sign-up to your first entry <span className="w-grad">in minutes</span></h2>
          </Reveal>
          <div className="w-steps">
            <motion.div
              className="w-steps-line"
              initial={reduce ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '0px 0px -20% 0px' }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden
            />
            {STEPS.map((s, i) => (
              <Reveal key={s.n} className="w-step" delay={0.15 * i}>
                <div className="w-step-n">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section className="w-section">
        <div className="container w-roles">
          <Reveal className="w-roles-copy">
            <span className="w-eyebrow">The right access for everyone</span>
            <h2 className="w-h2">Your whole team, <span className="w-grad">one source of truth</span></h2>
            <p className="w-sub">
              Invite partners, accounts staff and site teams. Each person sees exactly the projects and areas their role
              allows, and every entry is signed with who made it.
            </p>
            <div className="w-role-tabs" role="tablist" aria-label="Roles">
              {ROLES.map((r) => (
                <button
                  key={r.key}
                  role="tab"
                  aria-selected={role === r.key}
                  className={`w-role-tab${role === r.key ? ' on' : ''}`}
                  onClick={() => setRole(r.key)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="w-role-card">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeRole.key}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-role-top">
                    <div className="w-role-avatar">{activeRole.label.slice(0, 1)}</div>
                    <div>
                      <div className="w-role-name">{activeRole.label}</div>
                      <div className="w-role-who">{activeRole.who}</div>
                    </div>
                  </div>
                  <ul className="w-role-list">
                    {activeRole.can.map((c) => (
                      <li key={c}><span><CheckIcon size={13} /></span>{c}</li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </section>

      <ProofBand />
      <StoryMarquee />

      {/* ── Security ── */}
      <section className="w-section w-dark">
        <div className="w-dark-glow" aria-hidden />
        <div className="container">
          <Reveal className="w-head">
            <span className="w-eyebrow light">Security by design</span>
            <h2 className="w-h2 light">Your firm’s money data, <span className="w-grad-light">locked to your firm</span></h2>
          </Reveal>
          <Stagger className="w-sec-grid">
            {SECURITY.map((s) => (
              <StaggerItem key={s.title} className="w-sec">
                <div className="w-sec-ico"><s.icon size={20} /></div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── Plans ── */}
      <section className="w-section w-section-tint" id="plans">
        <div className="container">
          <Reveal className="w-head">
            <span className="w-eyebrow">Simple plans, monthly or annual</span>
            <h2 className="w-h2">One subscription <span className="w-grad">for your whole firm</span></h2>
            <p className="w-sub">
              Every plan has every feature — choose by team size and projects.{rules.trialDays > 0 ? ` ${rules.trialDays}-day free trial,` : ''} cancel anytime. Prices in ₹,{' '}
              {company.pricesIncludeGst ? `including ${company.gstRatePct}% GST` : `plus ${company.gstRatePct}% GST`}.
            </p>
            <div role="radiogroup" aria-label="Billing cycle" className="bill-toggle">
              {(['MONTH', 'YEAR'] as const).map((i) => (
                <button key={i} role="radio" aria-checked={interval === i} onClick={() => setBilling(i)} className={interval === i ? 'on' : ''}>
                  {interval === i && <motion.span layoutId="home-bill-pill" className="bill-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                  <span className="bill-label">
                    {i === 'MONTH' ? 'Monthly' : 'Annual'}
                    {i === 'YEAR' && saving > 0 && <em>Save {saving}%</em>}
                  </span>
                </button>
              ))}
            </div>
          </Reveal>
          {plans.length === 0 ? (
            <p className="w-sub" style={{ textAlign: 'center' }}>
              <Link href="/pricing">See current plans and prices</Link>
            </p>
          ) : (
            <Stagger className={`w-plans${plans.length === 4 ? ' w-plans-4' : ''}`}>
              {plans.map((p) => {
                const name = p.name.replace(/^web\s+/i, '')
                const quoted = isQuoted(p)
                const price = subscriptionPrice(p.price, interval, undefined, rules)
                const site = p.maxSiteUsers ?? 0
                return (
                  <StaggerItem key={p.id} className={`w-plan${p.id === popular ? ' pop' : ''}`}>
                    {p.id === popular && <div className="w-plan-badge">Most popular</div>}
                    <div className="w-plan-name">{name}</div>
                    {quoted ? (
                      <div className="w-plan-price">Custom</div>
                    ) : (
                      <div className="w-plan-price">
                        <span>₹</span>{price.toLocaleString('en-IN')}<small>/{interval === 'MONTH' ? 'month' : 'year'}</small>
                      </div>
                    )}
                    <div className="w-plan-month">
                      {quoted
                        ? 'Annual agreement for large firms'
                        : interval === 'MONTH'
                          ? 'Billed monthly · auto-renews'
                          : `Billed annually · ≈ ₹${Math.round(price / 12).toLocaleString('en-IN')}/month`}
                    </div>
                    <div className="w-plan-limits">
                      <span><UsersIcon size={13} /> {p.maxUsers}{quoted ? '+' : ''} seats</span>
                      <span><HardHatIcon size={13} /> {isUnlimited(site) ? 'Unlimited' : site} site</span>
                      <span><GlobeIcon size={13} /> {isUnlimited(p.maxProjects) ? 'Unlimited' : p.maxProjects} projects</span>
                    </div>
                    <ul>
                      {parseFeatures(p.features).slice(0, 5).map((f) => (
                        <li key={f}><CheckIcon size={13} /> {f}</li>
                      ))}
                    </ul>
                    {quoted ? (
                      <a href={`mailto:${company.salesEmail}?subject=${encodeURIComponent('ARC PEM Enterprise')}`} className="w-btn w-btn-outline w-btn-block">
                        Talk to sales
                      </a>
                    ) : (
                      <Link href={planHref(p.name)} className={`w-btn ${p.id === popular ? 'w-btn-primary' : 'w-btn-outline'} w-btn-block`}>
                        {rules.trialDays > 0 ? 'Start free trial' : `Get ${name}`}
                      </Link>
                    )}
                  </StaggerItem>
                )
              })}
            </Stagger>
          )}
          <Reveal className="w-plans-note">
            <BellIcon size={14} /> Extra team seats ₹{rules.seatAddonMonthly}/month · site seats ₹{rules.siteSeatAddonMonthly}/month · card, UPI AutoPay or e-mandate · GST invoice every cycle
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="w-section" id="faq">
        <div className="container w-faq-wrap">
          <Reveal className="w-head">
            <span className="w-eyebrow">Questions</span>
            <h2 className="w-h2">ARC PEM, <span className="w-grad">answered</span></h2>
          </Reveal>
          <div className="w-faq">
            {faqs.map((f, i) => (
              <div key={f.q} className={`w-faq-item${openFaq === i ? ' open' : ''}`}>
                <button className="w-faq-q" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{f.q}</span>
                  <span className="w-faq-plus" aria-hidden>+</span>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      className="w-faq-a"
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduce ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p>{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Every answer stays in the HTML for crawlers and answer engines. */}
                {openFaq !== i && <p className="w-sr-only">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
    </>
  )
}
