import { NextRequest, NextResponse } from 'next/server'
import { verifyOtp } from '@/lib/otp-store'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const { allowed } = rateLimit(`verify-otp-ip:${ip}`, 20, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
  }

  const { email, otp, name, company, password, planName } = await req.json()

  if (!email || !otp) {
    return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 })
  }
  if (!name || !password) {
    return NextResponse.json({ error: 'Registration details are missing.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  const { valid, error } = verifyOtp(email.toLowerCase(), otp)
  if (!valid) {
    return NextResponse.json({ error }, { status: 400 })
  }

  // OTP is valid — create the account via the admin API
  const adminApi = process.env.NEXT_PUBLIC_ADMIN_API || 'http://localhost:3000'
  const payload: Record<string, string> = { name, email, password }
  if (company)  payload.company  = company
  if (planName) payload.planName = planName

  try {
    const res  = await fetch(`${adminApi}/api/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json({ error: data.error || 'Registration failed.' }, { status: res.status })
    }
  } catch {
    return NextResponse.json({ error: 'Could not reach the registration service. Please try again.' }, { status: 502 })
  }

  return NextResponse.json({ success: true })
}
