import type { Metadata } from 'next'
import LegalPage from '@/components/marketing/LegalPage'
import { company } from '@/lib/company'

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy',
  description: 'Our policy on refunds and cancellations for ARC PEM subscriptions.',
}

const UPDATED = '18 June 2026'
const days = company.refund.windowDays

export default function RefundPage() {
  return (
    <LegalPage title="Refund & Cancellation Policy" updated={UPDATED}>
      <p>
        This policy explains how refunds and cancellations work for {company.brand} subscriptions, provided by{' '}
        {company.legalName}. We want you to be confident in your purchase, so please read this carefully and try the
        free trial before subscribing.
      </p>

      <h2>1. Free trial</h2>
      <p>
        {company.brand} offers a free trial so you can evaluate the software before paying. We strongly recommend using
        the trial to confirm the product meets your needs.
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
          sales are <strong>final and non-refundable</strong>. Please use the free trial to evaluate the product before
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
        You may cancel your subscription at any time by contacting us. Cancellation stops future renewals; your plan
        remains active for the period already paid for. {days > 0 ? 'Cancellation outside the refund window does not entitle you to a refund of the current period.' : ''}
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
