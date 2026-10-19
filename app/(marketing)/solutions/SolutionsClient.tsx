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
              <p>ARC PEM connects your BOQ estimate to what you have actually spent. Every project shows budget vs. actual, what is left, and how far along it is — and the app tells you the moment a project crosses its budget or a milestone slips past its date.</p>
              <ul className="feat-bullets">
                {['Budget vs. actual per project, per category — updated as you log expenses','Milestone tracker with target dates, progress states, and overdue flagging','Cash, cheque, and pending payment split at a glance','Alerts and push reminders for budget overruns and overdue milestones'].map(b=>(
                  <li key={b} className="feat-bullet"><span className="fb-check">✓</span> {b}</li>
                ))}
              </ul>
              <button className="sol-link" style={{ background: 'none', border: 'none' }} onClick={() => showModal('modal-control')}>Explore Project Control &nbsp;→</button>
            </div>
            <div className="feat-panel">
              <div className="fp-label">Project Overview — Skyline Residency</div>
              <div className="pc-stats">
                {[
                  { l: 'Estimated', v: '₹65,37,120', c: '' },
                  { l: 'Spent',     v: '₹41,20,400', c: 'spent' },
                  { l: 'Remaining', v: '₹24,16,720', c: 'left' },
                  { l: 'Complete',  v: '63%',        c: '' },
                ].map(s => (
                  <div key={s.l} className="pc-stat">
                    <div className="pc-stat-lbl">{s.l}</div>
                    <div className={`pc-stat-val ${s.c}`}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="pc-prog"><div className="pc-prog-fill" style={{ width: '63%' }} /></div>
              <div className="pc-prog-meta"><span>63% of budget used</span><span>₹24,16,720 left</span></div>
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

          <div className="sol-grid">
            {[
              { id: 'project-mgmt', icon: <ClipboardIcon size={26} color="#4f46e5" />, cls: 'si-blue', title: 'Project & Budget Management', desc: 'Build precise cost estimates, track project status, and generate client-ready budget summaries with automatic GST and cost-per-sq.ft.', modal: 'modal-boq', cta: 'Explore BOQ Features', feats: [['b','Bill of Quantities (BOQ)'],['b','Project Dashboard & Status Tracking'],['b','BOQ Templates (Reusable)'],['b','Duplicate Projects'],['b','Cost Per Sq.Ft Calculator'],['b','Contingency & GST Auto-Compute'],['b','PDF & Excel Export']] },
              { id: 'expense-mgmt', icon: <WalletIcon size={26} color="#0ea5e9" />, cls: 'si-sky', title: 'Expense & Finance Management', desc: 'Track every rupee across vendor bills, labour wages, contractor invoices, and site expenses. Auto-compute GST and export directly to Tally.', modal: 'modal-expense', cta: 'Explore Finance Tools', feats: [['s','Vendor Ledger with GST Toggle'],['s','Labour Tracking (Daily Headcount)'],['s','Contractor Bill Management'],['s','Site Expense Tracking'],['s','GST Purchase Register'],['s','Pending Payments Dashboard'],['s','Tally ERP / Prime CSV Export']] },
              { id: 'power-feat', icon: <BoltIcon size={26} color="#10b981" />, cls: 'si-green', title: 'Power & Productivity Features', desc: 'Built for a firm that works together — team roles, payment approvals, global search, change history and bank-grade data isolation.', modal: 'modal-power', cta: 'Explore Power Tools', feats: [['g','Global Search (Ctrl+K)'],['g','Team Roles & Project Access'],['g','Payment Approvals'],['g','Party Directory & Autocomplete'],['g','Change History on Every Entry'],['g','Automatic Daily Backups'],['g','GSTR-2B, TDS & Cheque Registers'],['g','Works on Any Phone or Computer']] },
            ].map((s, i) => (
              <div key={s.id} className={`sol-card fade-up${i===1?' d1':i===2?' d2':''}`} id={s.id}>
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
                <div className="gst-row"><span className="k">GST (18%)</span><span className="v">₹9,93,120</span></div>
                <div className="gst-divider"/>
                <div className="gst-row tot"><span className="k">Grand Total</span><span className="v">₹65,37,120</span></div>
                <div className="gst-row"><span className="k">Rate / sq.ft (3,200 sq.ft)</span><span className="v" style={{ color: 'var(--gray-500)' }}>₹2,043 / sq.ft</span></div>
              </div>
            </div>
          </div>

          {/* Row 2: Expense */}
          <div className="feat-row rev fade-up">
            <div className="feat-text">
              <div className="feat-photo"><Image src="/images/finance-analytics.jpg" alt="Project finance dashboard" fill sizes="(max-width: 768px) 100vw, 50vw" /></div>
              <span className="badge badge-teal">Expense &amp; Finance Management</span>
              <h3>Every bill. Every worker. Every rupee — tracked.</h3>
              <p>Log vendor bills with per-entry GST, track daily labour headcount by role, manage contractor invoices, and capture site costs — all in one ledger per project.</p>
              <ul className="feat-bullets">
                {['Per-bill GST toggle — auto-calculates CGST + SGST','Payment tracking: advance, cash, cheque, pending balance','Attach bill photos or scanned PDFs to each entry','4-second undo window on accidental deletes'].map(b=>(
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
              <p>Every firm&apos;s data is isolated inside the database itself, encrypted in transit and backed up daily. Your whole team works on the same live numbers — each person seeing only what their role allows.</p>
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
                  { ico: <RefreshIcon size={18} color="#4f46e5" />, name: 'Daily backup', sub: 'Automatic' },
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

      {/* ── Feature Modals ── */}
      {[
        { id: 'modal-boq', cls: 'si-blue', icon: <ClipboardIcon size={26} color="#4f46e5" />, title: 'Project & Budget Management', sub: 'Precision BOQ engine built for Indian construction firms', cards: [
          {i:<BuildingIcon size={20} color="#4f46e5" />,t:'Bill of Quantities (BOQ)',d:'Structured line items with units, rates, and colour-coded categories — Civil, MEP, Finishing, Landscaping. Live subtotal, contingency, and GST.'},
          {i:<CompassIcon size={20} color="#4f46e5" />,t:'Cost-Per-Sq.Ft Calculator',d:'Automatically computes and displays cost per sq.ft as you enter BOQ items. Instant benchmark for client negotiations.'},
          {i:<FolderIcon size={20} color="#4f46e5" />,t:'Reusable BOQ Templates',d:'Save any BOQ as a template. Apply it to future projects in one click — perfect for standard villa, office, or fit-out budgets.'},
          {i:<DashboardIcon size={20} color="#4f46e5" />,t:'Project Dashboard',d:'Live status board showing budget vs. actual spend, % complete, and outstanding payments — all in real time.'},
          {i:<RefreshIcon size={20} color="#4f46e5" />,t:'Duplicate Projects',d:'Copy an entire project structure — BOQ, categories, team — to kickstart similar projects without starting from zero.'},
          {i:<ExportIcon size={20} color="#4f46e5" />,t:'PDF & Excel Export',d:'Generate a client-ready PDF BOQ or detailed Excel export. Professional formatting with your firm name and project details.'},
        ]},
        { id: 'modal-expense', cls: 'si-sky', icon: <WalletIcon size={26} color="#0ea5e9" />, title: 'Expense & Finance Management', sub: 'Track every rupee across vendors, labour, contractors, and site', cards: [
          {i:<StoreIcon size={20} color="#0ea5e9" />,t:'Vendor Ledger with GST',d:'Log vendor bills with GSTIN, invoice number, and GST rate. Toggle between GST-inclusive and exclusive views. Auto-fills CGST/SGST split.'},
          {i:<HardHatIcon size={20} color="#0ea5e9" />,t:'Labour Tracking',d:'Daily headcount entry for every site. Weekly payment summaries, skill-wise breakdowns, and exportable attendance sheets.'},
          {i:<UsersIcon size={20} color="#0ea5e9" />,t:'Contractor Bill Management',d:'Manage civil, MEP, and interior contractors with running bill tracking, retention amounts, and advance deduction calculations.'},
          {i:<ReceiptIcon size={20} color="#0ea5e9" />,t:'GST Purchase Register',d:'Auto-generated monthly GST detail sheet — ready to share with your CA for GST filing. Exportable to Excel and PDF.'},
          {i:<ClockIcon size={20} color="#0ea5e9" />,t:'Pending Payments Dashboard',d:'See all unpaid bills across every project in one view. Overdue alerts with days-past-due counter.'},
          {i:<DownloadIcon size={20} color="#0ea5e9" />,t:'Tally ERP / Prime Export',d:'One-click CSV export formatted for Tally ERP 9 and Tally Prime. Eliminates manual double-entry and CA reconciliation time.'},
        ]},
        { id: 'modal-power', cls: 'si-green', icon: <BoltIcon size={26} color="#10b981" />, title: 'Power & Productivity Features', sub: 'Enterprise tools for the whole firm — secure, live and fast', cards: [
          {i:<SearchIcon size={20} color="#10b981" />,t:'Global Search (Ctrl+K)',d:'Search across every project, vendor, bill, and entry in milliseconds. Fuzzy match finds records even with partial names.'},
          {i:<UsersIcon size={20} color="#10b981" />,t:'Team Roles & Access',d:'Invite partners, accounts and site staff. Eight roles from Owner to Site engineer, each limited to the projects they work on.'},
          {i:<LockIcon size={20} color="#10b981" />,t:'Payment Approvals',d:'Nothing goes out until an Admin or Owner approves it, and every decision is recorded with who made it and when.'},
          {i:<ClipboardIcon size={20} color="#10b981" />,t:'Change History',d:'Who changed which entry, when, and what it was before. Mistakes are traceable and reversible; nothing silently disappears.'},
          {i:<SaveIcon size={20} color="#10b981" />,t:'Daily Backups & Export',d:'An automatic copy of your firm’s data every day, ready to restore or download. Export everything to Excel or PDF at any time.'},
          {i:<RefreshIcon size={20} color="#10b981" />,t:'Always Up to Date',d:'New features and fixes arrive automatically for everyone in the firm. There is nothing to install, update or maintain.'},
        ]},
        { id: 'modal-control', cls: 'si-amber', icon: <GaugeIcon size={26} color="#f59e0b" />, title: 'Project Control & Alerts', sub: 'Catch overruns and slipped milestones before they cost you', cards: [
          {i:<GaugeIcon size={20} color="#f59e0b" />,t:'Budget vs. Actual',d:'Your BOQ estimate sits alongside real logged expenses. See amount spent, amount remaining, and percentage of budget used — for the whole project and broken down by category.'},
          {i:<MilestoneIcon size={20} color="#f59e0b" />,t:'Milestone & Phase Tracker',d:'Define project phases with target dates. Move each through Pending, In Progress, and Completed. Anything past its target date is flagged automatically.'},
          {i:<WarningIcon size={20} color="#f59e0b" />,t:'Budget Overrun Alerts',d:'Set an estimated budget per project. The moment total spend crosses it, ARC PEM raises an alert naming the project and the exact amount you have gone over by.'},
          {i:<BellIcon size={20} color="#f59e0b" />,t:'Pending & Overdue Reminders',d:'On launch you are told how many payments are outstanding and their total value, plus any milestone past its date. A reminder fires on exit too, so it stays in your notification centre.'},
          {i:<DashboardIcon size={20} color="#f59e0b" />,t:'Spend Trend & Breakdown',d:'Every project carries a monthly spend trend and a category breakdown chart, so you can see which months and which trades are consuming the budget.'},
          {i:<ClockIcon size={20} color="#f59e0b" />,t:'Cash / Cheque / Pending Split',d:'Know exactly how much of a project has been settled in cash, how much by cheque, and how much is still outstanding — without opening a single ledger.'},
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
