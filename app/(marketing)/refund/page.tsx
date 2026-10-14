import type { Metadata } from 'next'
import LegalPage from '@/components/marketing/LegalPage'
import { company } from '@/lib/company'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Refund & Cancellation Policy',
  description: "ARC PEM’s refund and cancellation policy for annual software licences — the refund window, how to request one and how long it takes.",
  path: '/refund',
})

const UPDATED = '18 June 2026'
const days = company.refund.windowDays

export default function RefundPage() {
  return (
    <LegalPage title="Refund & Cancellation Policy" path="/refund" updated={UPDATED}>
      <p>
        This policy explains how refunds and cancellations work for {company.brand} licenses, provided by{' '}
        {company.legalName}. We want you to be confident in your purchase, so please read this carefully. We recommend
        booking a demo before purchasing.
      </p>

      <h2>1. Try before you buy</h2>
      <p>
        {company.brand} is sold as a one-year license. Before purchasing, you can book a free live demo so you can see
        the software in action and confirm it meets your needs.
      </p>

      <h2>2. Refund window</h2>
      {days > 0 ? (
        <>
          <p>
            If you are not satisfied, you may request a refund within <strong>{days} days</strong> of your payment,
            provided the subscription has not been substantially used or abused. Approved refunds are issued to the
            original payment method.
          </p>
          <p>Refunds may be declined where:</p>
          <ul>
            <li>The request is made after the {days}-day window.</li>
            <li>There is evidence of misuse, licence sharing, or violation of our <a href="/terms">Terms</a>.</li>
            <li>The plan was a custom/enterprise agreement with separate terms.</li>
          </ul>
        </>
      ) : (
        <p>
          Because {company.brand} is a digital product delivered immediately and accessible in full upon payment, all
          sales are <strong>final and non-refundable</strong>. Please book a demo to evaluate the product before
          purchasing.
        </p>
      )}

      <h2>3. How to request a refund</h2>
      <p>
        Email <a href={`mailto:${company.supportEmail}`}>{company.supportEmail}</a> from your registered email address
        with your payment id (from your confirmation email) and the reason for the request. We aim to respond within
        2&ndash;4 business days.
      </p>

      <h2>4. Refund processing time</h2>
      <p>
        Once approved, refunds are processed through Razorpay to your original payment method. It typically takes
        <strong> 5&ndash;7 business days</strong> for the amount to reflect in your account, depending on your bank.
      </p>

      <h2>5. Cancellation</h2>
      <p>
        You may cancel at any time by contacting us. Your license stays valid for the one-year period already paid for —
        there is no auto-renewal, and we'll remind you before it expires so you can choose to renew. {days > 0 ? 'Cancellation outside the refund window does not entitle you to a refund of the current period.' : ''}
      </p>

      <h2>6. Contact</h2>
      <p>
        For any billing questions, contact{' '}
        <a href={`mailto:${company.supportEmail}`}>{company.supportEmail}</a>
        {company.phone ? <> or {company.phone}</> : null}.
      </p>
    </LegalPage>
  )
}
