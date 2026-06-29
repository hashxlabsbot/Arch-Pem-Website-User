import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  Download, Shield, Cpu, Monitor, HardDrive,
  CheckCircle2, Lock, Package, Zap, Apple,
  AlertTriangle, Mail, Clock
} from 'lucide-react'
import { company } from '@/lib/company'

const STEPS = [
  { icon: Lock,        label: 'Verified',    desc: 'Login checked before download starts'   },
  { icon: Download,    label: 'Download',    desc: 'Installer streamed securely to you'      },
  { icon: Package,     label: 'Install',     desc: 'Run the .exe and follow the wizard'      },
  { icon: Zap,         label: 'Activate',    desc: 'Enter your license key to unlock'        },
]

const REQUIREMENTS = [
  { label: 'OS',        value: 'Windows 10 / 11 (64-bit)',    icon: Monitor   },
  { label: 'CPU',       value: 'Intel i3+ or AMD Ryzen 3+',   icon: Cpu       },
  { label: 'RAM',       value: '4 GB minimum (8 GB ideal)',    icon: HardDrive },
  { label: 'Storage',   value: '500 MB free space',            icon: HardDrive },
]

export default async function DownloadsPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { plan: true },
  })

  const hasActivePlan = !!user?.plan

  return (
    <div style={{ maxWidth: '820px', paddingBottom: '40px' }}>

      {/* ── Hero card ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1e3a5f 100%)',
        borderRadius: '24px',
        padding: '32px',
        marginBottom: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative glow */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-40px',
          width: '260px', height: '260px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>

          {/* Left — branding */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Package size={22} style={{ color: 'white' }} />
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  ARC PEM Desktop
                </div>
                <div style={{ color: 'white', fontSize: '1.6rem', fontWeight: 900, lineHeight: 1.1 }}>
                  Version {company.product.version}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
              {['Windows 10 / 11', '64-bit', company.product.releaseLabel].map(tag => (
                <span key={tag} style={{
                  fontSize: '0.7rem', fontWeight: 600, padding: '3px 9px', borderRadius: '100px',
                  background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}>
                  {tag}
                </span>
              ))}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
              BOQ · Manpower · Material · Site Diary · Tally Export
            </div>
          </div>

          {/* Right — download buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '230px' }}>

            {/* Windows — primary */}
            <a href="/api/download?platform=win" style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white', borderRadius: '14px', padding: '13px 18px',
              textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem',
              boxShadow: '0 6px 24px rgba(59,130,246,0.45)',
              transition: 'opacity 0.15s',
            }}>
              {/* Windows logo */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0 }}>
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
              </svg>
              <div>
                <div>Download for Windows</div>
                <div style={{ fontSize: '0.68rem', fontWeight: 500, opacity: 0.8, marginTop: '1px' }}>
                  .exe installer · 97 MB
                </div>
              </div>
              <Download size={15} style={{ marginLeft: 'auto', opacity: 0.8 }} />
            </a>

            {/* Mac — coming soon */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.18)',
              color: 'rgba(255,255,255,0.45)', borderRadius: '14px', padding: '13px 18px',
              fontSize: '0.88rem', fontWeight: 600, cursor: 'not-allowed',
            }}>
              <Apple size={20} style={{ flexShrink: 0 }} />
              <div>
                <div>Download for Mac</div>
                <div style={{ fontSize: '0.68rem', fontWeight: 500, opacity: 0.7, marginTop: '1px' }}>
                  Coming soon
                </div>
              </div>
              <Clock size={14} style={{ marginLeft: 'auto' }} />
            </div>

          </div>
        </div>
      </div>

      {/* ── How download works ── */}
      <div style={{
        background: 'white', borderRadius: '20px', padding: '22px 24px',
        border: '1px solid #f1f5f9', marginBottom: '16px',
      }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
          How it works
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
          {STEPS.map((step, i) => (
            <div key={step.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
              {/* connector line */}
              {i < STEPS.length - 1 && (
                <div style={{
                  position: 'absolute', top: '18px', left: 'calc(50% + 18px)', right: '-50%',
                  height: '2px', background: 'linear-gradient(90deg, #e2e8f0, #f8fafc)',
                  zIndex: 0,
                }} />
              )}
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: i === 0 ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : '#f8fafc',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '8px', position: 'relative', zIndex: 1,
                border: i === 0 ? 'none' : '1px solid #e2e8f0',
              }}>
                <step.icon size={15} style={{ color: i === 0 ? 'white' : '#64748b' }} />
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', marginBottom: '3px' }}>{step.label}</div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', lineHeight: 1.4 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>

        {/* ── License key ── */}
        <div style={{
          background: 'white', borderRadius: '20px', padding: '22px 24px',
          border: '1px solid #f1f5f9',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              License Activation
            </div>
            {hasActivePlan ? (
              <span style={{
                fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '100px',
                background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)',
              }}>
                ● Plan Active
              </span>
            ) : (
              <span style={{
                fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '100px',
                background: 'rgba(245,158,11,0.1)', color: '#d97706', border: '1px solid rgba(245,158,11,0.2)',
              }}>
                No License
              </span>
            )}
          </div>

          {hasActivePlan ? (
            <>
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: '10px', padding: '12px 14px', marginBottom: '10px',
              }}>
                <Mail size={15} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.76rem', color: '#065f46', lineHeight: 1.55 }}>
                  Your plan is active. Install the app, then email us your <strong>Machine ID</strong>{' '}
                  (shown in the app under Settings → License). We&apos;ll issue your device-locked
                  license key by email — usually within a few business hours.
                </div>
              </div>
              <a href={`mailto:${company.supportEmail}?subject=ARC PEM License Activation&body=My plan is active. My Machine ID is: `} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                fontSize: '0.78rem', fontWeight: 700, padding: '9px 16px',
                background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white',
                borderRadius: '10px', textDecoration: 'none', textAlign: 'center',
              }}>
                <Mail size={14} /> Send Machine ID to activate
              </a>
            </>
          ) : (
            <div>
              <div style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.55, marginBottom: '10px' }}>
                Purchase a plan to receive a device-locked license key. Until then the app
                runs with limited access.
              </div>
              <a href="/dashboard/subscription" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                fontSize: '0.78rem', fontWeight: 700, padding: '9px 16px',
                background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: 'white',
                borderRadius: '10px', textDecoration: 'none', textAlign: 'center',
              }}>
                Upgrade to get your key →
              </a>
            </div>
          )}
        </div>

        {/* ── System requirements ── */}
        <div style={{
          background: 'white', borderRadius: '20px', padding: '22px 24px',
          border: '1px solid #f1f5f9',
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
            System Requirements
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {REQUIREMENTS.map(({ label, value, icon: Icon }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                  background: '#f8fafc', border: '1px solid #f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={13} style={{ color: '#64748b' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1e293b' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Trust strip ── */}
      <div style={{
        background: 'white', borderRadius: '20px', padding: '18px 24px',
        border: '1px solid #f1f5f9',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px',
      }}>
        {[
          { icon: Shield,       label: 'Secure download',    desc: 'Login required before file is served' },
          { icon: CheckCircle2, label: 'No third-party CDN', desc: 'File served directly from our server'  },
          { icon: Lock,         label: 'License protected',  desc: 'RSA-2048 machine-locked activation'    },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
              background: 'rgba(59,130,246,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={15} style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>{label}</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px', lineHeight: 1.4 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── No-license notice ── */}
      {!hasActivePlan && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: '16px', padding: '14px 18px', marginTop: '16px',
        }}>
          <AlertTriangle size={15} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
          <div style={{ fontSize: '0.78rem', color: '#78350f' }}>
            <strong>No active license:</strong> You can download and install, but you&apos;ll need a license key to unlock full access.{' '}
            <a href="/dashboard/subscription" style={{ color: '#d97706', fontWeight: 700, textDecoration: 'underline' }}>
              Purchase a plan
            </a>{' '}
            to receive your key.
          </div>
        </div>
      )}

    </div>
  )
}
