import { sendViaSmtp } from '@/lib/mailer'

// Every value interpolated into an HTML email body must go through this —
// these templates carry user-submitted fields (demo form, signup name, etc.)
// and are sent from the company's authenticated mailbox, so unescaped
// interpolation would let a submitter inject markup/links into mail that
// looks legitimate to the recipient.
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function sendOtpEmail({ to, name, otp }: { to: string; name: string; otp: string }) {
  const safeName = esc(name || to)
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
        <p style="font-size:15px;color:#1e293b;margin:0 0 8px;">Hi <strong>${safeName}</strong>,</p>
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
async function sendMail(to: string | string[], _toName: string, subject: string, html: string) {
  await sendViaSmtp({ to, fromName: 'ARC PEM', subject, html })
}

export async function sendPasswordResetOtpEmail({
  to, name, otp,
}: { to: string; name: string; otp: string }) {
  const safeName = esc(name)
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
        <p style="font-size:15px;color:#1e293b;margin:0 0 8px;">Hi <strong>${safeName}</strong>,</p>
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
  const safeName = esc(name)
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
        <p style="font-size:15px;color:#1e293b;margin:0 0 10px;">Hi <strong>${safeName}</strong>,</p>
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
}: { to: string | string[]; name: string; whatsapp: string; company?: string; role?: string; teamSize?: string; date?: string; time?: string }) {
  const rows = [
    ['Name',           esc(name)],
    ['WhatsApp',       esc(whatsapp)],
    ['Preferred date', esc(date || '—')],
    ['Preferred time', esc(time || '—')],
    ['Company',        esc(company || '—')],
    ['Role',           esc(role || '—')],
    ['Team Size',      esc(teamSize || '—')],
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

export async function sendDemoConfirmationEmail({
  to, name, date, time, meetLink,
}: { to: string; name: string; date?: string; time?: string; meetLink?: string }) {
  const safeName = esc(name)
  const safeDate = date ? esc(date) : undefined
  const safeTime = time ? esc(time) : undefined
  // meetLink comes from the Google Calendar API response, not user input, but
  // it's still escaped for the href/display text as standard practice.
  const safeMeetLink = meetLink ? esc(meetLink) : undefined
  await sendMail(to, name, 'Your ARC PEM demo is booked', `
    <!DOCTYPE html><html>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="max-width:520px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
      <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);padding:32px 36px;text-align:center;">
        <span style="font-size:18px;font-weight:900;color:white;">ARC <span style="color:#60a5fa;">PEM</span></span>
        <h1 style="color:white;font-size:20px;font-weight:700;margin:16px 0 6px;">You're all set, ${safeName}!</h1>
        <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0;">Your free demo request has been received</p>
      </div>
      <div style="padding:36px;">
        ${(safeDate || safeTime) ? `
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
          <p style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 14px;">Requested Slot</p>
          ${safeDate ? `<div style="display:flex;justify-content:space-between;padding:6px 0;"><span style="font-size:13px;color:#64748b;">Date</span><span style="font-size:13px;font-weight:700;color:#0f172a;">${safeDate}</span></div>` : ''}
          ${safeTime ? `<div style="display:flex;justify-content:space-between;padding:6px 0;"><span style="font-size:13px;color:#64748b;">Time</span><span style="font-size:13px;font-weight:700;color:#0f172a;">${safeTime}</span></div>` : ''}
        </div>` : ''}
        ${safeMeetLink ? `
        <p style="font-size:14px;color:#475569;margin:0 0 20px;line-height:1.6;">
          We've pencilled in a Google Meet for this slot. If the time doesn't work, just reply to this email or message us on WhatsApp and we'll move it.
        </p>
        <div style="text-align:center;margin-bottom:24px;">
          <a href="${safeMeetLink}" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#6366f1);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;">
            Join on Google Meet →
          </a>
        </div>
        <p style="font-size:12px;color:#94a3b8;margin:0 0 24px;word-break:break-all;">${safeMeetLink}</p>
        ` : `
        <p style="font-size:14px;color:#475569;margin:0 0 24px;line-height:1.6;">
          Our team will confirm your slot and send the Google Meet link on WhatsApp shortly.
        </p>
        `}
        <div style="background:rgba(59,130,246,0.05);border:1px solid rgba(59,130,246,0.15);border-radius:10px;padding:12px 16px;">
          <p style="font-size:12px;color:#1e3a5f;margin:0;">We'll also reach out on WhatsApp within 2 hours to confirm everything.</p>
        </div>
      </div>
      <div style="background:#f8fafc;border-top:1px solid #f1f5f9;padding:16px 36px;text-align:center;">
        <p style="font-size:11px;color:#94a3b8;margin:0;">© 2026 ARCPEM. All rights reserved.<br/>You received this because you booked a demo at arcpem.com.</p>
      </div>
    </div>
    </body></html>
  `)
}

export async function sendPaymentSuccessEmail({
  to, name, planName, amount, paymentId, webAppUrl,
}: {
  to: string; name: string; planName: string; amount: number; paymentId: string
  // Set for ARC PEM Web plans: the email then takes the owner straight into their firm's workspace.
  webAppUrl?: string
}) {
  const safeName = esc(name)
  const rows = [
    ['Plan',        esc(planName)],
    ['Amount paid', `₹${amount.toLocaleString('en-IN')}`],
    ['Payment ID',  esc(paymentId)],
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
        <p style="font-size:15px;color:#1e293b;margin:0 0 20px;">Hi <strong>${safeName}</strong>,</p>
        <p style="font-size:14px;color:#475569;margin:0 0 24px;line-height:1.6;">
          Thank you for your payment. Your <strong>${esc(planName)}</strong> plan is now active${webAppUrl
            ? ` and your firm's ARC PEM Web workspace is ready. Sign in with this account, then invite your team from the <strong>Team</strong> page.`
            : ' and all its features are unlocked in your dashboard.'}
        </p>
        ${webAppUrl ? `
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;"><tr>
          <td bgcolor="#4f46e5" style="border-radius:10px;background:#4f46e5;">
            <a href="${esc(webAppUrl)}/auth/arcpem" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">Open ARC PEM Web &rarr;</a>
          </td>
        </tr></table>` : ''}
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
