import LedgerLogo from '@/components/LedgerLogo'
import { company } from '@/lib/company'
import './auth-ledger.css'

/**
 * Auth layout (login / register / forgot / reset) in the "Site Ledger"
 * identity: an ink site-office board on the left, concrete paper with the
 * form card on the right. Styles: app/(auth)/auth-ledger.css (.al).
 */

const LEDGER = [
  ['13-06', 'Shree Cement · 4,800 bags', 'Twr B', '19,68,000'],
  ['13-06', 'Labour muster · 186', 'Twr B', '14,06,160'],
  ['14-06', 'Om Steel · TMT 62 T', 'Twr A', '38,44,000'],
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="al">
      {/* ── Left: site-office board ── */}
      <aside className="al-left" aria-hidden="true">
        <div className="al-tape">{Array.from({ length: 14 }, (_, i) => <span key={i}><b>{i * 10}</b></span>)}</div>
        <div className="al-left-inner">
          <a href="/" className="al-logo"><LedgerLogo height={46} onDark /></a>

          <div className="al-kicker"><span className="al-dot" />v{company.product.version} live · 30+ Indian firms</div>
          <h1 className="al-h1">Your sites.<br />Your ledger.<br /><span>On record.</span></h1>
          <p className="al-sub">BOQ, vendor bills, labour muster, contractor ledgers and GST — in one desktop app that works offline and exports to TallyPrime.</p>

          <div className="al-book">
            <div className="al-book-head"><b>Site ledger</b><em>Sample</em></div>
            {LEDGER.map(([d, p, s, a]) => (
              <div key={p} className="al-row"><span>{d}</span><strong>{p}</strong><span>{s}</span><span className="al-amt">{a}</span></div>
            ))}
            <div className="al-total"><span>Total · GST split</span><b>₹72,18,160</b></div>
            <div className="al-stamp"><i>ARC PEM</i>On record</div>
          </div>

          <ul className="al-bricks">
            <li>Works offline</li><li>Windows &amp; Mac</li><li>TallyPrime export</li>
          </ul>
        </div>
        <div className="al-hazard" />
      </aside>

      {/* ── Right: form ── */}
      <main className="al-right">
        <a href="/" className="al-mobile-logo"><LedgerLogo height={40} /></a>
        <div className="al-card auth-form-card">{children}</div>
        <p className="al-foot">© {new Date().getFullYear()} {company.legalName} · ARC PEM · All rights reserved</p>
      </main>
    </div>
  )
}
