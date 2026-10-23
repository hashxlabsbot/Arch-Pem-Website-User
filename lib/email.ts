/**
 * Every email arcpem.com sends, on the shared ARC PEM layout (lib/email-layout.ts). The layout escapes all text,
 * so names and form fields typed by visitors can never inject markup into mail sent from our mailbox.
 */
import { sendViaSmtp } from '@/lib/mailer'
import { env } from '@/lib/env'
import { LOGO_CID, renderEmail, type EmailContent } from '@/lib/email-layout'

const site = () => env.nextAuthUrl().replace(/\/$/, '')
const firstName = (name?: string) => (name?.trim() ? name.trim().split(/\s+/)[0] : '')
const hello = (name?: string) => (firstName(name) ? `Hi ${firstName(name)},` : 'Hi there,')

async function send(to: string | string[], subject: string, content: EmailContent) {
  const { html, text } = renderEmail(content, { appUrl: site(), logoUrl: `cid:${LOGO_CID}` })
  await sendViaSmtp({ to, fromName: 'ARC PEM', subject, html, text })
}

export async function sendOtpEmail({ to, name, otp }: { to: string; name: string; otp: string }) {
  await send(to, `${otp} is your ARC PEM verification code`, {
    preheader: 'Your 6-digit code to finish creating your ARC PEM account. It expires in 10 minutes.',
    eyebrow: 'Verify your email',
    heading: 'Your verification code',
    paragraphs: [hello(name), 'Enter this code to finish creating your ARC PEM account.'],
    code: { value: otp, caption: 'Expires in 10 minutes · single use' },
    note: { text: 'ARC PEM will never ask you to share this code. Only type it on arcpem.com.' },
    closing: ["Didn't try to sign up? You can safely ignore this email."],
    reason: 'You received this because someone used this address to sign up for ARC PEM.',
  })
}

export async function sendPasswordResetOtpEmail({ to, name, otp }: { to: string; name: string; otp: string }) {
  await send(to, `${otp} is your ARC PEM password reset code`, {
    preheader: 'Your 6-digit code to reset your ARC PEM password. It expires in 10 minutes.',
    eyebrow: 'Password reset',
    heading: 'Your password reset code',
    paragraphs: [hello(name), 'Enter this code on arcpem.com to choose a new password.'],
    code: { value: otp, caption: 'Expires in 10 minutes · single use' },
    note: { tone: 'warning', text: "**Didn't ask for this?** Ignore this email; your password won't change." },
    reason: 'You received this because a password reset was requested for your ARC PEM account.',
  })
}

export async function sendPasswordResetEmail({ to, name, resetUrl }: { to: string; name: string; resetUrl: string }) {
  await send(to, 'Reset your ARC PEM password', {
    preheader: 'Use this link within 15 minutes to choose a new password.',
    eyebrow: 'Password reset',
    heading: 'Choose a new password',
    paragraphs: [hello(name), 'We received a request to reset the password for your ARC PEM account.'],
    cta: { label: 'Reset password', url: resetUrl },
    note: {
      tone: 'warning',
      text: 'For your security this link expires in **15 minutes** and works once.',
    },
    closing: ["Didn't ask for this? Ignore this email; your password won't change."],
    reason: 'You received this because a password reset was requested for your ARC PEM account.',
  })
}

/** Internal: a new demo booking for the sales team. */
export async function sendDemoRequestEmail({
  to, name, whatsapp, company, role, teamSize, date, time,
}: { to: string | string[]; name: string; whatsapp: string; company?: string; role?: string; teamSize?: string; date?: string; time?: string }) {
  const digits = whatsapp.replace(/\D/g, '')
  await send(to, `New demo request: ${name}${company ? ` (${company})` : ''}`, {
    preheader: `${name} booked a demo${date ? ` for ${date}` : ''}. Reach out on WhatsApp within 2 hours.`,
    eyebrow: 'New lead',
    heading: `${name} booked a demo`,
    paragraphs: ['A prospect booked a free demo from arcpem.com. Reach out on WhatsApp within **2 hours**, as promised on the site.'],
    details: [
      { label: 'Name', value: name },
      { label: 'WhatsApp', value: whatsapp },
      { label: 'Preferred date', value: date || '—' },
      { label: 'Preferred time', value: time || '—' },
      { label: 'Company', value: company || '—' },
      { label: 'Role', value: role || '—' },
      { label: 'Team size', value: teamSize || '—' },
    ],
    cta: digits.length >= 10 ? { label: 'Message on WhatsApp', url: `https://wa.me/${digits}` } : undefined,
    reason: 'Demo request notification for the ARC PEM sales team.',
  })
}

