import nodemailer, { type Transporter } from 'nodemailer'
import { LOGO_CID } from '@/lib/email-layout'
import { LOGO_PNG_BASE64 } from '@/lib/email-logo'

let transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE !== 'false',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    })
  }
  return transporter
}

export async function sendViaSmtp({
  to, fromName, subject, html, text,
}: { to: string | string[]; fromName: string; subject: string; html: string; text?: string }) {
  const senderName = process.env.MAIL_FROM_NAME || fromName
  const senderAddr = process.env.MAIL_FROM || process.env.SMTP_USER
  // The ARC PEM icon travels inside the email (cid:), so it shows even where remote images are blocked.
  const attachments = html.includes(`cid:${LOGO_CID}`)
    ? [{ filename: 'arc-pem.png', content: Buffer.from(LOGO_PNG_BASE64, 'base64'), cid: LOGO_CID }]
    : undefined
  await getTransporter().sendMail({
    from: `"${senderName}" <${senderAddr}>`,
    to,
    subject,
    html,
    text,
    attachments,
  })
}
