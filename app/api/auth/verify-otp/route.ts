import { NextRequest, NextResponse } from 'next/server'
import { verifyOtp } from '@/lib/otp-store'
import { rateLimit } from '@/lib/rate-limit'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  const { email, otp, name, company, password, planName } = await req.json()

  if (!email || !EMAIL_RE.test(email) || !otp) {
    return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 })
  }
  if (!name || !password) {
    return NextResponse.json({ error: 'Registration details are missing.' }, { status: 400 })
  }
  const normalized = email.toLowerCase().trim()

  // Throttle by IP and email to prevent OTP brute-forcing.
  const [ipRl, emailRl] = await Promise.all([
    rateLimit(`verify-otp-ip:${ip}`, 20, 60 * 60 * 1000),
    rateLimit(`verify-otp-email:${normalized}`, 10, 60 * 60 * 1000),
  ])
  if (!ipRl.allowed || !emailRl.allowed) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  const { valid, error } = await verifyOtp(normalized, String(otp))
  if (!valid) return NextResponse.json({ error }, { status: 400 })

  // OTP verified — create the account via the admin API, which is the single
  // source of truth for registration (it enforces full password policy).
  const payload: Record<string, string> = { name, email: normalized, password }
  if (company) payload.company = company
  if (planName) payload.planName = planName

  try {
    const res = await fetch(`${env.adminApi()}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json({ error: data.error || 'Registration failed.' }, { status: res.status })
    }
  } catch (err) {
    logger.error('verify-otp: admin register call failed', err)
    return NextResponse.json(
      { error: 'Could not reach the registration service. Please try again.' },
      { status: 502 }
    )
  }

  return NextResponse.json({ success: true })
}
