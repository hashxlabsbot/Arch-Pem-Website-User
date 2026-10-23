/**
 * A customer's billing details for GST invoices (BillingProfile, shared with the admin app, which issues the
 * invoice for every payment from them). The rules match validateBillingProfile in the admin app's lib/invoice.ts;
 * this side also checks the GSTIN's check digit, so a mistyped number is caught before it is printed on an invoice.
 */

/** GST state and union territory codes (the first two digits of a GSTIN). */
export const GST_STATES = [
  { code: '01', name: 'Jammu and Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '26', name: 'Dadra and Nagar Haveli and Daman and Diu' },
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry' },
  { code: '35', name: 'Andaman and Nicobar Islands' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
  { code: '38', name: 'Ladakh' },
  { code: '97', name: 'Other Territory' },
] as const

const stateName = (code: string) => GST_STATES.find((s) => s.code === code)?.name

const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/
const GSTIN_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/** Whether a GSTIN's last character is the check digit of the first fourteen (the GSTN's mod-36 scheme). */
export function gstinChecksumValid(gstin: string): boolean {
  let sum = 0
  for (let i = 0; i < 14; i++) {
    const product = GSTIN_CHARS.indexOf(gstin[i]) * (i % 2 ? 2 : 1)
    sum += Math.floor(product / 36) + (product % 36)
  }
  return GSTIN_CHARS[(36 - (sum % 36)) % 36] === gstin[14]
}

export type BillingDetails = {
  legalName: string
  gstin: string | null
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  stateCode: string
  pincode: string
  country: string
  phone: string | null
  email: string | null
}

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : '')

/**
 * Checks billing details sent by the customer. The state name is taken from the code, never from the browser.
 * GSTIN is optional (a firm not registered for GST still gets an invoice), but when given it must be valid and
 * belong to the chosen state, since the state decides CGST + SGST or IGST.
 */
export function validateBillingDetails(
  input: unknown,
): { ok: true; data: BillingDetails } | { ok: false; field: string; error: string } {
  const b = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const legalName = text(b.legalName, 200)
  const addressLine1 = text(b.addressLine1, 200)
  const addressLine2 = text(b.addressLine2, 200) || null
  const city = text(b.city, 100)
  const stateCode = text(b.stateCode, 2)
  const pincode = text(b.pincode, 6)
  const gstin = text(b.gstin, 15).toUpperCase() || null
  const phone = text(b.phone, 20) || null
  const email = text(b.email, 200).toLowerCase() || null

  if (!legalName) return { ok: false, field: 'legalName', error: 'Enter the name to print on your invoices.' }
  if (!addressLine1) return { ok: false, field: 'addressLine1', error: 'Enter your billing address.' }
  if (!city) return { ok: false, field: 'city', error: 'Enter your city.' }
  const state = stateName(stateCode)
  if (!state) return { ok: false, field: 'stateCode', error: 'Choose your state.' }
  if (!/^[1-9][0-9]{5}$/.test(pincode)) return { ok: false, field: 'pincode', error: 'Enter a valid 6-digit PIN code.' }
  if (gstin) {
    if (!GSTIN_RE.test(gstin) || !gstinChecksumValid(gstin))
      return { ok: false, field: 'gstin', error: 'This GSTIN is not valid. Check it against your GST certificate.' }
    if (gstin.slice(0, 2) !== stateCode)
      return { ok: false, field: 'gstin', error: `This GSTIN is registered in another state, not ${state}.` }
  }
  if (phone && !/^\+?[0-9 -]{7,20}$/.test(phone)) return { ok: false, field: 'phone', error: 'Enter a valid phone number.' }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, field: 'email', error: 'Enter a valid email address.' }

  return {
    ok: true,
    data: { legalName, gstin, addressLine1, addressLine2, city, state, stateCode, pincode, country: 'India', phone, email },
  }
}
