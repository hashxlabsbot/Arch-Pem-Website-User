import { env } from '@/lib/env'

const BREVO_API = 'https://api.brevo.com/v3/smtp/email'

export async function sendOtpEmail({ to, name, otp }: { to: string; name: string; otp: string }) {
  await sendMail(to, name || to, 'Your ARC PEM verification code', `
    <!DOCTYPE html><html>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="max-width:480px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
      <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);padding:32px 36px;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:16px;">
          <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#3b82f6,#6366f1);display:inline-flex;align-items:center;justify-content:center;">
            <svg width="20" height="20" viewBox="0 0 44 44" fill="none"><path d="M11 34 L11 21 Q11 8 22 8 Q33 8 33 21 L33 34" stroke="white" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><line x1="7" y1="34" x2="37" y2="34" stroke="white" stroke-width="4" stroke-linecap="round"/></svg>
          </div>
          <span style="font-size:18px;font-weight:900;color:white;">ARC <span style="color:#60a5fa;">PEM</span></span>
        </div>
        <h1 style="color:white;font-size:20px;font-weight:700;margin:0 0 6px;">Email Verification</h1>
        <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0;">Use the code below to verify your email address</p>
      </div>
      <div style="padding:36px;text-align:center;">
        <p style="font-size:15px;color:#1e293b;margin:0 0 8px;">Hi <strong>${name}</strong>,</p>
        <p style="font-size:14px;color:#64748b;margin:0 0 28px;line-height:1.6;">
          Enter this 6-digit code to complete your ARC PEM registration.
        </p>
        <div style="background:#f8fafc;border:2px dashed #e2e8f0;border-radius:14px;padding:24px;margin-bottom:24px;display:inline-block;min-width:200px;">
          <div style="font-size:36px;font-weight:900;letter-spacing:12px;color:#0f172a;font-family:monospace;">${otp}</div>
          <p style="font-size:11px;color:#94a3b8;margin:10px 0 0;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Expires in 10 minutes</p>
        </div>
        <div style="background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.15);border-radius:10px;padding:12px 16px;margin-bottom:24px;">
          <p style="font-size:12px;color:#dc2626;margin:0;">If you did not request this code, you can safely ignore this email.</p>
        </div>
        <p style="font-size:12px;color:#94a3b8;margin:0;">
          This code is valid for a single use only.<br/>
          <strong style="color:#1e293b;">ARCPEM Team</strong>
        </p>
      </div>
      <div style="background:#f8fafc;border-top:1px solid #f1f5f9;padding:16px 36px;text-align:center;">
        <p style="font-size:11px;color:#94a3b8;margin:0;">© 2026 ARCPEM. All rights reserved.<br/>You received this because someone used this email to sign up for ARCPEM.</p>
      </div>
    </div>
    </body></html>
  `)
}
// Sender falls back to noreply@arcpem.com (via env helper) — never a personal inbox.
const FROM = { name: 'ARC PEM', email: env.brevoSender() }

