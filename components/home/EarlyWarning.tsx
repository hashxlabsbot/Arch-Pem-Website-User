'use client'

import { WarningIcon, ClockIcon, BellIcon } from '@/components/icons'
import { ArcAppIcon } from './glyphs'
import { useReveal } from './useReveal'

const watches = [
  {
    icon: <WarningIcon size={18} />, tone: 'red', title: 'Budget overruns',
    text: "Every vendor, labour and contractor bill counts against the project's BOQ budget. Cross it and you know that day — not at the final account.",
  },
  {
    icon: <ClockIcon size={18} />, tone: 'amber', title: 'Overdue milestones',
    text: 'Slab casting slipped a week? Milestones past their target date stay flagged until someone updates them.',
  },
  {
    icon: <BellIcon size={18} />, tone: 'indigo', title: 'Pending payments',
    text: 'Every unpaid vendor and contractor bill, with the total outstanding, so dues are followed up instead of forgotten.',
  },
]

// Notification wording mirrors what the desktop app shows.
const toasts = [
  { tone: 'red', title: 'Budget overrun: Skyline Residency', body: 'Exceeded budget by ₹2,40,000.' },
  { tone: 'amber', title: '3 overdue milestones', body: 'Some project milestones are past their target date. Open ARC PEM to update.' },
  { tone: 'indigo', title: '12 pending payments', body: '₹8,40,000 outstanding. Open ARC PEM to review.' },
]

// Sample project — budget ₹40,00,000, spent ₹42,40,000 → over by ₹2,40,000 (106%).
const recent = [
  { what: 'Cement', who: 'Shree Ganesh Cement Depot', amt: '₹1,85,000' },
  { what: 'TMT steel', who: 'Om Sai Steel Traders', amt: '₹2,10,000' },
  { what: 'Labour', who: 'Muster · week 41', amt: '₹96,400' },
]

export default function EarlyWarning() {
  const [ref, reveal] = useReveal<HTMLDivElement>()

  return (
    <section className="hs ew" aria-labelledby="ew-title">
      <div className="container ew-grid">
        <div className="ew-copy fade-up">
          <span className="hs-eyebrow hs-eyebrow--amber"><i />Project control</span>
          <h2 id="ew-title">Your desktop tells you before your accountant does</h2>
          <p className="ew-lead">
            ARC PEM checks every project against its budget, its milestone dates and its unpaid bills. When
            something slips, it says so the moment you open the app — and again when you close it, so the
            alert waits in your notification centre.
          </p>
          <ul className="ew-list">
            {watches.map((w) => (
              <li key={w.title}>
                <span className={`ew-ico ew-ico--${w.tone}`}>{w.icon}</span>
                <div>
                  <strong>{w.title}</strong>
                  <p>{w.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="ew-stage" ref={ref} data-reveal={reveal} aria-label="Example of ARC PEM desktop alerts for a sample project" role="img">
          <div className="ew-desk">
            <div className="ew-win" aria-hidden="true">
              <div className="ew-win-head">
                <span className="ew-dots"><i /><i /><i /></span>
                <strong>Skyline Residency</strong>
                <span className="ew-tag">Sample project</span>
              </div>
              <div className="ew-figs">
                <div><small>BOQ budget</small><b>₹40,00,000</b></div>
                <div><small>Spent to date</small><b className="ew-red">₹42,40,000</b></div>
              </div>
              <div className="ew-meter">
                <span className="ew-meter-fill" />
                <span className="ew-meter-over" />
                <span className="ew-meter-mark"><i>Budget</i></span>
              </div>
              <div className="ew-over">
                <WarningIcon size={13} /> Over budget by ₹2,40,000 · 106%
              </div>
              <div className="ew-recent">
                <small>Latest bills</small>
                {recent.map((r) => (
                  <div key={r.who} className="ew-row">
                    <b>{r.what}<em>{r.amt}</em></b>
                    <span>{r.who}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ew-stack" aria-hidden="true">
              {toasts.map((t, i) => (
                <div key={t.title} className="ew-toast" style={{ '--i': i } as React.CSSProperties}>
                  <ArcAppIcon size={30} />
                  <div className="ew-toast-txt">
                    <span className="ew-toast-app">ARC PEM <time>now</time></span>
                    <strong><i className={`ew-pip ew-pip--${t.tone}`} />{t.title}</strong>
                    <p>{t.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="ew-taskbar" aria-hidden="true">
              <i /><i />
              <span className="ew-task-app"><ArcAppIcon size={20} /></span>
              <i /><i />
              <span className="ew-clock">
                <span className="ew-bell"><BellIcon size={14} /><b>3</b></span>
                <span>9:41 AM<br />15-10-2026</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
