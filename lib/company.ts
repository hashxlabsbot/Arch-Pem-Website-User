/**
 * Single source of truth for business / legal details shown across the site
 * (footer, Contact, and all policy pages) and required by the Razorpay merchant
 * review.
 *
 * ⚠️  REPLACE every value marked `// TODO` with your real, registered details
 *     before going live. Razorpay verifies the legal entity name, a reachable
 *     business address, phone, and support email against your account.
 */
export const company = {
  /** Public product/brand name. */
  brand: 'ARC PEM',

  /** Desktop app release info — single source of truth for every version label. */
  product: {
    version: '2.0.1',
    releaseLabel: 'Jun 2026',
  },

  /** Registered legal entity that holds the Razorpay account. */
  legalName: 'Hash X Labs', // TODO: full registered name, e.g. "HashX Labs Private Limited"

  /** Verifiable business address (Razorpay requires this publicly). */
  address: {
    line1: '', // TODO: building / street
    line2: '', // TODO: area / landmark
    city: '',  // TODO
    state: '', // TODO
    pincode: '', // TODO
    country: 'India',

  },

  /** Prefer a support address on your own domain over a Gmail address. */
  supportEmail: 'info@arcpem.com',
  salesEmail: 'info@arcpem.com',

  /** Shown site-wide; currently only appears inside the demo modal. */
  phone: '+91-8810235570',

  /** Tax registration — shown in the footer/invoices for Indian SaaS. */
  gstin: '', // TODO: 15-char GSTIN, or leave blank to hide

  /** Whether displayed prices already include 18% GST. Drives the pricing note. */
  pricesIncludeGst: false,
  gstRatePct: 18,

  /** Refund stance, surfaced in the Refund Policy + at checkout. */
  refund: {
    // Set to a number of days for a window, or 0 / null for "no refunds".
    windowDays: 7,
  },

  socials: {
    linkedin: '', // TODO: full URL or leave blank to hide
    twitter: '',  // TODO
    youtube: '',  // TODO
  },

  /** Used for canonical URLs, sitemap, OG tags. Must match the domain that
   *  actually serves the site (arcpem.com 308-redirects here in production). */
  siteUrl: 'https://www.arcpem.com',
} as const

/** "City, State – PIN, Country", skipping any empty parts. */
export function formatAddress(): string {
  const a = company.address
  return [a.line1, a.line2, a.city, a.state, a.pincode, a.country]
    .filter((p) => p && p.trim() !== '')
    .join(', ')
}

export const hasAddress = () =>
  Object.values(company.address as Record<string, string>).some(
    (v) => v && v !== 'India' && v.trim() !== '',
  )

/** Phone digits only (no '+' or separators) — used to build tel:/wa.me links. */
export const phoneDigits = company.phone.replace(/\D/g, '')
/** `tel:` href derived from the company phone. */
export const phoneTel = `tel:+${phoneDigits}`
/** WhatsApp chat link derived from the company phone. */
export const whatsappLink = `https://wa.me/${phoneDigits}`