async function sendMail(to: string, toName: string, subject: string, html: string) {
  const res = await fetch(BREVO_API, {
    method: 'POST',
    headers: {
      'api-key':     process.env.BREVO_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender:      FROM,
      to:          [{ email: to, name: toName }],
      subject,
      htmlContent: html,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Brevo API ${res.status}: ${err}`)
  }
}

export async function sendPasswordResetOtpEmail({
  to, name, otp,
}: { to: string; name: string; otp: string }) {
  await sendMail(to, name, 'Your ARCPEM password reset code', `
    <!DOCTYPE html><html>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="max-width:480px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
      <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);padding:32px 36px;text-align:center;">
        <span style="font-size:18px;font-weight:900;color:white;">ARC <span style="color:#60a5fa;">PEM</span></span>
        <h1 style="color:white;font-size:20px;font-weight:700;margin:16px 0 6px;">Password Reset</h1>
        <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0;">Use the code below to reset your password</p>
      </div>
      <div style="padding:36px;text-align:center;">
        <p style="font-size:15px;color:#1e293b;margin:0 0 8px;">Hi <strong>${name}</strong>,</p>
        <p style="font-size:14px;color:#64748b;margin:0 0 28px;line-height:1.6;">
          Enter this 6-digit code to reset your ARCPEM password.
        </p>
        <div style="background:#f8fafc;border:2px dashed #e2e8f0;border-radius:14px;padding:24px;margin-bottom:24px;display:inline-block;min-width:200px;">
          <div style="font-size:36px;font-weight:900;letter-spacing:12px;color:#0f172a;font-family:monospace;">${otp}</div>
          <p style="font-size:11px;color:#94a3b8;margin:10px 0 0;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Expires in 10 minutes</p>
        </div>
        <div style="background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.15);border-radius:10px;padding:12px 16px;">
          <p style="font-size:12px;color:#dc2626;margin:0;">If you did not request this, you can safely ignore this email.</p>
        </div>
      </div>
      <div style="background:#f8fafc;border-top:1px solid #f1f5f9;padding:16px 36px;text-align:center;">
        <p style="font-size:11px;color:#94a3b8;margin:0;">© 2026 ARCPEM. All rights reserved.<br/>You received this because a password reset was requested for your ARCPEM account.</p>
      </div>
    </div>
    </body></html>
  `)
}

export async function sendPasswordResetEmail({
  to, name, resetUrl,
}: { to: string; name: string; resetUrl: string }) {
  await sendMail(to, name, 'Reset your ARCPEM password', `
    <!DOCTYPE html><html>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="max-width:480px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
      <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);padding:32px 36px;text-align:center;">
        <span style="font-size:18px;font-weight:900;color:white;">ARC <span style="color:#60a5fa;">PEM</span></span>
        <h1 style="color:white;font-size:20px;font-weight:700;margin:16px 0 6px;">Password Reset</h1>
        <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0;">We received a request to reset your password</p>
      </div>
      <div style="padding:36px;">
        <p style="font-size:15px;color:#1e293b;margin:0 0 10px;">Hi <strong>${name}</strong>,</p>
        <p style="font-size:14px;color:#64748b;margin:0 0 28px;line-height:1.6;">
          Click the button below to set a new password. This link expires in <strong>15 minutes</strong>.
        </p>
        <div style="text-align:center;margin-bottom:28px;">
          <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#6366f1);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;letter-spacing:0.01em;">
            Reset Password →
          </a>
        </div>
        <div style="background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.15);border-radius:10px;padding:12px 16px;margin-bottom:20px;">
          <p style="font-size:12px;color:#dc2626;margin:0;">If you did not request a password reset, you can safely ignore this email. Your password will not change.</p>
        </div>
        <p style="font-size:12px;color:#94a3b8;margin:0;line-height:1.6;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <span style="color:#6366f1;word-break:break-all;">${resetUrl}</span>
        </p>
      </div>
      <div style="background:#f8fafc;border-top:1px solid #f1f5f9;padding:16px 36px;text-align:center;">
        <p style="font-size:11px;color:#94a3b8;margin:0;">© 2026 ARCPEM. All rights reserved.<br/>You received this because a password reset was requested for your ARCPEM account.</p>
      </div>
    </div>
    </body></html>
  `)
}

export async function sendDemoRequestEmail({
  to, name, whatsapp, company, role, teamSize, date, time,
}: { to: string; name: string; whatsapp: string; company?: string; role?: string; teamSize?: string; date?: string; time?: string }) {
  const rows = [
    ['Name',           name],
    ['WhatsApp',       whatsapp],
    ['Preferred date', date || '—'],
    ['Preferred time', time || '—'],
    ['Company',        company || '—'],
    ['Role',           role || '—'],
    ['Team Size',      teamSize || '—'],
  ]

  await sendMail(to, 'ARC PEM Team', `New demo request — ${name}`, `
    <!DOCTYPE html><html>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="max-width:540px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
      <div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:32px 36px;">
        <h1 style="color:white;font-size:22px;font-weight:700;margin:0 0 6px;">New Demo Request 🎯</h1>
        <p style="color:rgba(255,255,255,0.75);font-size:14px;margin:0;">A prospect booked a demo from the website.</p>
      </div>
      <div style="padding:32px 36px;">
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;">
          <p style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 14px;">Lead Details</p>
          ${rows.map(([label, value]) => `
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;">
              <span style="font-size:13px;color:#64748b;">${label}</span>
              <span style="font-size:13px;font-weight:700;color:#0f172a;">${value}</span>
            </div>`).join('')}
        </div>
        <p style="font-size:13px;color:#94a3b8;margin:20px 0 0;">Reach out on WhatsApp within 2 hours as promised on the site.</p>
      </div>
      <div style="background:#f8fafc;border-top:1px solid #f1f5f9;padding:20px 36px;text-align:center;">
        <p style="font-size:12px;color:#94a3b8;margin:0;">© 2026 ARCPEM · Demo request notification</p>
      </div>
    </div>
    </body></html>
  `)
}

export async function sendPaymentSuccessEmail({
  to, name, planName, amount, paymentId,
}: { to: string; name: string; planName: string; amount: number; paymentId: string }) {
  const rows = [
    ['Plan',        planName],
    ['Amount paid', `₹${amount.toLocaleString('en-IN')}`],
    ['Payment ID',  paymentId],
    ['Status',      'Active'],
  ]

  await sendMail(to, name, `Your ${planName} plan is active 🎉`, `
    <!DOCTYPE html><html>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="max-width:540px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
      <div style="background:linear-gradient(135deg,#0f766e,#10b981);padding:32px 36px;">
        <h1 style="color:white;font-size:22px;font-weight:700;margin:0 0 6px;">Payment Successful ✓</h1>
        <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">Your subscription has been activated.</p>
      </div>
      <div style="padding:32px 36px;">
        <p style="font-size:15px;color:#1e293b;margin:0 0 20px;">Hi <strong>${name}</strong>,</p>
        <p style="font-size:14px;color:#475569;margin:0 0 24px;line-height:1.6;">
          Thank you for your payment. Your <strong>${planName}</strong> plan is now active and all its features are unlocked in your dashboard.
        </p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <p style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 14px;">Receipt</p>
          ${rows.map(([label, value]) => `
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;">
              <span style="font-size:13px;color:#64748b;">${label}</span>
              <span style="font-size:13px;font-weight:700;color:${label === 'Status' ? '#059669' : '#0f172a'};">${value}</span>
            </div>`).join('')}
        </div>
        <p style="font-size:13px;color:#94a3b8;margin:0;">
          Keep this email as your receipt. If anything looks wrong, reply to this email or contact our support team.<br/>
          <strong style="color:#1e293b;">ARC PEM Support</strong>
        </p>
      </div>
      <div style="background:#f8fafc;border-top:1px solid #f1f5f9;padding:20px 36px;text-align:center;">
        <p style="font-size:12px;color:#94a3b8;margin:0;">© 2026 ARCPEM. All rights reserved.<br/>You received this because you have an account with ARCPEM.</p>
      </div>
    </div>
    </body></html>
  `)
}
