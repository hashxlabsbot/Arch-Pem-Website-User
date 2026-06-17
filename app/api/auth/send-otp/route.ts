import { NextRequest, NextResponse } from 'next/server'
import { createOtp } from '@/lib/otp-store'
import { sendOtpEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const { allowed } = rateLimit(`send-otp-ip:${ip}`, 10, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
  }

  const { email, name } = await req.json()

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
  }

  const { otp, error } = createOtp(email.toLowerCase())
  if (error) {
    return NextResponse.json({ error }, { status: 429 })
  }

  try {
    await sendOtpEmail({ to: email, name: name || email, otp })
  } catch (err) {
    console.error('[send-otp] email failed:', err)
    return NextResponse.json({ error: 'Failed to send verification email. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
