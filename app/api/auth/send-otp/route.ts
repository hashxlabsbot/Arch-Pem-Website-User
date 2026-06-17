import { NextRequest, NextResponse } from 'next/server'
import { createOtp } from '@/lib/otp-store'
import { sendOtpEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  const { email, name } = await req.json()
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
  }
  const normalized = email.toLowerCase().trim()

  // Throttle by both IP and target email so neither can be abused for spam.
  const [ipRl, emailRl] = await Promise.all([
    rateLimit(`send-otp-ip:${ip}`, 10, 60 * 60 * 1000),
    rateLimit(`send-otp-email:${normalized}`, 5, 60 * 60 * 1000),
  ])
  if (!ipRl.allowed || !emailRl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
  }

  const { otp, error } = await createOtp(normalized)
  if (error) return NextResponse.json({ error }, { status: 429 })

  try {
    await sendOtpEmail({ to: normalized, name: name || normalized, otp })
  } catch (err) {
    logger.error('send-otp email failed', err, { email: normalized })
    return NextResponse.json({ error: 'Failed to send verification email. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
