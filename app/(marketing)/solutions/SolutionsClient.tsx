'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useDemoModal } from '@/components/marketing/DemoModalContext'
import {
  ClipboardIcon, WalletIcon, BoltIcon, BuildingIcon, CompassIcon, FolderIcon,
  DashboardIcon, RefreshIcon, ExportIcon, StoreIcon, HardHatIcon, UsersIcon,
  ReceiptIcon, ClockIcon, DownloadIcon, SearchIcon, LockIcon, SaveIcon,
  GlobeIcon, TruckIcon, MilestoneIcon, GaugeIcon, BellIcon, WarningIcon,
  CheckIcon, DocumentIcon, WhatsappIcon,
} from '@/components/icons'

export default function SolutionsClient() {
  const openDemo = useDemoModal()
  const [openModal, setOpenModal] = useState<string | null>(null)

  function showModal(id: string) { setOpenModal(id); document.body.style.overflow = 'hidden' }
  function hideModal()           { setOpenModal(null); document.body.style.overflow = '' }

  return (
    <>
      {/* ── Solutions ── */}
      <section className="section bg-gray" id="features" style={{ paddingTop: '120px' }}>
        <div className="container">
          <div className="img-hero fade-up">
            <Image src="/images/construction-crane.jpg" alt="Construction site managed with ARC PEM" fill priority sizes="100vw" />
            <div className="img-hero-inner">
              <span className="badge badge-indigo">Architecture &amp; Construction Software</span>
              <h1>Construction &amp; Architecture Software for Every Financial Workflow</h1>
              <p>BOQ and budgets, vendor and labour expenses, GST and Tally exports, team roles and approvals — built for Indian architecture firms, contractors, and builders. Live for the whole firm, on any phone or computer.</p>
            </div>
          </div>
          <Link href="/pricing" className="sol-web-banner fade-up">
            <span className="sol-web-ico"><GlobeIcon size={20} /></span>
            <span className="sol-web-text">
              <b>Every workflow below, live for your whole team</b>
              <small>Team roles, payment approvals, GSTR-2B matching and phone access — monthly or annual plans.</small>
            </span>
            <span className="sol-web-cta">See plans →</span>
          </Link>
          <div className="sec-hd fade-up">
            <span className="badge badge-indigo">All Your Construction Management</span>
            <h2>Everything Your Firm Needs, Out of the Box</h2>
            <p>From the first sketch budget to the final handover report — ARC PEM covers every financial workflow your architecture or construction team needs, without spreadsheets, for office and site alike.</p>
          </div>
          {/* ── Lead feature: Project Control (full-width, above the pillar grid) ── */}
          <div className="feat-row fade-up" style={{ paddingTop: 0, borderBottom: 'none', marginBottom: '8px' }}>
            <div className="feat-text">
              <span className="badge badge-amber">New — Project Control</span>
              <h3>Know a project is overrunning while you can still fix it</h3>
              <p>ARC PEM connects your BOQ estimate to what you have actually spent. Every project shows budget vs. actual, what is left, and how far along it is — and the people who need to know get an alert at 90% and 100% of budget, or when a milestone slips past its date.</p>
              <ul className="feat-bullets">
                {['Budget vs. actual per project, per category — updated as you log expenses','A 0–100 project health score with the reasons, and a completion forecast','Milestone tracker with target dates, statuses and overdue flagging','Push alerts and reminders for budget, pending payments and milestones'].map(b=>(
                  <li key={b} className="feat-bullet"><span className="fb-check">✓</span> {b}</li>
                ))}
              </ul>
              <button className="sol-link" style={{ background: 'none', border: 'none' }} onClick={() => showModal('modal-control')}>Explore Project Control &nbsp;→</button>
            </div>
            <div className="feat-panel">
              <div className="fp-label">Project Overview — Skyline Residency</div>
              <div className="pc-stats">
                {[
                  { l: 'Estimated', v: '₹65,41,920', c: '' },
                  { l: 'Spent',     v: '₹41,20,400', c: 'spent' },
                  { l: 'Remaining', v: '₹24,21,520', c: 'left' },
                  { l: 'Complete',  v: '63%',        c: '' },
                ].map(s => (
                  <div key={s.l} className="pc-stat">
                    <div className="pc-stat-lbl">{s.l}</div>
                    <div className={`pc-stat-val ${s.c}`}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="pc-prog"><div className="pc-prog-fill" style={{ width: '63%' }} /></div>
              <div className="pc-prog-meta"><span>63% of budget used</span><span>₹24,21,520 left</span></div>
              <div className="pc-split">
                {[
                  { l: 'Cash',    v: '₹18,40,000', c: '' },
                  { l: 'Cheque',  v: '₹19,80,400', c: '' },
                  { l: 'Pending', v: '₹3,00,000',  c: 'pend' },
                ].map(s => (
                  <div key={s.l} className="pc-split-item">
                    <div className="pc-split-lbl">{s.l}</div>
                    <div className={`pc-split-val ${s.c}`}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="pc-ms-label">Milestones</div>
              {[
                { n: 'Foundation',           s: 'done', t: 'Completed',   d: '12 Mar' },
                { n: 'RCC Structure',        s: 'prog', t: 'In Progress', d: '28 Jul' },
                { n: 'Electrical Rough-in',  s: 'late', t: 'Overdue',     d: '02 Jul' },
                { n: 'Finishing & Interiors',s: 'wait', t: 'Pending',     d: '15 Sep' },
              ].map(m => (
                <div key={m.n} className={`pc-ms-row${m.s === 'late' ? ' overdue' : ''}`}>
                  <div className={`pc-ms-dot ${m.s}`} />
                  <div className="pc-ms-name">{m.n}</div>
                  <div className={`pc-ms-state ${m.s}`}>{m.t}</div>
                  <div className="pc-ms-date">{m.d}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="sol-grid sol-grid--4">
            {[
              { id: 'project-mgmt', icon: <ClipboardIcon size={26} color="#4f46e5" />, cls: 'si-blue', title: 'Projects & Budgets', desc: 'Turn a BOQ into the project budget, then watch every rupee against it with a health score, milestones and alerts.', modal: 'modal-boq', cta: 'Explore budgets', feats: [['b','BOQ with categories, units and rates'],['b','Reusable budget templates'],['b','Cost per sq ft, contingency & GST'],['b','Budget vs actual by category'],['b','Project health score & completion forecast'],['b','Milestones with overdue alerts'],['b','Portfolio dashboard across projects']] },
              { id: 'expense-mgmt', icon: <WalletIcon size={26} color="#0ea5e9" />, cls: 'si-sky', title: 'Expenses & Ledgers', desc: 'Every vendor bill, labour wage, contractor bill and site expense in one ledger per project, with the bill attached.', modal: 'modal-expense', cta: 'Explore ledgers', feats: [['s','Vendor ledger with GST per bill'],['s','Daily labour headcount by trade'],['s','Contractor running bills, advances & TDS'],['s','Site expenses with photos & challans'],['s','Duplicate-bill warnings'],['s','Party directory & statements'],['s','Excel / CSV import with preview']] },
              { id: 'compliance', icon: <ReceiptIcon size={26} color="#f59e0b" />, cls: 'si-amber', title: 'Payments, GST & TDS', desc: 'Approve payments, send vouchers on WhatsApp, and hand your CA a clean GST and TDS record every month.', modal: 'modal-compliance', cta: 'Explore payments & tax', feats: [['a','Payment approvals before money goes out'],['a','Payment vouchers (PDF)'],['a','WhatsApp confirmations & statements'],['a','Cheque register & pending payments'],['a','GST purchase register & GSTR-2B matching'],['a','TDS register & quarterly worksheet'],['a','Tally ERP / TallyPrime export']] },
              { id: 'power-feat', icon: <BoltIcon size={26} color="#10b981" />, cls: 'si-green', title: 'Team, Control & Security', desc: 'Your whole firm on one live ledger, each person limited to the projects and areas their role allows.', modal: 'modal-power', cta: 'Explore team & security', feats: [['g','Eight roles, owner to site engineer'],['g','Per-project & per-area access'],['g','Change history & activity log'],['g','Documents & drawings with versions'],['g','Push notifications & reminders'],['g','Global search (Ctrl+K)'],['g','Data isolated per firm; backup anytime']] },
            ].map((s, i) => (
              <div key={s.id} className={`sol-card fade-up${i%2===1?' d1':''}`} id={s.id}>
                <div className={`sol-icon ${s.cls}`}>{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <ul className="sol-feats">
                  {s.feats.map(([dot, f]) => (
                    <li key={f} className="sol-feat"><div className={`sf-dot ${dot}`} />{f}</li>
                  ))}
                </ul>
                <button className="sol-link" style={{ background: 'none', border: 'none' }} onClick={() => showModal(s.modal)}>{s.cta} &nbsp;→</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Rows ── */}
      <section className="feat-section">
        <div className="container">
          {/* Row 1: BOQ */}
          <div className="feat-row fade-up">
            <div className="feat-text">
              <div className="feat-photo"><Image src="/images/engineer-site.jpg" alt="Engineer working on project drawings" fill sizes="(max-width: 768px) 100vw, 50vw" /></div>
              <span className="badge badge-indigo">Project &amp; Budget Management</span>
              <h3>Replace spreadsheet BOQs with a proper budget engine</h3>
              <p>Build structured Bills of Quantities with colour-coded categories, line items, units, and rates. Watch the subtotal, contingency, GST, and cost-per-sq.ft update live as you type.</p>
              <ul className="feat-bullets">
                {['Colour-coded categories — Civil, MEP, Finishing, Landscaping','Save any BOQ as a reusable template for future projects','One-click PDF and Excel export — client-ready format','Duplicate entire projects to reuse budget structure'].map(b=>(
                  <li key={b} className="feat-bullet"><span className="fb-check">✓</span> {b}</li>
                ))}
              </ul>
            </div>
            <div className="feat-panel">
              <div className="fp-label">BOQ — Skyline Residency, Pune</div>
              {[{cls:'var(--indigo-lt)',dot:'var(--indigo)',name:'Civil & Structure',cnt:'12 items',amt:'₹24,80,000',col:'var(--indigo)'},
                {cls:'var(--amber-lt)',dot:'var(--amber)',name:'Electrical & Plumbing',cnt:'8 items',amt:'₹9,40,000',col:'var(--amber)'},
                {cls:'var(--green-lt)',dot:'var(--green)',name:'Finishing & Interiors',cnt:'15 items',amt:'₹18,60,000',col:'var(--green)'}].map((c,i)=>(
                <div key={c.name}>
                  <div className="boq-cat" style={{ background: c.cls, marginTop: i>0?'6px':'0' }}>
                    <div className="boq-cat-dot" style={{ background: c.dot }} />
                    <div className="boq-cat-name">{c.name}</div>
                    <div className="boq-cat-count">{c.cnt}</div>
                    <div className="boq-cat-amt" style={{ color: c.col }}>{c.amt}</div>
                  </div>
                  {i===0&&<>
                    <div className="boq-sub-item"><span style={{ flex: 2 }}>RCC Columns &amp; Beams</span><span style={{ color: 'var(--gray-400)' }}>120 m³ × ₹5,500</span><span style={{ fontWeight: 700, color: 'var(--navy)', marginLeft: 'auto' }}>₹6,60,000</span></div>
                    <div className="boq-sub-item"><span style={{ flex: 2 }}>Brick Masonry</span><span style={{ color: 'var(--gray-400)' }}>450 m² × ₹1,800</span><span style={{ fontWeight: 700, color: 'var(--navy)', marginLeft: 'auto' }}>₹8,10,000</span></div>
                  </>}
                </div>
              ))}
              <div className="gst-box">
                {[['Sub-total','₹52,80,000'],['Contingency (5%)','₹2,64,000']].map(([k,v])=><div key={k} className="gst-row"><span className="k">{k}</span><span className="v">{v}</span></div>)}
                <div className="gst-divider"/>
                <div className="gst-row"><span className="k">GST (18%)</span><span className="v">₹9,97,920</span></div>
                <div className="gst-divider"/>
                <div className="gst-row tot"><span className="k">Grand Total</span><span className="v">₹65,41,920</span></div>
                <div className="gst-row"><span className="k">Rate / sq.ft (3,200 sq.ft)</span><span className="v" style={{ color: 'var(--gray-500)' }}>₹2,044 / sq.ft</span></div>
              </div>
            </div>
          </div>

          {/* Row 2: Expense */}
          <div className="feat-row rev fade-up">
            <div className="feat-text">
              <div className="feat-photo"><Image src="/images/finance-analytics.jpg" alt="Project finance dashboard" fill sizes="(max-width: 768px) 100vw, 50vw" /></div>
              <span className="badge badge-teal">Expense &amp; Finance Management</span>
              <h3>Every bill. Every worker. Every rupee — tracked.</h3>
              <p>Log vendor bills with GST, daily labour headcount by trade, contractor running bills with advances and TDS, and site costs — all in one ledger per project, with the bill attached.</p>
              <ul className="feat-bullets">
                {['GST rate and amount on every bill, with optional round-off','Payments split into cash, cheque and pending — UPI, NEFT, RTGS or IMPS','Bills, challans and site photos attached to each entry','Warnings on duplicate bills, and undo on deletes'].map(b=>(
                  <li key={b} className="feat-bullet"><span className="fb-check">✓</span> {b}</li>
                ))}
              </ul>
            </div>
            <div className="feat-panel">
              <div className="fp-label">Vendor Ledger — Resident Villa</div>
              {[
                {dot:'l',name:'Labour — Daily Wages',date:'Cash · 01 Jun 2026',amt:'₹35,100',st:'paid'},
                {dot:'s',name:'Site Expenses',date:'Bill · 04 Jun 2026',amt:'₹38,349',st:'pending',due:'₹18,349 due'},
                {dot:'s',name:'Site Expenses',date:'Bill · 13 Jun 2026',amt:'₹10,266',st:'pending',due:'₹10,266 due'},
                {dot:'c',name:'AK Tiles',date:'Cash · 10 Jun 2026',amt:'₹26,550',st:'paid'},
                {dot:'c',name:'Shakir Painter',date:'Cheque: 15,000 · 11 Jun 2026',amt:'₹18,054',st:'pending',due:'₹3,054 due'},
                {dot:'c',name:'Aggarwal RMC Contractor',date:'Cheque: 5,000 · 13 Jun 2026',amt:'₹10,266',st:'pending',due:'₹5,266 due'},
              ].map(r=>(
                <div key={r.name+r.date} className="exp-row">
                  <div className={`exp-dot ${r.dot}`}/>
                  <div style={{ flex: 1 }}><div className="exp-name">{r.name}</div><div className="exp-date">{r.date}</div></div>
                  <div className="exp-amt">{r.amt}</div>
                  <div className={`exp-status es-${r.st}`}>{r.due ?? 'Paid'}</div>
                </div>
              ))}
              <div className="gst-box" style={{ marginTop: '12px' }}>
                <div className="gst-row"><span className="k">Total Billed</span><span className="v">₹28,42,500</span></div>
                <div className="gst-row"><span className="k">Total Pending</span><span className="v" style={{ color: 'var(--amber)' }}>₹3,18,650</span></div>
                <div className="gst-divider"/>
                <div className="gst-row tot"><span className="k">Tally CSV</span><span className="v">✓ Export Ready</span></div>
              </div>
            </div>
          </div>

          {/* Row 3: Power */}
          <div className="feat-row fade-up">
            <div className="feat-text">
              <div className="feat-photo"><Image src="/images/construction-workers.jpg" alt="Construction workers on site" fill sizes="(max-width: 768px) 100vw, 50vw" /></div>
              <span className="badge badge-amber">Power Features</span>
              <h3>Enterprise security. Zero setup. Works on site.</h3>
              <p>Every firm&apos;s data is isolated inside the database itself and encrypted in transit, uploads are virus-scanned, and a full backup can be taken and restored at any time. Your whole team works on the same live numbers — each person seeing only what their role allows.</p>
              <ul className="feat-bullets">
                {['Global search with Ctrl+K — find any project, vendor, or bill instantly','Invite your team with roles and per-project access','Approvals before money goes out, and a history of every change','Nothing to install — runs in any browser, installs on phones'].map(b=>(
                  <li key={b} className="feat-bullet"><span className="fb-check">✓</span> {b}</li>
                ))}
              </ul>
            </div>
            <div className="feat-panel">
              <div className="fp-label">Global Search — Ctrl+K</div>
              <div className="search-box">
                <div className="search-bar"><span style={{ color: 'rgba(255,255,255,.4)', fontSize: '.85rem' }}><SearchIcon size={13} color="rgba(255,255,255,0.4)" /></span><span className="search-input">Resident Villa</span><span className="search-kbd">⌘K</span></div>
                <div className="search-results">
                  <div className="sr-group-label">Projects</div>
                  <div className="sr-item active"><span className="sr-item-icon"><BuildingIcon size={15} color="#475569" /></span><div><div className="sr-item-name">Resident Villa — Delhi</div><div className="sr-item-sub">M.K Thakur · Plot 403_B, Delhi-101110 · <span style={{ color: '#10b981', fontWeight: 700 }}>Active</span></div></div><span className="sr-item-arrow">Open →</span></div>
                  <div className="sr-group-label">Contractors</div>
                  <div className="sr-item"><span className="sr-item-icon"><TruckIcon size={15} color="#475569" /></span><div><div className="sr-item-name">Aggarwal RMC Contractor</div><div className="sr-item-sub">Cheque: Rs.5,000 · <span style={{ color: '#f59e0b', fontWeight: 700 }}>Pending: Rs.5,266</span></div></div></div>
                  <div className="sr-group-label">Expenses</div>
                  <div className="sr-item"><span className="sr-item-icon"><ReceiptIcon size={15} color="#475569" /></span><div><div className="sr-item-name">Site Expenses — Rs.58,881</div><div className="sr-item-sub">Resident Villa · Period: 01-01-2024 – 31-12-2027</div></div><div style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '.62rem', background: 'var(--amber-lt)', color: '#92400e', padding: '2px 7px', borderRadius: '100px', fontWeight: 700 }}>Pending Rs.28,615</div></div>
                </div>
              </div>
              <div className="sec-tiles">
                {[
                  { ico: <LockIcon size={18} color="#4f46e5" />,    name: 'Isolated',     sub: 'Row-level security' },
                  { ico: <GlobeIcon size={18} color="#4f46e5" />,   name: 'Any device',   sub: 'Browser & phone' },
                  { ico: <UsersIcon size={18} color="#4f46e5" />,   name: 'Team roles',   sub: 'Owner to site engineer' },
                  { ico: <RefreshIcon size={18} color="#4f46e5" />, name: 'Backups',      sub: 'Take & restore anytime' },
                ].map(({ ico, name, sub }) => (
                  <div key={name} className="sec-tile"><span className="st-icon">{ico}</span><div><div className="st-name">{name}</div><div className="st-sub">{sub}</div></div></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Multi-currency ── */}
      <section className="section bg-gray">
        <div className="container">
          <div className="sec-hd fade-up">
            <span className="badge badge-indigo">Works Beyond India</span>
            <h2>GST-ready for Indian firms. Currency-ready for everyone else.</h2>
            <p>ARC PEM was built around Indian construction — GST purchase registers, Tally exports, lakh and crore formatting. But if you bill in Dirhams or Riyals, every amount in the app follows your chosen currency.</p>
          </div>
          <div className="cur-band fade-up">
            {[
              ['₹','INR'], ['$','USD'], ['€','EUR'], ['£','GBP'],
              ['د.إ','AED'], ['﷼','SAR'], ['S$','SGD'], ['A$','AUD'],
            ].map(([sym, code]) => (
              <span key={code} className="cur-chip"><span className="sym">{sym}</span>{code}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Modals ── (every card is a live feature: ARCPEM-Web docs/FEATURES.md) */}
      {[
        { id: 'modal-boq', cls: 'si-blue', icon: <ClipboardIcon size={26} color="#4f46e5" />, title: 'Projects & Budgets', sub: 'A BOQ that becomes the budget every bill is measured against', cards: [
          {i:<BuildingIcon size={20} color="#4f46e5" />,t:'Bill of Quantities (BOQ)',d:'Line items with units, quantities and rates in colour-coded categories — materials, labour, equipment, fees and more. Subtotal, contingency and GST are worked out for you.'},
          {i:<CompassIcon size={20} color="#4f46e5" />,t:'Cost per sq ft',d:'Cost per square foot is calculated from the budget and the project area, an instant benchmark for client conversations.'},
          {i:<FolderIcon size={20} color="#4f46e5" />,t:'Reusable budget templates',d:'Save a budget structure once and start new projects from it — ideal for repeat villas, offices or fit-outs.'},
          {i:<DashboardIcon size={20} color="#4f46e5" />,t:'Portfolio & project dashboards',d:'Spend, pending payments and settled share across every project, with monthly trends, category breakdowns and date filters for the month, quarter or financial year.'},
          {i:<GaugeIcon size={20} color="#4f46e5" />,t:'Health score & forecast',d:'Each project gets a 0–100 health score — budget adherence, payment load and milestone timeliness — with the reasons shown, plus a completion forecast.'},
          {i:<RefreshIcon size={20} color="#4f46e5" />,t:'Duplicate, archive, complete',d:'Copy a project to reuse its budget structure, put projects on hold, complete or archive them. Active projects are counted against your plan.'},
        ]},
        { id: 'modal-expense', cls: 'si-sky', icon: <WalletIcon size={26} color="#0ea5e9" />, title: 'Expenses & Ledgers', sub: 'Vendor, labour, contractor and site — every rupee tied to a project, a party and a bill', cards: [
          {i:<StoreIcon size={20} color="#0ea5e9" />,t:'Vendor ledger',d:'Material and supplier bills with party, invoice number, item, quantity, rate, GST and round-off. Money maths is done on the server, so totals always agree.'},
          {i:<HardHatIcon size={20} color="#0ea5e9" />,t:'Labour wages',d:'Daily headcount and rate per trade — mason, helper, coolie and more — with wages worked out per day and a labour ledger you can export.'},
          {i:<UsersIcon size={20} color="#0ea5e9" />,t:'Contractor bills',d:'Running bills, advances and TDS for every contractor and sub-contractor, with the section, challan number and deposit date recorded.'},
          {i:<FolderIcon size={20} color="#0ea5e9" />,t:'Bills attached to entries',d:'Attach the bill, challan, delivery note and site photos to each entry. Files are virus-scanned and stored privately.'},
          {i:<WarningIcon size={20} color="#0ea5e9" />,t:'Duplicate-bill warnings',d:'The same bill number from the same party — on any project — or an identical same-day entry raises a warning before it is saved twice.'},
          {i:<ExportIcon size={20} color="#0ea5e9" />,t:'Import from Excel or CSV',d:'Bring existing expense sheets across. Columns are matched automatically and you review a preview, including possible duplicates, before anything is saved.'},
        ]},
        { id: 'modal-compliance', cls: 'si-amber', icon: <ReceiptIcon size={26} color="#f59e0b" />, title: 'Payments, GST & TDS', sub: 'Approve, pay, confirm — and hand your CA clean registers', cards: [
          {i:<CheckIcon size={20} color="#f59e0b" />,t:'Payment approvals',d:'A vendor or contractor payment recorded below Admin waits for an Admin or the Owner. Both sides are notified, and every decision is recorded.'},
          {i:<DocumentIcon size={20} color="#f59e0b" />,t:'Payment vouchers',d:'A numbered PDF voucher for every approved payment: who was paid and for what, GST, TDS held back, mode and the amount in words, with your firm’s name and logo.'},
          {i:<WhatsappIcon size={20} color="#f59e0b" />,t:'WhatsApp confirmations',d:'Send a payment confirmation or a party’s statement of account on WhatsApp in one tap, so vendors stop calling to ask what was paid.'},
          {i:<ClockIcon size={20} color="#f59e0b" />,t:'Cheques & pending payments',d:'A cheque register built from your payments — mark each cleared, bounced or cancelled — and a pending-payments report, oldest first, with days overdue.'},
          {i:<ReceiptIcon size={20} color="#f59e0b" />,t:'GST register & GSTR-2B',d:'A GST purchase register by month and project. Upload the GSTR-2B JSON from the portal and it is matched against your bills, so missing supplier filings are caught before you claim credit.'},
          {i:<DownloadIcon size={20} color="#f59e0b" />,t:'TDS & Tally',d:'A TDS register by financial year and quarter with due dates, a quarterly return worksheet (Form 26Q / Form 140) for your accountant, and Tally ERP / TallyPrime CSV export.'},
        ]},
        { id: 'modal-power', cls: 'si-green', icon: <BoltIcon size={26} color="#10b981" />, title: 'Team, Control & Security', sub: 'The whole firm on one live ledger — and each person only where they belong', cards: [
          {i:<UsersIcon size={20} color="#10b981" />,t:'Roles & access',d:'Eight roles from Owner to Site engineer and Supervisor. Limit each person to their projects and to areas such as GST, TDS, exports or documents.'},
          {i:<ClipboardIcon size={20} color="#10b981" />,t:'Change history & activity log',d:'Who changed which entry, when, and what it was before — captured by the database itself — plus a firm-wide log of what people did.'},
          {i:<FolderIcon size={20} color="#10b981" />,t:'Documents & drawings',d:'Drawings, BOQs and agreements per project, with numbered versions and a review state on each: draft, in review, approved or rejected.'},
          {i:<BellIcon size={20} color="#10b981" />,t:'Notifications & reminders',d:'Push notifications on phone and browser for approvals, budget alerts and new expenses, and scheduled reminders in your firm’s own timezone.'},
          {i:<SearchIcon size={20} color="#10b981" />,t:'Global search (Ctrl+K)',d:'Find any project, entry or party from anywhere in the app — limited to what each person is allowed to see.'},
          {i:<LockIcon size={20} color="#10b981" />,t:'Security & backups',d:'Each firm’s data is isolated in the database (row-level security), connections are encrypted, and a full backup can be taken and restored at any time. If a plan lapses, nothing is deleted.'},
        ]},
        { id: 'modal-control', cls: 'si-amber', icon: <GaugeIcon size={26} color="#f59e0b" />, title: 'Project Control & Alerts', sub: 'Catch overruns and slipped milestones before they cost you', cards: [
          {i:<GaugeIcon size={20} color="#f59e0b" />,t:'Budget vs. actual',d:'Your budget sits alongside real logged expenses: spent, remaining and the share used — for the whole project and planned versus spent for each category.'},
          {i:<MilestoneIcon size={20} color="#f59e0b" />,t:'Milestone tracker',d:'Milestones with target dates and statuses. Anything past its target date is flagged as overdue until someone updates it.'},
          {i:<WarningIcon size={20} color="#f59e0b" />,t:'Budget alerts',d:'An alert when a project reaches 90% of its budget, and again at 100%, sent as a push notification to the people who need to know.'},
          {i:<BellIcon size={20} color="#f59e0b" />,t:'Pending & overdue reminders',d:'Scheduled checks for outstanding payments and overdue milestones, delivered in the app and as push notifications in your firm’s timezone.'},
          {i:<DashboardIcon size={20} color="#f59e0b" />,t:'Health score & forecast',d:'A 0–100 grade for every project with the reasons behind it, and a completion forecast from spend, milestones and dates.'},
          {i:<ClockIcon size={20} color="#f59e0b" />,t:'Cash / cheque / pending split',d:'See how much of a project has been settled in cash, how much by cheque, and how much is still outstanding — without opening a ledger.'},
        ]},
      ].map(m => (
        <div key={m.id} id={m.id} className={`modal-overlay${openModal===m.id?' open':''}`} onClick={e=>{if(e.target===e.currentTarget)hideModal()}}>
          <div className="modal-box feat-modal-box">
            <button className="modal-close" onClick={hideModal}>✕</button>
            <div className="feat-modal-header">
              <div className={`feat-modal-icon ${m.cls}`}>{m.icon}</div>
              <div><div className="feat-modal-title">{m.title}</div><div className="feat-modal-sub">{m.sub}</div></div>
            </div>
            <div className="feat-modal-grid">
              {m.cards.map(c=><div key={c.t} className="fmg-card"><div className="fmg-icon">{c.i}</div><div className="fmg-title">{c.t}</div><div className="fmg-desc">{c.d}</div></div>)}
            </div>
            <div className="feat-modal-ctas">
              <button className="btn btn-primary" onClick={() => { hideModal(); openDemo() }}>Book Free Demo →</button>
              <button className="btn btn-outline" onClick={hideModal}>Close</button>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
