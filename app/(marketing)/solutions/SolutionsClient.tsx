'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useDemoModal } from '@/components/marketing/DemoModalContext'
import {
  ClipboardIcon, WalletIcon, BoltIcon, BuildingIcon, CompassIcon, FolderIcon,
  DashboardIcon, RefreshIcon, ExportIcon, StoreIcon, HardHatIcon, UsersIcon,
  ReceiptIcon, ClockIcon, DownloadIcon, SearchIcon, LockIcon, SaveIcon,
  GlobeIcon, TruckIcon,
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
              <p>BOQ and budgets, vendor and labour expenses, GST and Tally exports, multi-user security — built for Indian architecture firms, contractors, and builders, fully offline.</p>
            </div>
          </div>
          <div className="sec-hd fade-up">
            <span className="badge badge-indigo">All Your Construction Management</span>
            <h2>Everything Your Firm Needs, Out of the Box</h2>
            <p>From the first sketch budget to the final handover report — ARC PEM covers every financial workflow your architecture or construction team needs, without spreadsheets or an internet connection.</p>
          </div>
          <div className="sol-grid">
            {[
              { id: 'project-mgmt', icon: <ClipboardIcon size={26} color="#4f46e5" />, cls: 'si-blue', title: 'Project & Budget Management', desc: 'Build precise cost estimates, track project status, and generate client-ready budget summaries with automatic GST and cost-per-sq.ft.', modal: 'modal-boq', cta: 'Explore BOQ Features', feats: [['b','Bill of Quantities (BOQ)'],['b','Project Dashboard & Status Tracking'],['b','BOQ Templates (Reusable)'],['b','Duplicate Projects'],['b','Cost Per Sq.Ft Calculator'],['b','Contingency & GST Auto-Compute'],['b','PDF & Excel Export']] },
              { id: 'expense-mgmt', icon: <WalletIcon size={26} color="#0ea5e9" />, cls: 'si-sky', title: 'Expense & Finance Management', desc: 'Track every rupee across vendor bills, labour wages, contractor invoices, and site expenses. Auto-compute GST and export directly to Tally.', modal: 'modal-expense', cta: 'Explore Finance Tools', feats: [['s','Vendor Ledger with GST Toggle'],['s','Labour Tracking (Daily Headcount)'],['s','Contractor Bill Management'],['s','Site Expense Tracking'],['s','GST Purchase Register'],['s','Pending Payments Dashboard'],['s','Tally ERP / Prime CSV Export']] },
              { id: 'power-feat', icon: <BoltIcon size={26} color="#10b981" />, cls: 'si-green', title: 'Power & Productivity Features', desc: 'Enterprise-grade tools built for the field — offline operation, multi-user sharing, global search, and machine-locked security.', modal: 'modal-power', cta: 'Explore Power Tools', feats: [['g','Global Search (Ctrl+K)'],['g','Multi-User Database Sharing'],['g','PDF Manpower Report Import'],['g','Vendor Directory & Autocomplete'],['g','PIN Lock & RSA-2048 Licensing'],['g','Auto-Backup & JSON Export'],['g','Silent Auto-Update']] },
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
              <h3>Enterprise security. Zero server. Works on-site.</h3>
              <p>ARC PEM is fully offline — your data never touches a cloud server. Share the database over LAN or Google Drive for multi-user access, protected by RSA-2048 machine-locked licensing.</p>
              <ul className="feat-bullets">
                {['Global search with Ctrl+K — find any project, vendor, or bill instantly','Multi-user via LAN, Google Drive, OneDrive, Dropbox','RSA-2048 signed, machine-locked licenses','Works fully offline — no internet after activation'].map(b=>(
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
                  { ico: <LockIcon size={18} color="#4f46e5" />,    name: 'RSA-2048',     sub: 'Machine-locked license' },
                  { ico: <GlobeIcon size={18} color="#4f46e5" />,   name: '100% Offline', sub: 'No cloud, no internet' },
                  { ico: <UsersIcon size={18} color="#4f46e5" />,   name: 'Multi-User',   sub: 'LAN / Google Drive' },
                  { ico: <RefreshIcon size={18} color="#4f46e5" />, name: 'Auto-Update',  sub: 'Silent background' },
                ].map(({ ico, name, sub }) => (
                  <div key={name} className="sec-tile"><span className="st-icon">{ico}</span><div><div className="st-name">{name}</div><div className="st-sub">{sub}</div></div></div>
                ))}
              </div>
            </div>
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
        { id: 'modal-power', cls: 'si-green', icon: <BoltIcon size={26} color="#10b981" />, title: 'Power & Productivity Features', sub: 'Enterprise tools for the field — offline, secure, and fast', cards: [
          {i:<SearchIcon size={20} color="#10b981" />,t:'Global Search (Ctrl+K)',d:'Search across every project, vendor, bill, and entry in milliseconds. Fuzzy match finds records even with partial names.'},
          {i:<UsersIcon size={20} color="#10b981" />,t:'Multi-User Sharing',d:'Share the database via LAN, Google Drive, or OneDrive. Multiple team members access the same data simultaneously.'},
          {i:<LockIcon size={20} color="#10b981" />,t:'RSA-2048 Machine Lock',d:'License is tied to your hardware. Even if the software is copied, it will not run on another machine.'},
          {i:<ClipboardIcon size={20} color="#10b981" />,t:'PDF Manpower Import',d:'Import labour attendance from standard PDF reports. Auto-parses headcount, skill categories, and daily wages — zero manual entry.'},
          {i:<SaveIcon size={20} color="#10b981" />,t:'Auto-Backup & JSON Export',d:'Scheduled automatic backups to a folder of your choice. Full JSON export lets you migrate data or keep an off-site archive.'},
          {i:<RefreshIcon size={20} color="#10b981" />,t:'Silent Auto-Update',d:'New features and bug fixes deploy silently in the background. You always have the latest version without disrupting your workflow.'},
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