export async function sendDemoConfirmationEmail({
  to, name, date, time, meetLink,
}: { to: string; name: string; date?: string; time?: string; meetLink?: string }) {
  const slot = [
    ...(date ? [{ label: 'Date', value: date }] : []),
    ...(time ? [{ label: 'Time', value: time }] : []),
  ]
  await send(to, 'Your ARC PEM demo is booked', {
    preheader: meetLink ? 'Your Google Meet link is inside.' : "We'll confirm your slot on WhatsApp shortly.",
    eyebrow: 'Demo booked',
    heading: `You're all set${firstName(name) ? `, ${firstName(name)}` : ''}!`,
    paragraphs: [
      'Thanks for booking a free ARC PEM demo. In about 30 minutes we will walk you through budgets, site ledgers, GST and team workflows, using projects like yours.',
      meetLink
        ? "We've reserved a Google Meet for your slot. If the time doesn't work, reply to this email or message us on WhatsApp and we'll move it."
        : 'Our team will confirm your slot and send the Google Meet link on WhatsApp shortly.',
    ],
    details: slot.length ? slot : undefined,
    cta: meetLink ? { label: 'Join on Google Meet', url: meetLink } : undefined,
    note: { text: "We'll also reach out on WhatsApp within **2 hours** to confirm everything." },
    reason: 'You received this because you booked a demo at arcpem.com.',
  })
}

export async function sendTrialStartedEmail({
  to, name, planName, trialEndsAt, webAppUrl,
}: { to: string; name: string; planName: string; trialEndsAt: Date; webAppUrl?: string }) {
  const ends = trialEndsAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })
  await send(to, `Your ARC PEM free trial has started`, {
    preheader: `Your firm's workspace is ready. Nothing is charged until ${ends}.`,
    eyebrow: 'Free trial',
    heading: 'Your free trial has started',
    paragraphs: [
      hello(name),
      `Your firm's **ARC PEM** workspace is ready on the **${planName}** plan. Sign in with this account, then invite your team from the **Team** page.`,
      `Auto-pay is set up, and nothing is charged until **${ends}**. If ARC PEM isn't right for you, turn off auto-renew from **Account → Subscription** on arcpem.com before then and you won't be charged.`,
    ],
    details: [
      { label: 'Plan', value: planName },
      { label: 'Trial ends', value: ends },
      { label: 'First charge', value: `${ends}, unless you cancel` },
    ],
    cta: webAppUrl ? { label: 'Open ARC PEM', url: `${webAppUrl.replace(/\/$/, '')}/auth/arcpem` } : { label: 'Go to your account', url: `${site()}/dashboard` },
    closing: ['Questions while you try it out? Reply to this email — our team will help you set up your first project.'],
    reason: 'You received this because you started a free trial on arcpem.com.',
  })
}

export async function sendPaymentSuccessEmail({
  to, name, planName, amount, paymentId, webAppUrl, billing,
}: {
  to: string; name: string; planName: string; amount: number; paymentId: string
  // Set for ARC PEM (web) plans: the email then takes the owner straight into their firm's workspace.
  webAppUrl?: string
  // Set for a charge of an auto-renewing subscription.
  billing?: { interval: 'MONTH' | 'YEAR'; renewsOn: Date; renewal: boolean }
}) {
  const web = Boolean(webAppUrl)
  const cycle = billing?.interval === 'MONTH' ? 'month' : 'year'
  const renewsOn = billing?.renewsOn.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })
  const renewal = billing?.renewal ?? false
  await send(to, renewal ? `Payment received: your ${planName} plan has renewed` : `Payment received: your ${planName} plan is active`, {
    preheader: renewal
      ? `Your ARC PEM subscription renewed for another ${cycle}.`
      : web ? "Your firm's ARC PEM workspace is ready." : 'Your plan is active. Keep this email as your receipt.',
    eyebrow: renewal ? 'Subscription renewed' : 'Payment successful',
    heading: renewal ? `Your ${planName} plan has renewed` : `Your ${planName} plan is active`,
    paragraphs: [
      hello(name),
      renewal
        ? `Thank you. Your ARC PEM subscription has renewed automatically for another ${cycle}, so your firm's workspace carries on without interruption.`
        : web
          ? "Thank you for your payment. Your firm's **ARC PEM** workspace is ready: sign in with this account, then invite your team from the **Team** page."
          : 'Thank you for your payment. Your plan is active and the ARC PEM desktop app is ready to download from your dashboard.',
      ...(billing
        ? [`Your plan renews automatically every ${cycle}. You can turn off auto-renew at any time from **Account → Subscription** on arcpem.com; you keep access until the end of the period you have paid for.`]
        : []),
    ],
    details: [
      { label: 'Plan', value: planName },
      ...(billing ? [{ label: 'Billing', value: billing.interval === 'MONTH' ? 'Monthly, auto-renews' : 'Annual, auto-renews' }] : []),
      { label: 'Amount paid', value: `₹${amount.toLocaleString('en-IN')}` },
      ...(renewsOn ? [{ label: 'Next renewal', value: renewsOn }] : []),
      { label: 'Payment ID', value: paymentId },
      { label: 'Status', value: 'Active' },
    ],
    cta: web
      ? { label: 'Open ARC PEM', url: `${webAppUrl!.replace(/\/$/, '')}/auth/arcpem` }
      : { label: 'Go to downloads', url: `${site()}/dashboard/downloads` },
    note: { text: 'Keep this email as your payment receipt. Your GST invoice follows in a separate email.' },
    closing: ['Anything look wrong? Reply to this email and our support team will help.'],
    reason: 'You received this because you made a payment on arcpem.com.',
  })
}
