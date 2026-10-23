'use client'

import { CheckIcon, ExportIcon, ArrowRightIcon, LockIcon, SaveIcon, PhoneIcon, BellIcon, HardHatIcon } from '@/components/icons'
import { MonitorGlyph, DatabaseGlyph } from './glyphs'
import { useReveal, trackSpotlight } from './useReveal'

// Sample figures. Register: taxable + 18% GST = ₹1,85,000 / ₹2,10,000 / ₹50,000.
const register = [
  { vendor: 'Shree Ganesh Cement Depot', gstin: '27AAB•••1Z5', taxable: '1,56,780', gst: '28,220' },
  { vendor: 'Om Sai Steel Traders', gstin: '27AAC•••2Z1', taxable: '1,77,966', gst: '32,034' },
  { vendor: 'Patel Hardware & Paints', gstin: '27AAD•••4Z8', taxable: '42,373', gst: '7,627' },
]

// 12×900 + 18×600 + 6×650 = ₹25,500
const muster = [
  { trade: 'Mason', n: 12, rate: 900 },
  { trade: 'Helper', n: 18, rate: 600 },
  { trade: 'Coolie', n: 6, rate: 650 },
]

// 26,45,000 + 5% contingency = 27,77,250; + 18% GST = 32,77,155; ÷ 1,400 sq ft ≈ ₹2,341
const boq = [
  { item: 'RCC work', amt: '14,20,000' },
  { item: 'Brickwork', amt: '6,85,000' },
  { item: 'Plaster & finishes', amt: '5,40,000' },
]

