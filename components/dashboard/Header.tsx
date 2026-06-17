'use client'

import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useRef, useState, useEffect } from 'react'
import { Bell, ChevronRight, Zap, Download, X, ArrowRight, Menu } from 'lucide-react'

const TITLES: Record<string, { label: string; desc: string }> = {
  '/dashboard':              { label: 'Dashboard',    desc: 'Overview of your account'  },
  '/dashboard/subscription': { label: 'Subscription', desc: 'Manage your plan'          },
  '/dashboard/downloads':    { label: 'Downloads',    desc: 'Get the latest software'   },
  '/dashboard/support':      { label: 'Support',      desc: 'Help & resources'          },
  '/dashboard/settings':     { label: 'Settings',     desc: 'Account preferences'       },
}

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const path    = usePathname()
  const { data: session } = useSession()
  const page    = TITLES[path] ?? { label: 'Dashboard', desc: '' }

  const initials = session?.user?.name
    ?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  const isFree = !session?.user?.planName || session.user.planName === 'Free Trial'

  const NOTIFS = [
    ...(isFree ? [{
      id: 'upgrade',
      icon: Zap,
      iconBg: 'rgba(99,102,241,0.12)',
      iconColor: '#6366f1',
      title: 'Upgrade your plan',
      body: 'Unlock downloads and your license key with a paid plan.',
      href: '/dashboard/subscription',
      cta: 'View Plans',
      time: 'Now',
    }] : []),
    {
      id: 'v1',
      icon: Download,
      iconBg: 'rgba(59,130,246,0.1)',
      iconColor: '#3b82f6',
      title: 'ARC PEM v1.0.0 is available',
      body: 'The initial release is live. Download from the Downloads page.',
      href: '/dashboard/downloads',
      cta: 'Download',
      time: 'New',
    },
  ]

  const [open,     setOpen]     = useState(false)
  const [dismissed, setDismissed] = useState<string[]>([])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const visible = NOTIFS.filter(n => !dismissed.includes(n.id))
  const hasNew  = visible.length > 0

  return (
    <header className="sticky top-0 h-16 bg-white flex items-center px-4 md:px-6 gap-3 z-20" style={{ borderBottom: '1px solid #f1f5f9' }}>

      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer' }}
      >
        <Menu size={16} style={{ color: '#64748b' }} />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>ARC PEM</span>
        <ChevronRight size={12} style={{ color: '#cbd5e1' }} />
        <span className="text-sm font-bold" style={{ color: '#0f172a' }}>{page.label}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">

        {/* Bell + dropdown */}
        <div ref={ref} style={{ position: 'relative' }}>
          <button
            onClick={() => setOpen(!open)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: open ? '#f1f5f9' : '#f8fafc',
              border: `1px solid ${open ? '#d1d5db' : '#e2e8f0'}`,
              cursor: 'pointer',
            }}
          >
            <Bell size={15} style={{ color: '#64748b' }} />
            {hasNew && (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', border: '1.5px solid white' }}
              />
            )}
          </button>

          {open && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: 'min(320px, calc(100vw - 32px))', background: 'white', borderRadius: '18px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              zIndex: 100, overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                padding: '14px 18px', borderBottom: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                  Notifications
                </span>
                {visible.length > 0 && (
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, color: '#6366f1',
                    background: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: '6px',
                  }}>
                    {visible.length} new
                  </span>
                )}
              </div>

              {/* Notification list */}
              {visible.length === 0 ? (
                <div style={{ padding: '28px 18px', textAlign: 'center', color: '#94a3b8', fontSize: '0.84rem' }}>
                  You're all caught up!
                </div>
              ) : (
                <div>
                  {visible.map(({ id, icon: Icon, iconBg, iconColor, title, body, href, cta, time }) => (
                    <div key={id} style={{
                      padding: '14px 18px', borderBottom: '1px solid #f8fafc',
                      display: 'flex', gap: '12px', alignItems: 'flex-start',
                    }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: iconBg, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={16} color={iconColor} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span style={{ fontSize: '0.83rem', fontWeight: 700, color: '#0f172a' }}>{title}</span>
                          <button
                            onClick={() => setDismissed(d => [...d, id])}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: 0, display: 'flex' }}
                          >
                            <X size={13} />
                          </button>
                        </div>
                        <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '0 0 8px', lineHeight: 1.5 }}>{body}</p>
                        <a
                          href={href}
                          onClick={() => setOpen(false)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            fontSize: '0.75rem', fontWeight: 700, color: iconColor,
                            textDecoration: 'none',
                          }}
                        >
                          {cta} <ArrowRight size={11} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '20px', background: '#e2e8f0' }} />

        {/* User avatar + name */}
        <a href="/dashboard/settings" style={{ display: 'flex', alignItems: 'center', gap: '2.5px', textDecoration: 'none' }}>
          <div className="text-right hidden sm:block" style={{ marginRight: '6px' }}>
            <div className="text-xs font-semibold" style={{ color: '#1e293b' }}>
              {session?.user?.name ?? 'User'}
            </div>
            <div className="text-[10px]" style={{ color: '#94a3b8' }}>
              {session?.user?.planName ?? 'Free Trial'}
            </div>
          </div>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
          >
            {initials}
          </div>
        </a>
      </div>
    </header>
  )
}
