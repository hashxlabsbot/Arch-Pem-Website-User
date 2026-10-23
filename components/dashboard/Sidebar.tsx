'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { LayoutDashboard, CreditCard, Download, HelpCircle, LogOut, Settings } from 'lucide-react'

const NAV = [
  { label: 'Dashboard',    href: '/dashboard',              icon: LayoutDashboard },
  { label: 'Subscription', href: '/dashboard/subscription', icon: CreditCard },
  // Shown only to customers with a legacy desktop licence (see below).
  { label: 'Downloads',    href: '/dashboard/downloads',    icon: Download },
  { label: 'Support',      href: '/dashboard/support',      icon: HelpCircle },
  { label: 'Settings',     href: '/dashboard/settings',     icon: Settings },
]

interface Props {
  isOpen:  boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: Props) {
  const path    = usePathname()
  const { data: session } = useSession()
  const [signOutHover, setSignOutHover] = useState(false)

  // On phones the sidebar is a drawer: Escape closes it, as with any overlay.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const initials = session?.user?.name
    ?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  const planName = session?.user?.planName ?? 'No Plan'

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 w-64 flex flex-col z-40
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
        style={{ background: 'linear-gradient(180deg, #0a0f1e 0%, #0f172a 100%)' }}
      >
        {/* Top accent line */}
        <div className="h-0.5 w-full flex-shrink-0" style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)' }} />

        {/* Logo */}
        <div className="px-5 py-5 flex-shrink-0">
          <Link href="/" className="flex items-center gap-3 no-underline group">
            <img
              src="/arc-icon.png"
              alt="ARC PEM"
              width={38}
              height={38}
              className="flex-shrink-0 rounded-[11px]"
              style={{ display: 'block', boxShadow: '0 2px 12px rgba(59,130,246,0.35)' }}
            />
            <div className="flex flex-col leading-none">
              <span
                className="text-white font-extrabold tracking-tight"
                style={{ fontFamily: "var(--font-display), 'Plus Jakarta Sans', sans-serif", fontSize: '1.02rem' }}
              >
                ARC PEM
              </span>
              <span className="text-[11px] font-medium mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Project Expense Manager
              </span>
            </div>
          </Link>
        </div>

        {/* Divider */}
        <div className="mx-5 mb-4 flex-shrink-0" style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

        {/* Nav label */}
        <div className="px-5 mb-2 flex-shrink-0">
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>Menu</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto">
          {NAV.filter((n) => n.href !== '/dashboard/downloads' || session?.user?.hasDesktop).map(({ label, href, icon: Icon }) => {
            const active = href === '/dashboard' ? path === '/dashboard' : path.startsWith(href)
            return (
              <a
                key={href}
                href={href}
                onClick={onClose}
                className="no-underline"
                style={{ textDecoration: 'none' }}
              >
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150${!active ? ' sidebar-nav-inactive' : ''}`}
                  style={active ? {
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(99,102,241,0.15))',
                    color: '#fff',
                    border: '1px solid rgba(99,102,241,0.3)',
                  } : {
                    color: 'rgba(255,255,255,0.45)',
                    border: '1px solid transparent',
                  }}
                >
                  <div
                    className={`sidebar-nav-icon w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all`}
                    style={active ? {
                      background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                      boxShadow: '0 0 12px rgba(99,102,241,0.5)',
                    } : {
                      background: 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <Icon size={14} style={{ color: active ? '#fff' : 'rgba(255,255,255,0.5)' }} />
                  </div>
                  <span>{label}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#60a5fa' }} />
                  )}
                </div>
              </a>
            )
          })}
        </nav>

        {/* Bottom user section */}
        <div className="mx-3 mb-4 p-3 rounded-2xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white text-xs font-semibold truncate">{session?.user?.name ?? 'User'}</div>
              <div
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full inline-block mt-0.5"
                style={{ background: 'rgba(59,130,246,0.2)', color: '#93c5fd' }}
              >
                {planName}
              </div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-xs font-medium transition-all"
            onMouseEnter={() => setSignOutHover(true)}
            onMouseLeave={() => setSignOutHover(false)}
            style={{
              color:      signOutHover ? '#f87171'                    : 'rgba(255,255,255,0.35)',
              background: signOutHover ? 'rgba(239,68,68,0.08)'       : 'transparent',
              border: 'none', cursor: 'pointer',
              transition: 'color 0.15s, background 0.15s',
            }}
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
