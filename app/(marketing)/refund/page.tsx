import type { Metadata } from 'next'
import LegalPage from '@/components/marketing/LegalPage'
import { company } from '@/lib/company'

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy',
  description: 'Our policy on refunds and cancellations for ARC PEM subscriptions.',
  alternates: { canonical: '/refund' },
}

const UPDATED = '16 October 2026'
const days = company.refund.windowDays

export default function RefundPage() {
  return (
    <LegalPage title="Refund & Cancellation Policy" updated={UPDATED}>
      <p>
        This policy explains how refunds and cancellations work for {company.brand} subscriptions, provided by{' '}
        {company.legalName}. We want you to be confident in your purchase, so please read this carefully. We recommend
        booking a demo before purchasing.
      </p>

      <h2>1. Try before you buy</h2>
      <p>
        {company.brand} is sold as a subscription per firm, billed monthly or annually. A firm&apos;s first subscription
        starts with a free trial (its length is shown on our <a href="/pricing">Pricing</a> page): you set up auto-pay at the start, but nothing is charged until the trial ends,
        and if you turn off auto-renew before then you are not charged at all. You can also book a free live demo.
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
            <li>There is evidence of misuse, account sharing, or violation of our <a href="/terms">Terms</a>.</li>
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

      <h2>5. Auto-renewal and cancellation</h2>
      <p>
        Subscriptions renew automatically at the end of each billing period (monthly or annual) using the payment method
        you authorised at checkout — card, UPI AutoPay or bank e-mandate — at the price of your plan at that time. Your
        bank or UPI app may notify you before each charge, and we email a receipt and GST invoice after every payment.
      </p>
      <p>
        You can turn off auto-renewal at any time from <strong>Account &rarr; Subscription</strong> on {company.siteUrl.replace(/^https?:\/\//, '')},
        or by contacting us. No further charges are made after that, and your firm keeps full access until the end of
        the period already paid for. {days > 0 ? 'Cancelling outside the refund window does not entitle you to a refund of the current period.' : 'Payments already made for the current period are not refunded.'}
      </p>
      <p>
        If a renewal payment fails, we retry it over the following days. Your firm has a 14-day grace period after the
        paid period ends, after which the workspace becomes read-only until the plan is renewed. Your data is never
        deleted because of a lapsed payment and stays available to export.
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
