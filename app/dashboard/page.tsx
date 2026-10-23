import { getActiveSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { Download, CreditCard, HelpCircle, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Calendar, ExternalLink, Users, Smartphone, FileCheck2 } from 'lucide-react'
import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist'
import { company } from '@/lib/company'
import { env } from '@/lib/env'

export default async function DashboardPage() {
  const session = await getActiveSession()
  if (!session) return null

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { plan: true, webSubscription: { include: { plan: true } } },
  })

  const day = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })
  const firstName = session.user.name?.split(' ')[0] ?? 'there'
  const initials  = session.user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'
  const sub = user?.webSubscription ?? null
  const desktop = user?.plan ?? null
  const planName = sub ? sub.plan.name.replace(/^web\s+/i, 'ARC PEM ') : desktop?.name ?? 'No plan yet'
  const end = sub?.currentPeriodEnd ?? null
  const active = Boolean(sub && sub.status !== 'CANCELED' && sub.status !== 'SUSPENDED' && (!end || end > new Date()))
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '—'
  const appUrl = env.webAppUrl()
  const openApp = appUrl ? `${appUrl}/auth/arcpem` : null
  const renewal = !sub || !end
    ? null
    : !active
      ? `Ended on ${day(end)}`
      : sub.trialEndsAt
        ? `Free trial until ${day(end)}${sub.autoRenew ? ' · first payment then' : ' · auto-renew off, nothing will be charged'}`
        : sub.autoRenew
        ? `Renews automatically on ${day(end)}`
        : `Active until ${day(end)} · auto-renew off`

  const quickLinks = [
    ...(active && openApp
      ? [{
          icon: ExternalLink,
          label: 'Open ARC PEM',
          desc: 'Go to your firm’s workspace: projects, ledgers, approvals and reports',
          href: openApp,
          gradient: 'linear-gradient(135deg, #7c3aed, #6366f1)',
          colorKey: 'purple',
          badge: 'app.arcpem.com',
        }]
      : []),
    {
      icon: CreditCard,
      label: 'Subscription',
      desc: sub ? 'Change plan, billing cycle or auto-renew' : 'Choose a plan, monthly or annual',
      href: '/dashboard/subscription',
      gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)',
      colorKey: 'blue',
      badge: sub ? (sub.billingInterval === 'MONTH' ? 'Monthly' : 'Annual') : 'From monthly',
    },
    {
      icon: HelpCircle,
      label: 'Support',
      desc: 'Raise a ticket or chat with our team',
      href: '/dashboard/support',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      colorKey: 'green',
      badge: 'Mon–Fri',
    },
    // Customers from before ARC PEM moved to the web keep their installers.
    ...(desktop
      ? [{
          icon: Download,
          label: 'Desktop downloads',
          desc: 'Installers for your existing desktop licence',
          href: '/dashboard/downloads',
          gradient: 'linear-gradient(135deg, #64748b, #475569)',
          colorKey: 'blue',
          badge: `v${company.product.version}`,
        }]
      : []),
  ]

  return (
    <div style={{ maxWidth: '900px' }}>

      {/* ── Welcome hero ── */}
      <div
        className="relative overflow-hidden rounded-2xl p-7 mb-6 text-white"
        style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0f1f45 50%, #1e1b4b 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute -bottom-8 right-32 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(99,102,241,0.25)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}
              >
                {planName}
              </div>
              <div
                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1"
                style={active
                  ? { background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.25)' }
                  : { background: 'rgba(245,158,11,0.2)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.25)' }}
              >
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${active ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                {active ? 'Active' : sub ? 'Inactive' : 'Not subscribed'}
              </div>
            </div>
            <h2 className="text-2xl font-black mb-1.5 tracking-tight" style={{ color: '#fff' }}>
              Welcome back, {firstName}!
            </h2>
            <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {active
                ? `Your firm is on ${planName}. ${renewal}.`
                : sub
                  ? 'Your plan has ended. Renew to keep your team working — your data is safe and waiting.'
                  : 'Pick a plan, monthly or annual, and your firm’s ARC PEM workspace is ready the moment payment completes.'}
            </p>
            {active && openApp ? (
              <a
                href={openApp}
                className="upgrade-btn inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl no-underline"
                style={{ background: 'linear-gradient(100deg, #7c3aed, #6366f1 50%, #3b82f6)', color: 'white', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
              >
                Open ARC PEM <ExternalLink size={14} />
              </a>
            ) : (
              <a
                href="/dashboard/subscription"
                className="upgrade-btn inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl no-underline"
                style={{ background: 'linear-gradient(100deg, #7c3aed, #6366f1 50%, #3b82f6)', color: 'white', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
              >
                <Sparkles size={14} />
                {sub ? 'Renew now' : 'Choose a plan'}
                <ArrowRight size={14} />
              </a>
            )}
          </div>
          {/* Avatar */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: '2px solid rgba(255,255,255,0.15)' }}
          >
            {initials}
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            icon: ShieldCheck,
            label: 'Account Status',
            value: 'Active',
            sub: sub ? `${sub.seatLimit ?? sub.plan.maxUsers} seats · ${sub.projectLimit ?? sub.plan.maxProjects} projects` : 'All systems normal',
            iconBg: 'linear-gradient(135deg, #10b981, #059669)',
            valueCls: '#10b981',
          },
          {
            icon: CreditCard,
            label: 'Current Plan',
            value: planName,
            sub: renewal ?? (desktop ? 'Desktop licence' : 'Not subscribed yet'),
            iconBg: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            valueCls: '#1e293b',
          },
          {
            icon: Calendar,
            label: 'Member Since',
            value: memberSince,
            sub: 'Thank you for trusting us',
            iconBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
            valueCls: '#1e293b',
          },
        ].map(({ icon: Icon, label, value, sub, iconBg, valueCls }) => (
          <div
            key={label}
            className="stat-card rounded-2xl p-5 bg-white flex items-center gap-4"
            style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: iconBg }}
            >
              <Icon size={18} color="white" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#94a3b8' }}>{label}</div>
              <div className="text-sm font-black truncate" style={{ color: valueCls }}>{value}</div>
              <div className="text-[10px] truncate" style={{ color: '#cbd5e1' }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Onboarding checklist (no active plan only) ── */}
      <OnboardingChecklist hasPlan={Boolean(sub)} />

      {/* ── Quick Actions ── */}
      <div className="mb-2">
        <h3 className="text-sm font-black mb-4" style={{ color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map(({ icon: Icon, label, desc, href, gradient, colorKey, badge }) => (
            <a
              key={href}
              href={href}
              className="no-underline"
            >
              <div
                className={`dash-action-card ${colorKey} rounded-2xl p-5 bg-white h-full flex flex-col`}
                style={{
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: gradient, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                >
                  <Icon size={19} color="white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-black mb-1" style={{ color: '#0f172a' }}>{label}</div>
                  <div className="text-xs leading-relaxed mb-4" style={{ color: '#94a3b8' }}>{desc}</div>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: '#f1f5f9', color: '#64748b' }}
                  >
                    {badge}
                  </span>
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ background: '#f1f5f9' }}
                  >
                    <ArrowRight size={12} style={{ color: '#94a3b8' }} />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* ── What's in ARC PEM ── */}
      <div style={{ background: 'white', borderRadius: '20px', border: '1.5px solid #e2e8f0', marginTop: '20px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>Made for the whole firm</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
          {[
            { Icon: Users, title: 'Your team, your roles', desc: 'Invite office and site staff; choose what each person can see and approve.' },
            { Icon: Smartphone, title: 'On every device', desc: 'Add bills with receipt photos from site; install it on your phone like an app.' },
            { Icon: FileCheck2, title: 'GST & Tally ready', desc: 'GSTR-2B reconciliation, TDS register and Tally export every month.' },
          ].map(({ Icon, title, desc }, i) => (
            <div key={title} style={{ padding: '16px 18px', borderRight: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ marginBottom: '8px' }}><Icon size={20} color="#6366f1" /></div>
              <div style={{ fontSize: '0.83rem', fontWeight: 700, color: '#1e293b', marginBottom: '3px' }}>{title}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Plan Features ── */}
      {(sub?.plan ?? desktop) && (
        <div
          className="rounded-2xl p-6 mt-6 bg-white"
          style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black" style={{ color: '#0f172a' }}>
              Your Plan Includes
            </h3>
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(99,102,241,0.12))', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              {planName}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6">
            {(JSON.parse((sub?.plan ?? desktop)!.features) as string[]).map((f) => f.replace(/\bWeb (Solo|Studio|Enterprise)\b/g, '$1')).map((f: string) => (
              <div key={f} className="flex items-center gap-2.5 text-xs" style={{ color: '#475569' }}>
                <CheckCircle2 size={13} style={{ color: '#10b981', flexShrink: 0 }} />
                {f}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
