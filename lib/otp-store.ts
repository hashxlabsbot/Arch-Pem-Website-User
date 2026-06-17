interface OtpEntry {
  otp:         string
  expiresAt:   number
  attempts:    number
  lastSentAt:  number
}

const store = new Map<string, OtpEntry>()

const OTP_TTL_MS        = 10 * 60 * 1000  // 10 minutes
const RESEND_COOLDOWN   = 60 * 1000        // 60 seconds between resends
const MAX_ATTEMPTS      = 5

function generate(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function createOtp(email: string): { otp: string; error?: string } {
  const now     = Date.now()
  const existing = store.get(email)

  if (existing && now - existing.lastSentAt < RESEND_COOLDOWN) {
    const wait = Math.ceil((RESEND_COOLDOWN - (now - existing.lastSentAt)) / 1000)
    return { otp: '', error: `Please wait ${wait}s before requesting another code.` }
  }

  const otp = generate()
  store.set(email, { otp, expiresAt: now + OTP_TTL_MS, attempts: 0, lastSentAt: now })
  return { otp }
}

export function verifyOtp(email: string, otp: string): { valid: boolean; error?: string } {
  const now   = Date.now()
  const entry = store.get(email)

  if (!entry) return { valid: false, error: 'Code not found. Please request a new one.' }

  if (now > entry.expiresAt) {
    store.delete(email)
    return { valid: false, error: 'Code has expired. Please request a new one.' }
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    store.delete(email)
    return { valid: false, error: 'Too many incorrect attempts. Please request a new code.' }
  }

  entry.attempts++

  if (entry.otp !== otp.trim()) {
    const left = MAX_ATTEMPTS - entry.attempts
    return { valid: false, error: `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} remaining.` }
  }

  store.delete(email)
  return { valid: true }
}
