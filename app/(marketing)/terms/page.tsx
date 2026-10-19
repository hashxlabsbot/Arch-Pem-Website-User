import type { Metadata } from 'next'
import LegalPage from '@/components/marketing/LegalPage'
import { company } from '@/lib/company'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'The terms and conditions governing your use of ARC PEM software and services.',
  alternates: { canonical: '/terms' },
}

const UPDATED = '16 October 2026'

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" updated={UPDATED}>
      <p>
        These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your access to and use of the {company.brand}{' '}
        website, the ARC PEM web application at app.arcpem.com, and related services provided by {company.legalName} (&ldquo;we&rdquo;, &ldquo;us&rdquo;).
        By creating an account or making a purchase, you agree to these Terms.
      </p>

      <h2>1. The service</h2>
      <p>
        {company.brand} is project expense management software for architecture and construction firms. We grant you
        a limited, non-exclusive, non-transferable licence to use the software for your internal business purposes,
        subject to your active subscription and these Terms.
      </p>

      <h2>2. Accounts</h2>
      <ul>
        <li>You must provide accurate information and keep your credentials secure.</li>
        <li>You are responsible for all activity under your account.</li>
        <li>You must be authorised to bind your firm if you register on its behalf.</li>
      </ul>

      <h2>3. Subscriptions &amp; payment</h2>
      <ul>
        <li>Paid plans are billed at the prices shown on our <a href="/pricing">Pricing</a> page in Indian Rupees (INR).</li>
        <li>Payments are processed securely through Razorpay.</li>
        <li>Access to paid features is granted once payment is confirmed.</li>
        <li>
          Subscriptions are billed monthly or annually, as chosen at checkout, and <strong>renew automatically</strong>{' '}
          at the end of each period using the payment method you authorised (card, UPI AutoPay or bank e-mandate) until
          you turn auto-renewal off from Account &rarr; Subscription. Turning it off stops future charges; access
          continues until the end of the period already paid for.
        </li>
        <li>
          A firm&apos;s first subscription may include a free trial. Auto-pay is authorised when the trial starts and the
          first charge is taken when it ends, unless auto-renewal is turned off before then. One trial per firm.
        </li>
        <li>
          Add-on seats are billed with your plan at the prices shown on the Pricing page, for as long as they remain on
          your subscription.
        </li>
        <li>
          We may change plan prices; any change applies from your next renewal, and we will tell you by email before it
          takes effect.
        </li>
        <li>
          If a payment fails, your firm keeps full access for a 14-day grace period after the paid period ends; after
          that the workspace is read-only until renewed. Your data is not deleted for non-payment.
        </li>
        <li>Refunds, where applicable, are governed by our <a href="/refund">Refund &amp; Cancellation Policy</a>.</li>
      </ul>

      <h2>4. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Copy, resell, sublicense, reverse-engineer, or tamper with the software or its licensing.</li>
        <li>Use the service for any unlawful purpose or to infringe others&rsquo; rights.</li>
        <li>Attempt to gain unauthorised access to our systems or disrupt the service.</li>
      </ul>

      <h2>5. Intellectual property</h2>
      <p>
        All rights, title, and interest in {company.brand}, including its software, branding, and content, remain
        with {company.legalName}. The data you create in the software remains yours.
      </p>

      <h2>6. Disclaimer &amp; limitation of liability</h2>
      <p>
        The service is provided &ldquo;as is&rdquo; without warranties of any kind. {company.brand} is a tool to assist
        with project and financial record-keeping; it is not a substitute for professional accounting, legal, or tax
        advice. To the maximum extent permitted by law, our total liability for any claim is limited to the amount you
        paid us in the 12 months preceding the claim.
      </p>

      <h2>7. Termination</h2>
      <p>
        We may suspend or terminate your access if you breach these Terms. You may stop using the service at any time;
        see the <a href="/refund">Refund &amp; Cancellation Policy</a> for cancellation details.
      </p>

      <h2>8. Governing law</h2>
      <p>
        These Terms are governed by the laws of India, and any disputes are subject to the jurisdiction of the courts
        located in our registered place of business.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about these Terms? Email{' '}
        <a href={`mailto:${company.supportEmail}`}>{company.supportEmail}</a>
        {company.phone ? <> or call {company.phone}</> : null}.
      </p>
    </LegalPage>
  )
}
