'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2, Receipt } from 'lucide-react'
import { GST_STATES, type BillingDetails } from '@/lib/gst'

type Fields = Record<'legalName' | 'gstin' | 'addressLine1' | 'addressLine2' | 'city' | 'stateCode' | 'pincode' | 'phone', string>

const fromDetails = (d: BillingDetails | null): Fields => ({
  legalName: d?.legalName ?? '',
  gstin: d?.gstin ?? '',
  addressLine1: d?.addressLine1 ?? '',
  addressLine2: d?.addressLine2 ?? '',
  city: d?.city ?? '',
  stateCode: d?.stateCode ?? '',
  pincode: d?.pincode ?? '',
  phone: d?.phone ?? '',
})

const inputStyle = { border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a' }

/**
 * The name, address, state and GSTIN printed on the customer's GST invoices. Required before the first checkout; the
 * state decides whether the invoice charges CGST + SGST or IGST, and a GSTIN lets the firm claim input tax credit.
 */
export default function BillingDetailsForm({ initial }: { initial: BillingDetails | null }) {
  const router = useRouter()
  const [editing, setEditing] = useState(!initial)
  const [fields, setFields] = useState<Fields>(fromDetails(initial))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<{ field?: string; message: string } | null>(null)
  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }))

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/billing-details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError({ field: data.field, message: data.error ?? 'Could not save your details. Please try again.' })
        return
      }
      setEditing(false)
      router.refresh()
    } catch {
      setError({ message: 'Could not save your details. Check your connection and try again.' })
    } finally {
      setBusy(false)
    }
  }

  const label = (text: string, k: keyof Fields, input: React.ReactNode, hint?: string) => (
    <label className="flex flex-col gap-1 text-xs font-semibold" style={{ color: '#475569' }}>
      {text}
      {input}
      {error?.field === k ? (
        <span style={{ color: '#dc2626' }}>{error.message}</span>
      ) : (
        hint && <span className="font-normal" style={{ color: '#94a3b8' }}>{hint}</span>
      )}
    </label>
  )
  const text = (k: keyof Fields, { style, ...props }: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <input
      name={k}
      value={fields[k]}
      onChange={set(k)}
      aria-invalid={error?.field === k}
      className="rounded-lg px-3 py-2 text-sm font-normal"
      style={{ ...inputStyle, ...style, borderColor: error?.field === k ? '#dc2626' : '#cbd5e1' }}
      {...props}
    />
  )

  return (
    <div id="billing-details" className="rounded-2xl p-6 mb-6 bg-white" style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <Receipt size={16} style={{ color: '#4f46e5' }} />
          <span className="text-sm font-bold" style={{ color: '#0f172a' }}>Billing details for GST invoices</span>
        </div>
        {!editing && (
          <button type="button" onClick={() => setEditing(true)} className="text-xs font-bold" style={{ color: '#4f46e5', background: 'none', border: 0, cursor: 'pointer' }}>
            Edit
          </button>
        )}
      </div>

      {!editing && initial ? (
        <div className="text-sm leading-relaxed" style={{ color: '#475569' }}>
          <div className="font-semibold" style={{ color: '#0f172a' }}>{initial.legalName}</div>
          <div>
            {[initial.addressLine1, initial.addressLine2, `${initial.city}, ${initial.state} ${initial.pincode}`].filter(Boolean).join(', ')}
          </div>
          <div className="text-xs mt-1" style={{ color: '#64748b' }}>
            {initial.gstin ? `GSTIN ${initial.gstin}` : 'Not registered for GST'} · used for every invoice from your next payment
          </div>
        </div>
      ) : (
        <form onSubmit={save} noValidate>
          <p className="text-xs mb-4" style={{ color: '#64748b' }}>
            Printed on the GST invoice we email for every payment. Add your GSTIN to claim input tax credit; leave it blank
            if your firm is not registered for GST.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {label('Billing name', 'legalName', text('legalName', { autoComplete: 'organization', required: true, maxLength: 200 }), 'Your firm’s legal name, as on its GST registration')}
            {label('GSTIN (optional)', 'gstin', text('gstin', { maxLength: 15, placeholder: '27ABCDE1234F1Z5', style: { textTransform: 'uppercase' } }))}
            {label('Address', 'addressLine1', text('addressLine1', { autoComplete: 'address-line1', required: true, maxLength: 200 }))}
            {label('Address line 2 (optional)', 'addressLine2', text('addressLine2', { autoComplete: 'address-line2', maxLength: 200 }))}
            {label('City', 'city', text('city', { autoComplete: 'address-level2', required: true, maxLength: 100 }))}
            {label(
              'State',
              'stateCode',
              <select
                name="stateCode"
                value={fields.stateCode}
                onChange={set('stateCode')}
                required
                aria-invalid={error?.field === 'stateCode'}
                className="rounded-lg px-3 py-2 text-sm font-normal"
                style={inputStyle}
              >
                <option value="">Choose your state</option>
                {GST_STATES.map((s) => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </select>,
              'Decides CGST + SGST or IGST on your invoice',
            )}
            {label('PIN code', 'pincode', text('pincode', { autoComplete: 'postal-code', inputMode: 'numeric', required: true, maxLength: 6 }))}
            {label('Phone (optional)', 'phone', text('phone', { autoComplete: 'tel', inputMode: 'tel', maxLength: 20 }))}
          </div>
          {error && !error.field && (
            <div className="flex items-start gap-1.5 text-xs mt-3" style={{ color: '#dc2626' }}>
              <AlertCircle size={12} className="mt-0.5 shrink-0" /> {error.message}
            </div>
          )}
          <div className="flex items-center gap-3 mt-4">
            <button
              type="submit"
              disabled={busy}
              className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
              style={{ background: '#0f172a', border: 0, opacity: busy ? 0.7 : 1, cursor: busy ? 'wait' : 'pointer' }}
            >
              {busy && <Loader2 size={14} className="animate-spin" />} Save billing details
            </button>
            {initial && (
              <button
                type="button"
                onClick={() => { setFields(fromDetails(initial)); setError(null); setEditing(false) }}
                className="text-xs font-bold"
                style={{ color: '#64748b', background: 'none', border: 0, cursor: 'pointer' }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
