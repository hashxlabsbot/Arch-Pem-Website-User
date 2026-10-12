import { getActiveSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { Download, CreditCard, HelpCircle, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Calendar } from 'lucide-react'
import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist'
import { company } from '@/lib/company'
import { annualPrice } from '@/lib/pricing'
import { RocketIcon, ClipboardIcon, DashboardIcon } from '@/components/icons'

export default async function DashboardPage() {
  const session = await getActiveSession()
  if (!session) return null

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { plan: true },
  })

  const firstName = session.user.name?.split(' ')[0] ?? 'there'
  const initials  = session.user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'
  const planName  = user?.plan?.name ?? 'No Plan'
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '—'
  const planExpiry = user?.planExpiresAt
    ? user.planExpiresAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null
  const planExpired = !!user?.planExpiresAt && user.planExpiresAt < new Date()

  const quickLinks = [
    {
      icon: Download,
      label: 'Downloads',
      desc: 'Get the latest ARC PEM installer for Windows or Mac',
      href: '/dashboard/downloads',
      gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      colorKey: 'blue',
      badge: `v${company.product.version} available`,
    },
    {
      icon: CreditCard,
      label: 'Subscription',
      desc: 'View or upgrade your current plan',
      href: '/dashboard/subscription',
      gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
      colorKey: 'purple',
      badge: planName,
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
                style={user?.plan
                  ? { background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.25)' }
                  : { background: 'rgba(245,158,11,0.2)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.25)' }}
              >
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${user?.plan ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                {user?.plan ? 'Active' : 'Inactive'}
              </div>
            </div>
            <h2 className="text-2xl font-black mb-1.5 tracking-tight">
              Welcome back, {firstName}!
            </h2>
            <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {user?.plan
                ? planExpiry
                  ? `You're on the ${user.plan.name} plan — ${planExpired ? `your license expired on ${planExpiry}. Renew to keep access.` : `active until ${planExpiry}.`}`
                  : `You're on the ${user.plan.name} plan — enjoy full access to all features.`
                : 'You don\'t have an active license yet. Purchase a plan to unlock downloads and your license key.'}
            </p>
            {!user?.plan && (
              <a
                href="/dashboard/subscription"
                className="upgrade-btn inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl no-underline"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: 'white', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
              >
                <Sparkles size={14} />
                Upgrade Now
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
            sub: 'All systems normal',
            iconBg: 'linear-gradient(135deg, #10b981, #059669)',
            valueCls: '#10b981',
          },
          {
            icon: CreditCard,
            label: 'Current Plan',
            value: planName,
            sub: user?.plan
              ? planExpiry
                ? `${planExpired ? 'Expired' : 'Valid till'} ${planExpiry}`
                : `₹${annualPrice(user.plan.price).toLocaleString('en-IN')}/yr`
              : 'No active license',
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
      <OnboardingChecklist hasPlan={!!user?.plan} />

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

      {/* ── What's New ── */}
      <div style={{
        background: 'white', borderRadius: '20px',
        border: '1.5px solid #e2e8f0', marginTop: '20px', overflow: 'hidden',
      }}>
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>What&apos;s New</span>
            <span style={{
              fontSize: '0.68rem', fontWeight: 700, color: '#6366f1',
              background: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: '6px',
            }}>v{company.product.version}</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>June 2026</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          {[
            { icon: <RocketIcon size={22} color="#6366f1" />,    title: 'Latest Release', desc: 'ARC PEM is now live for Windows and Mac.' },
            { icon: <ClipboardIcon size={22} color="#6366f1" />, title: 'BOQ Builder',    desc: 'Full bill of quantities with line items.' },
            { icon: <DashboardIcon size={22} color="#6366f1" />, title: 'Reports',        desc: 'Export estimates as PDF & Excel.' },
          ].map(({ icon, title, desc }, i) => (
            <div key={title} style={{
              padding: '16px 18px',
              borderRight: i < 2 ? '1px solid #f1f5f9' : 'none',
            }}>
              <div style={{ marginBottom: '8px' }}>{icon}</div>
              <div style={{ fontSize: '0.83rem', fontWeight: 700, color: '#1e293b', marginBottom: '3px' }}>{title}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Plan Features ── */}
      {user?.plan && (
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
              {user.plan.name}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6">
            {(JSON.parse(user.plan.features) as string[]).map((f: string) => (
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