export default function FitsYourOffice() {
  const [ref, reveal] = useReveal<HTMLDivElement>('0px 0px -12% 0px')

  return (
    <section className="hs bn" aria-labelledby="bn-title">
      <div className="container">
        <div className="hs-head fade-up">
          <span className="hs-eyebrow"><i />Built for how India builds</span>
          <h2 id="bn-title">Fits the way your office already works</h2>
          <p>
            Your CA keeps Tally. Your supervisor keeps sending the muster. ARC PEM sits between them and does
            the reconciling — live, for everyone in the firm.
          </p>
        </div>

        <div className="bn-grid" ref={ref} data-reveal={reveal} onMouseMove={trackSpotlight}>
          {/* Tally / GST */}
          <article className="bn-tile bn-tile--wide" data-spot style={{ '--i': 0 } as React.CSSProperties}>
            <div className="bn-copy">
              <h3>Your CA gets a Tally file, not a bag of bills</h3>
              <p>
                Vendor bills land in the GST purchase register as you enter them. At month-end, export a
                TallyPrime / Tally ERP CSV and hand it over — no retyping, no mismatched totals.
              </p>
            </div>
            <div className="bn-vis bn-reg" aria-hidden="true">
              <div className="bn-reg-head">
                <strong>GST purchase register</strong>
                <span className="bn-chip">Oct 2026</span>
              </div>
              <div className="bn-reg-table">
                <div className="bn-reg-row bn-reg-row--th">
                  <span>Vendor</span><span>GSTIN</span><span>Taxable</span><span>GST</span>
                </div>
                {register.map((r) => (
                  <div key={r.vendor} className="bn-reg-row">
                    <span>{r.vendor}</span><span className="bn-mono">{r.gstin}</span>
                    <span>₹{r.taxable}</span><span>₹{r.gst}</span>
                  </div>
                ))}
                <div className="bn-reg-row bn-reg-row--total">
                  <span>Total · 3 bills</span><span />
                  <span>₹3,77,119</span><span>₹67,881</span>
                </div>
              </div>
              <div className="bn-export">
                <span className="bn-btn"><ExportIcon size={13} /> Export for TallyPrime</span>
                <ArrowRightIcon size={14} className="bn-export-arrow" />
                <span className="bn-file">
                  <span className="bn-file-ext">CSV</span>
                  <span><b>gst_oct26.csv</b><small>Ready for your CA</small></span>
                  <CheckIcon size={13} strokeWidth={2.5} className="bn-file-ok" />
                </span>
              </div>
            </div>
          </article>

          {/* On site, on the phone */}
          <article className="bn-tile bn-tile--dark" data-spot style={{ '--i': 1 } as React.CSSProperties}>
            <div className="bn-vis bn-off" aria-hidden="true">
              <span className="bn-off-ring"><span /><span /><PhoneIcon size={26} /></span>
              <ul>
                <li><span>Install</span><b>Nothing</b></li>
                <li><span>Works on</span><b>Phone · tablet · computer</b></li>
                <li><span><BellIcon size={12} /> Reminders</span><b>Push, for what&apos;s due</b></li>
                <li><span><SaveIcon size={12} /> Backup</span><b>One click, restore anytime</b></li>
              </ul>
            </div>
            <div className="bn-copy">
              <h3>On site, on the phone</h3>
              <p>
                Site engineers add bills with a photo of the receipt the moment they are paid. Install ARC PEM on the
                home screen like an app; there is nothing to set up or update.
              </p>
            </div>
          </article>

          {/* Muster */}
          <article className="bn-tile" data-spot style={{ '--i': 2 } as React.CSSProperties}>
            <div className="bn-vis bn-mus" aria-hidden="true">
              <span className="bn-pdf"><HardHatIcon size={14} /> Site A · today</span>
              {muster.map((m) => (
                <div key={m.trade} className="bn-mus-row" style={{ '--w': `${(m.n / 18) * 100}%` } as React.CSSProperties}>
                  <span>{m.trade}</span>
                  <span className="bn-mus-bar"><i /></span>
                  <span className="bn-mono">{m.n} × ₹{m.rate}</span>
                </div>
              ))}
              <div className="bn-mus-total"><span>Wages today</span><b>₹25,500</b></div>
            </div>
            <div className="bn-copy">
              <h3>Muster in, wages out</h3>
              <p>
                Enter the day&apos;s headcount by trade from site. ARC PEM works out the wages for each project
                and keeps every labour contractor&apos;s ledger up to date.
              </p>
            </div>
          </article>

          {/* BOQ */}
          <article className="bn-tile" data-spot style={{ '--i': 3 } as React.CSSProperties}>
            <div className="bn-vis bn-boq" aria-hidden="true">
              {boq.map((b) => (
                <div key={b.item} className="bn-boq-row"><span>{b.item}</span><b>₹{b.amt}</b></div>
              ))}
              <div className="bn-boq-adds">
                <span>+ Contingency 5%</span><span>+ GST 18%</span>
              </div>
              <div className="bn-boq-total">
                <span><small>Project budget</small><b>₹32,77,155</b></span>
                <span className="bn-sqft">₹2,341<small>/ sq ft</small></span>
              </div>
            </div>
            <div className="bn-copy">
              <h3>A BOQ that becomes the budget</h3>
              <p>
                Build BOQs from reusable templates, with GST, contingency and cost per sq ft worked out. Every
                bill after that is measured against it.
              </p>
            </div>
          </article>

          {/* Whole firm */}
          <article className="bn-tile" data-spot style={{ '--i': 4 } as React.CSSProperties}>
            <div className="bn-vis bn-lan" aria-hidden="true">
              <svg className="bn-lan-lines" viewBox="0 0 300 120" preserveAspectRatio="none">
                <path d="M50 0 C 50 70, 150 50, 150 120" />
                <path d="M150 0 L 150 120" />
                <path d="M250 0 C 250 70, 150 50, 150 120" />
              </svg>
              <div className="bn-lan-pcs">
                <span><MonitorGlyph size={18} />Accounts</span>
                <span><PhoneIcon size={18} />Site</span>
                <span><MonitorGlyph size={18} />Partner</span>
              </div>
              <span className="bn-lan-db"><DatabaseGlyph size={18} /> One live ledger <LockIcon size={12} /></span>
            </div>
            <div className="bn-copy">
              <h3>One ledger, whole firm</h3>
              <p>
                Accounts, site teams and partners work on the same live numbers from wherever they are — each
                person seeing only the projects their role allows.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
