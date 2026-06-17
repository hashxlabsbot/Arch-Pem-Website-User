import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get('to')
  if (!to) return NextResponse.json({ error: 'Pass ?to=your@email.com' }, { status: 400 })

  const BREVO_API = 'https://api.brevo.com/v3/smtp/email'
  const apiKey   = process.env.BREVO_API_KEY
  const sender   = process.env.BREVO_SENDER_EMAIL ?? 'vashisth0052@gmail.com'

  if (!apiKey) return NextResponse.json({ error: 'BREVO_API_KEY not set in .env' }, { status: 500 })

  try {
    const res = await fetch(BREVO_API, {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender:      { name: 'ARC PEM', email: sender },
        to:          [{ email: to }],
        subject:     'ARCPEM — Email test',
        htmlContent: '<p>This is a test email from ARCPEM. If you received this, email sending is working correctly.</p>',
      }),
    })

    const body = await res.text()

    return NextResponse.json({
      status:    res.status,
      ok:        res.ok,
      sender,
      apiKeySet: !!apiKey,
      apiKeyPrefix: apiKey.slice(0, 16) + '...',
      brevoResponse: body,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
