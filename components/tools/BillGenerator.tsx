'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { amountInWordsINR } from '@/lib/amount-in-words'
import { PrinterIcon } from '@/components/icons'

const UNITS = ['Sq.ft', 'Sq.m', 'R.ft', 'R.mt', 'Nos', 'Cum', 'Kg', 'MT', 'Bag', 'Day', 'Litre', 'Lumpsum']

const GST_RATES = [
  { value: 18, label: '18% — standard works contract' },
  { value: 12, label: '12% — concessional (specified works)' },
  { value: 5, label: '5% — specified services' },
  { value: 0, label: 'No GST — unregistered / exempt' },
]

type Item = { id: number; desc: string; sac: string; qty: string; unit: string; rate: string }

const newItem = (): Item => ({ id: Date.now() + Math.random(), desc: '', sac: '9954', qty: '', unit: 'Sq.ft', rate: '' })

/** Firm + bank details persist in the browser so repeat visitors don't retype them. */
const LS_KEY = 'arcpem_bill_prefs'

export default function BillGenerator() {
  const [from, setFrom] = useState({ name: '', address: '', gstin: '', phone: '', email: '' })
  const [to, setTo] = useState({ name: '', address: '', gstin: '' })
  const [meta, setMeta] = useState({ invNo: 'INV-001', date: '', site: '', notes: '' })
  const [bank, setBank] = useState({ name: '', account: '', ifsc: '' })
  const [gstRate, setGstRate] = useState(18)
  const [gstType, setGstType] = useState<'intra' | 'inter'>('intra')
  const [items, setItems] = useState<Item[]>([newItem()])
  const [hydrated, setHydrated] = useState(false)

  // Today's date + saved details are applied client-side only (avoids SSR hydration mismatch).
  useEffect(() => {
    setMeta((m) => ({ ...m, date: new Date().toISOString().slice(0, 10) }))
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) {
        const p = JSON.parse(saved)
        if (p.from) setFrom((f) => ({ ...f, ...p.from }))
        if (p.bank) setBank((b) => ({ ...b, ...p.bank }))
      }
    } catch {
      /* corrupted storage — start fresh */
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ from, bank }))
    } catch {
      /* storage full / blocked — non-fatal */
    }
  }, [from, bank, hydrated])

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, it) => sum + (parseFloat(it.qty) || 0) * (parseFloat(it.rate) || 0),
      0,
    )
    const gst = (subtotal * gstRate) / 100
    const raw = subtotal + gst
    const grand = Math.round(raw)
    const roundOff = grand - raw
    return { subtotal, gst, roundOff: Math.abs(roundOff) < 0.005 ? 0 : roundOff, grand }
  }, [items, gstRate])

  const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const dateDisplay = meta.date ? meta.date.split('-').reverse().join('/') : ''

  function updateItem(id: number, patch: Partial<Item>) {
    setItems((list) => list.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }
  function removeItem(id: number) {
    setItems((list) => (list.length > 1 ? list.filter((it) => it.id !== id) : list))
  }

  /* Rendered twice: on-screen preview inside the panel, and a print-only copy
     portalled to <body> so printing yields exactly one clean page. */
  const invoiceSheet = (
    <div className="inv-sheet">
      <div className="inv-top">
        <div style={{ maxWidth: '58%' }}>
          <div className="inv-firm-name">{from.name || 'Your Firm / Contractor Name'}</div>
          <div className="inv-muted">{from.address || 'Firm address'}</div>
          <div className="inv-muted">
            {from.gstin ? `GSTIN: ${from.gstin}` : ''}
            {from.gstin && from.phone ? ' · ' : ''}
            {from.phone ? `Ph: ${from.phone}` : ''}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="inv-title">{gstRate > 0 ? 'TAX INVOICE' : 'INVOICE'}</div>
          <div className="inv-muted">
            No: {meta.invNo || '—'}
            {'\n'}Date: {dateDisplay || '—'}
          </div>
        </div>
      </div>

      <div className="inv-cols">
        <div>
          <div className="inv-h">Billed To</div>
          <div className="inv-strong">{to.name || 'Client name'}</div>
          {to.address && <div className="inv-muted">{to.address}</div>}
          {to.gstin && <div className="inv-muted">GSTIN: {to.gstin}</div>}
        </div>
        {meta.site && (
          <div style={{ textAlign: 'right' }}>
            <div className="inv-h">Site / Project</div>
            <div className="inv-muted">{meta.site}</div>
          </div>
        )}
      </div>

      <table className="inv-table">
        <thead>
          <tr>
            <th style={{ width: 26 }}>#</th>
            <th>Description of Work</th>
            <th style={{ width: 66 }}>SAC/HSN</th>
            <th className="num" style={{ width: 58 }}>Qty</th>
            <th style={{ width: 54 }}>Unit</th>
            <th className="num" style={{ width: 76 }}>Rate (₹)</th>
            <th className="num" style={{ width: 92 }}>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => {
            const amount = (parseFloat(it.qty) || 0) * (parseFloat(it.rate) || 0)
            return (
              <tr key={it.id}>
                <td>{i + 1}</td>
                <td>{it.desc || <span style={{ color: 'var(--gray-400)' }}>Work item description</span>}</td>
                <td>{it.sac}</td>
                <td className="num">{it.qty || '—'}</td>
                <td>{it.unit}</td>
                <td className="num">{it.rate ? fmt(parseFloat(it.rate)) : '—'}</td>
                <td className="num">{fmt(amount)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="inv-totals">
        <div className="inv-trow">
          <span>Taxable Amount</span>
          <span>₹ {fmt(totals.subtotal)}</span>
        </div>
        {gstRate > 0 && gstType === 'intra' && (
          <>
            <div className="inv-trow">
              <span>CGST @ {gstRate / 2}%</span>
              <span>₹ {fmt(totals.gst / 2)}</span>
            </div>
            <div className="inv-trow">
              <span>SGST @ {gstRate / 2}%</span>
              <span>₹ {fmt(totals.gst / 2)}</span>
            </div>
          </>
        )}
        {gstRate > 0 && gstType === 'inter' && (
          <div className="inv-trow">
            <span>IGST @ {gstRate}%</span>
            <span>₹ {fmt(totals.gst)}</span>
          </div>
        )}
        {totals.roundOff !== 0 && (
          <div className="inv-trow">
            <span>Round Off</span>
            <span>{totals.roundOff > 0 ? '+' : '−'} ₹ {fmt(Math.abs(totals.roundOff))}</span>
          </div>
        )}
        <div className="inv-trow inv-grand">
          <span>Grand Total</span>
          <span>₹ {totals.grand.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="inv-words">
        <div className="inv-h">Amount in Words</div>
        <strong>{amountInWordsINR(totals.grand)}</strong>
      </div>

      {meta.notes && (
        <div style={{ marginTop: 12 }}>
          <div className="inv-h">Notes</div>
          <div className="inv-muted">{meta.notes}</div>
        </div>
      )}

      <div className="inv-foot">
        <div>
          {(bank.name || bank.account || bank.ifsc) && (
            <>
              <div className="inv-h">Bank Details</div>
              <div className="inv-muted">
                {bank.name}
                {bank.account ? `\nA/C: ${bank.account}` : ''}
                {bank.ifsc ? `\nIFSC: ${bank.ifsc}` : ''}
              </div>
            </>
          )}
        </div>
        <div className="inv-sign">
          <div className="inv-sign-line">Authorised Signatory</div>
          <div style={{ marginTop: 4 }}>For {from.name || 'Your Firm'}</div>
        </div>
      </div>

      <div className="inv-brand">
        Generated using ARC PEM Free Tools (arcpem.com/tools) — billing &amp; ledger software for builders
      </div>
    </div>
  )

  return (
    <div className="tool-panel fade-up in">
      <div className="tool-grid2">
        {/* ── Form ── */}
        <div className="tf">
          <div className="tf-sec-title first">Your details</div>
          <div className="tf-row">
            <label>Firm / Contractor Name</label>
            <input value={from.name} onChange={(e) => setFrom({ ...from, name: e.target.value })} placeholder="Sharma Constructions" />
          </div>
          <div className="tf-row">
            <label>Address</label>
            <textarea rows={2} value={from.address} onChange={(e) => setFrom({ ...from, address: e.target.value })} placeholder="Shop 4, MG Road, Pune, Maharashtra — 411001" />
          </div>
          <div className="tf-2col">
            <div className="tf-row">
              <label>GSTIN (optional)</label>
              <input value={from.gstin} onChange={(e) => setFrom({ ...from, gstin: e.target.value.toUpperCase() })} placeholder="27ABCDE1234F1Z5" maxLength={15} />
            </div>
            <div className="tf-row">
              <label>Phone</label>
              <input value={from.phone} onChange={(e) => setFrom({ ...from, phone: e.target.value })} placeholder="+91 98765 43210" />
            </div>
          </div>

          <div className="tf-sec-title">Bill To</div>
          <div className="tf-row">
            <label>Client / Company Name</label>
            <input value={to.name} onChange={(e) => setTo({ ...to, name: e.target.value })} placeholder="Mr. Rajesh Kumar" />
          </div>
          <div className="tf-row">
            <label>Client Address</label>
            <textarea rows={2} value={to.address} onChange={(e) => setTo({ ...to, address: e.target.value })} placeholder="Plot 12, Baner, Pune" />
          </div>
          <div className="tf-row">
            <label>Client GSTIN (optional)</label>
            <input value={to.gstin} onChange={(e) => setTo({ ...to, gstin: e.target.value.toUpperCase() })} maxLength={15} placeholder="Leave blank for individuals" />
          </div>

          <div className="tf-sec-title">Invoice</div>
          <div className="tf-2col">
            <div className="tf-row">
              <label>Bill / Invoice No.</label>
              <input value={meta.invNo} onChange={(e) => setMeta({ ...meta, invNo: e.target.value })} />
            </div>
            <div className="tf-row">
              <label>Date</label>
              <input type="date" value={meta.date} onChange={(e) => setMeta({ ...meta, date: e.target.value })} />
            </div>
          </div>
          <div className="tf-row">
            <label>Site / Project Name (optional)</label>
            <input value={meta.site} onChange={(e) => setMeta({ ...meta, site: e.target.value })} placeholder="Bungalow at Plot 12, Baner" />
          </div>
          <div className="tf-2col">
            <div className="tf-row">
              <label>GST Rate</label>
              <select value={gstRate} onChange={(e) => setGstRate(Number(e.target.value))}>
                {GST_RATES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="tf-row">
              <label>Tax Split</label>
              <select value={gstType} onChange={(e) => setGstType(e.target.value as 'intra' | 'inter')} disabled={gstRate === 0}>
                <option value="intra">CGST + SGST (same state)</option>
                <option value="inter">IGST (inter-state)</option>
              </select>
            </div>
          </div>

          <div className="tf-sec-title">Work Items</div>
          {items.map((it) => (
            <div className="item-row" key={it.id}>
              <input
                value={it.desc}
                onChange={(e) => updateItem(it.id, { desc: e.target.value })}
                placeholder='Description — e.g. Brickwork in CM 1:6, 9" thick wall'
              />
              <div className="item-row-grid">
                <input value={it.sac} onChange={(e) => updateItem(it.id, { sac: e.target.value })} placeholder="SAC/HSN" aria-label="SAC / HSN code" />
                <input type="number" min="0" value={it.qty} onChange={(e) => updateItem(it.id, { qty: e.target.value })} placeholder="Qty" aria-label="Quantity" />
                <select value={it.unit} onChange={(e) => updateItem(it.id, { unit: e.target.value })} aria-label="Unit">
                  {UNITS.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
                <input type="number" min="0" value={it.rate} onChange={(e) => updateItem(it.id, { rate: e.target.value })} placeholder="Rate ₹" aria-label="Rate" />
                <button className="item-del" onClick={() => removeItem(it.id)} aria-label="Remove item" title="Remove item">✕</button>
              </div>
            </div>
          ))}
          <button className="add-item-btn" onClick={() => setItems((l) => [...l, newItem()])}>
            + Add work item
          </button>

          <div className="tf-sec-title">Bank Details (optional)</div>
          <div className="tf-row">
            <label>Bank &amp; Branch</label>
            <input value={bank.name} onChange={(e) => setBank({ ...bank, name: e.target.value })} placeholder="HDFC Bank, Baner Branch" />
          </div>
          <div className="tf-2col">
            <div className="tf-row">
              <label>Account No.</label>
              <input value={bank.account} onChange={(e) => setBank({ ...bank, account: e.target.value })} />
            </div>
            <div className="tf-row">
              <label>IFSC</label>
              <input value={bank.ifsc} onChange={(e) => setBank({ ...bank, ifsc: e.target.value.toUpperCase() })} maxLength={11} />
            </div>
          </div>
          <div className="tf-row">
            <label>Notes (optional)</label>
            <textarea rows={2} value={meta.notes} onChange={(e) => setMeta({ ...meta, notes: e.target.value })} placeholder="Payment due within 15 days. This is a running account (RA) bill." />
          </div>

          <button className="btn btn-primary btn-lg" style={{ marginTop: '8px' }} onClick={() => window.print()}>
            <PrinterIcon size={17} color="#fff" style={{ marginRight: 8 }} />
            Print / Save as PDF
          </button>
          <p className="tf-note">
            100% private — the bill is generated in your browser and nothing is uploaded to any server.
            Your firm &amp; bank details are saved on this device so you don&apos;t retype them next time.
          </p>
        </div>

        {/* ── Live preview ── */}
        <div>{invoiceSheet}</div>
      </div>

      {/* Print-only copy at <body> level: @media print hides everything else,
          so the printed document is exactly the invoice — no blank pages. */}
      {hydrated && createPortal(
        <div className="inv-print-root" aria-hidden="true">{invoiceSheet}</div>,
        document.body,
      )}
    </div>
  )
}
