import nodemailer, { type Transporter } from 'nodemailer'

let transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE !== 'false',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }
  return transporter
}

export async function sendViaSmtp({
  to, fromName, subject, html,
}: { to: string | string[]; fromName: string; subject: string; html: string }) {
  const senderName = process.env.MAIL_FROM_NAME || fromName
  const senderAddr = process.env.MAIL_FROM || process.env.SMTP_USER
  await getTransporter().sendMail({
    from: `"${senderName}" <${senderAddr}>`,
    to,
    subject,
    html,
  })
}
