'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, X, CreditCard, Globe, Users, UserCheck } from 'lucide-react'

interface Props {
  hasPlan: boolean
}

const STEPS = [
  {
    icon: UserCheck,
    label: 'Create your account',
    desc:  'You\'re registered and signed in.',
    done:  true,
    href:  null,
  },
  {
    icon: CreditCard,
    label: 'Choose a plan',
    desc:  'Monthly or annual, renewed automatically. Cancel anytime.',
    done:  false,
    href:  '/dashboard/subscription',
  },
  {
    icon: Globe,
    label: 'Open ARC PEM',
    desc:  'Sign in with this account; your firm\'s workspace is ready.',
    done:  false,
    href:  null,
  },
  {
    icon: Users,
    label: 'Invite your team',
    desc:  'Add office and site staff with roles from the Team page in the app.',
    done:  false,
    href:  null,
  },
]

export default function OnboardingChecklist({ hasPlan }: Props) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('onboarding-dismissed') === '1') setDismissed(true)
  }, [])

  if (dismissed || hasPlan) return null

  function dismiss() {
    localStorage.setItem('onboarding-dismissed', '1')
    setDismissed(true)
  }

  const steps = STEPS.map((s, i) => ({
    ...s,
    done: i === 0 ? true : i === 1 ? hasPlan : false,
  }))

  const completedCount = steps.filter(s => s.done).length
  const pct            = Math.round((completedCount / steps.length) * 100)

  return (
    <div style={{
      background: 'white', borderRadius: '20px',
      border: '1.5px solid #e2e8f0', marginBottom: '20px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px 14px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(59,130,246,0.04))',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
              Get started with ARC PEM
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6366f1' }}>
              {completedCount}/{steps.length} done
            </span>
          </div>
          <div style={{ height: '5px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${pct}%`,
              background: 'linear-gradient(90deg, #6366f1, #3b82f6)',
              borderRadius: '3px', transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
        <button
          onClick={dismiss}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: '2px', display: 'flex', flexShrink: 0 }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Steps: one column on phones, two on tablets (the dashboard sidebar takes 256px from 768px), four from
          1280px. The 1px gaps over a tinted background draw the dividers for any column count. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" style={{ gap: '1px', background: '#f1f5f9' }}>
        {steps.map(({ icon: Icon, label, desc, done, href }, i) => {
          const content = (
            <div style={{
              padding: '16px 16px 18px',
              height: '100%',
              background: 'white',
              cursor: href ? 'pointer' : 'default',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => { if (href) (e.currentTarget as HTMLDivElement).style.background = '#fafbff' }}
              onMouseLeave={e => { if (href) (e.currentTarget as HTMLDivElement).style.background = 'white' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '10px',
                  background: done ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={16} color={done ? '#10b981' : '#6366f1'} />
                </div>
                {done
                  ? <CheckCircle2 size={16} color="#10b981" />
                  : <Circle size={16} color="#d1d5db" />}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: done ? '#10b981' : '#1e293b', marginBottom: '3px' }}>
                {label}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.5 }}>
                {desc}
              </div>
            </div>
          )

          return href ? (
            <a key={i} href={href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
              {content}
            </a>
          ) : (
            <div key={i} style={{ height: '100%' }}>{content}</div>
          )
        })}
      </div>
    </div>
  )
}
