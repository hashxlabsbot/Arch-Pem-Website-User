import type { Metadata } from 'next'
import LegalPage from '@/components/marketing/LegalPage'
import { company, formatAddress } from '@/lib/company'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How ARC PEM collects, uses, stores and protects your personal and business data.',
  alternates: { canonical: '/privacy' },
}

const UPDATED = '4 July 2026'

export default function PrivacyPage() {
  const addr = formatAddress()
  return (
    <LegalPage title="Privacy Policy" updated={UPDATED}>
      <p>
        This Privacy Policy explains how {company.legalName} (&ldquo;{company.brand}&rdquo;, &ldquo;we&rdquo;,
        &ldquo;us&rdquo;) collects, uses, and protects your information when you use our website and software.
        By using {company.brand}, you agree to this policy.
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li><strong>Account data:</strong> name, email address, and password (stored only as a secure hash).</li>
        <li><strong>Payment data:</strong> processed by our payment partner Razorpay. We never see or store your full card, UPI, or bank credentials — we only receive a payment confirmation and reference id.</li>
        <li><strong>Usage data:</strong> basic technical logs (such as IP address and timestamps) used for security and rate-limiting.</li>
        <li><strong>Product data:</strong> the project, expense, and accounting data you create is primarily stored locally in the desktop application; we store only what is necessary to operate your account and subscription.</li>
      </ul>

      <h2>2. How we use your information</h2>
      <ul>
        <li>To create and manage your account and subscription.</li>
        <li>To process payments and send receipts.</li>
        <li>To provide support and respond to your requests.</li>
        <li>To secure the service (fraud prevention, rate limiting, abuse detection).</li>
        <li>To send essential service emails (verification, password reset, payment confirmation).</li>
      </ul>

      <h2>3. Third-party services</h2>
      <p>We share the minimum data required with trusted processors:</p>
      <ul>
        <li><strong>Razorpay</strong> — payment processing.</li>
        <li><strong>Hostinger</strong> — transactional email delivery from our official mailbox (info@arcpem.com).</li>
        <li><strong>Google Calendar</strong> — used to generate a Google Meet link when you book a demo.</li>
        <li><strong>Cloud database hosting</strong> — to store account and subscription records.</li>
        <li><strong>Google Analytics</strong> — aggregated, anonymised website usage statistics (pages visited, general location, device type) to help us understand how visitors use our site. This does not include payment or account data.</li>
      </ul>
      <p>We do not sell your personal data to anyone.</p>

      <h2>4. Data security</h2>
      <p>
        Passwords are hashed, payment verification uses cryptographic signatures, and access to your account is
        protected by authentication. No method of transmission or storage is 100% secure, but we take reasonable
        measures to protect your information.
      </p>

      <h2>5. Data retention</h2>
      <p>
        We retain account and transaction records for as long as your account is active and as required to comply
        with legal, tax, and accounting obligations. You may request deletion of your account (see below).
      </p>

      <h2>6. Your rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal data by contacting us. We will
        respond within a reasonable time, subject to legal record-keeping requirements.
      </p>

      <h2>7. Cookies</h2>
      <p>
        We use essential cookies required to keep you signed in and to operate the service, and Google Analytics
        cookies to understand aggregate website traffic and usage. We do not use third-party advertising cookies,
        and Analytics data is not used to serve ads.
      </p>

      <h2>8. Changes to this policy</h2>
      <p>We may update this policy from time to time. Material changes will be reflected by the &ldquo;last updated&rdquo; date above.</p>

      <h2>9. Contact</h2>
      <p>
        For any privacy questions, contact us at{' '}
        <a href={`mailto:${company.supportEmail}`}>{company.supportEmail}</a>
        {company.phone ? <> or {company.phone}</> : null}.
        {addr ? <><br />{company.legalName}, {addr}.</> : null}
      </p>
    </LegalPage>
  )
}
