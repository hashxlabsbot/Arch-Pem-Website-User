'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDemoModal } from '@/components/marketing/DemoModalContext'

export default function PricingPage() {
  const router = useRouter()
  const openDemo = useDemoModal()
  const [compareOpen, setCompareOpen] = useState(false)

  function openSignupWithPlan(planName: string) {
    router.push(`/register?plan=${planName}`)
  }
  function showCompare() { setCompareOpen(true); document.body.style.overflow = 'hidden' }
  function hideCompare() { setCompareOpen(false); document.body.style.overflow = '' }

  return (
    <>
      {/* ── Pricing ── */}
      <section className="section bg-gray" id="pricing" style={{ overflow: 'visible', paddingTop: '120px' }}>
        <div className="container">
          <div className="sec-hd fade-up">
            <span className="badge badge-indigo">Pricing</span>
            <h2>Simple, Transparent Pricing</h2>
            <p>One license. One machine. No hidden fees. Cancel anytime. Updates included for 12 months. Your data stays yours — always.</p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card fade-up">
              <div className="plan-tier" style={{ color: 'var(--gray-500)' }}>Solo</div>
              <div className="plan-price"><span className="plan-cur">₹</span><span className="plan-num">4,999</span><span className="plan-per">/month</span></div>
              <p className="plan-desc">For individual architects managing up to 10 active projects on a single machine.</p>
              <ul className="plan-feats">
                {[['yes','Single machine license'],['yes','Up to 10 active projects'],['yes','BOQ + all expense ledgers'],['yes','PDF & Excel exports'],['yes','Vendor directory'],['yes','12 months of updates'],['no','Multi-user sharing'],['no','Tally CSV export']].map(([t,f])=>(
                  <li key={f} className="plan-feat"><span className={`pf-${t}`}>{t==='yes'?'✓':'✗'}</span> {f}</li>
                ))}
              </ul>
              <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => openSignupWithPlan('Solo')}>Get Started</button>
            </div>
            <div className="pricing-card pop fade-up d1">
              <div className="pop-chip">Most Popular</div>
              <div className="plan-tier" style={{ color: 'var(--indigo)' }}>Studio</div>
              <div className="plan-price"><span className="plan-cur">₹</span><span className="plan-num">9,999</span><span className="plan-per">/month</span></div>
              <p className="plan-desc">For studios and construction firms with teams. Unlimited projects and multi-user database sharing.</p>
              <ul className="plan-feats">
                {[['yes','Up to 5 machine licenses'],['yes','Unlimited projects'],['yes','All exports incl. Tally CSV'],['yes','Multi-user database sharing'],['yes','GST Purchase Register'],['yes','Pending Payments Report'],['yes','Priority email support'],['yes','PIN lock & security']].map(([t,f])=>(
                  <li key={f} className="plan-feat"><span className={`pf-${t}`}>{t==='yes'?'✓':'✗'}</span> {f}</li>
                ))}
              </ul>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => openSignupWithPlan('Studio')}>Get Started</button>
            </div>
            <div className="pricing-card fade-up d2">
              <div className="plan-tier" style={{ color: 'var(--gray-500)' }}>Enterprise</div>
              <div className="plan-price"><span className="plan-num" style={{ fontSize: '2rem' }}>Custom</span></div>
              <p className="plan-desc">For large firms managing 50+ projects, multiple offices, custom integrations, and SLA support.</p>
              <ul className="plan-feats">
                {[['yes','Unlimited machines'],['yes','Custom onboarding & training'],['yes','Dedicated account manager'],['yes','White-label option'],['yes','Custom integrations'],['yes','SLA support agreement'],['yes','Volume pricing'],['yes','Machine transfer support']].map(([t,f])=>(
                  <li key={f} className="plan-feat"><span className={`pf-${t}`}>✓</span> {f}</li>
                ))}
              </ul>
              <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => openSignupWithPlan('Enterprise')}>Contact Sales</button>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button className="btn btn-outline btn-lg" onClick={showCompare}>📊 &nbsp;Compare All Plans in Detail</button>
          </div>
          <p style={{ textAlign: 'center', fontSize: '.84rem', color: 'var(--gray-400)', marginTop: '28px' }}>All plans include a 14-day free trial · No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* ── Compare Modal ── */}
      <div id="modal-compare" className={`modal-overlay${compareOpen ? ' open' : ''}`} onClick={e=>{if(e.target===e.currentTarget)hideCompare()}}>
        <div className="modal-box" style={{ maxWidth: '720px', padding: '40px' }}>
          <button className="modal-close" onClick={hideCompare}>✕</button>
          <div className="modal-badge">Plan Comparison</div>
          <h2 className="modal-title">Compare All Plans</h2>
          <p className="modal-sub">Choose the plan that fits your firm — all plans include offline operation and free setup support.</p>
          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead><tr><th style={{ width: '40%' }}>Feature</th><th>Solo<br/><span style={{ fontWeight: 400, fontSize: '.8rem', textTransform: 'none' }}>₹4,999/mo</span></th><th className="pop-col">Studio ⭐<br/><span style={{ fontWeight: 400, fontSize: '.8rem', textTransform: 'none' }}>₹9,999/mo</span></th><th>Enterprise<br/><span style={{ fontWeight: 400, fontSize: '.8rem', textTransform: 'none' }}>Custom</span></th></tr></thead>
              <tbody>
                {[['Projects','Up to 5','Unlimited','Unlimited'],['Users','1 user','Up to 5','Unlimited'],['BOQ & Budget Management','✓','✓','✓'],['Vendor / Labour / Contractor Ledgers','✓','✓','✓'],['GST Purchase Register','✓','✓','✓'],['Tally ERP / Prime Export','✓','✓','✓'],['PDF & Excel Export','✓','✓','✓'],['Multi-User LAN Sharing','—','✓','✓'],['Google Drive / OneDrive Sync','—','✓','✓'],['PDF Manpower Import','—','✓','✓'],['Priority WhatsApp Support','—','✓','✓'],['Custom Branding on Reports','—','—','✓'],['Dedicated Onboarding Manager','—','—','✓'],['API / Custom Integration','—','—','✓']].map(([feat,...cols])=>(
                  <tr key={feat}><td>{feat}</td>{cols.map((v,i)=><td key={i} className={i===1?'pop-col':''}>{v}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => { hideCompare(); openDemo() }}>Get Started Free →</button>
            <button className="btn btn-outline" onClick={hideCompare}>Close</button>
          </div>
        </div>
      </div>
    </>
  )
}
