import type { Metadata } from 'next'
import LegalPage from '@/components/marketing/LegalPage'
import { company } from '@/lib/company'

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy',
  description: 'How ARC PEM, a digital software product, is delivered to customers.',
}

const UPDATED = '18 June 2026'

export default function ShippingPage() {
  return (
    <LegalPage title="Shipping & Delivery Policy" updated={UPDATED}>
      <p>
        {company.brand} is a <strong>digital software product</strong>. There is no physical shipment. This policy
        explains how access is delivered after purchase.
      </p>

      <h2>1. Digital delivery</h2>
      <ul>
        <li>Once your payment is confirmed, your plan is activated <strong>automatically and instantly</strong> on your account.</li>
        <li>A payment confirmation and receipt are emailed to your registered address.</li>
        <li>The desktop application can be downloaded from your dashboard at any time.</li>
      </ul>

      <h2>2. Delivery timeline</h2>
      <p>
        Activation is immediate in almost all cases. In the rare event of a payment-confirmation delay from the bank or
        payment gateway, activation completes automatically once the payment is confirmed (typically within a few
        minutes).
      </p>

      <h2>3. If your plan is not activated</h2>
      <p>
        If your payment succeeded but your plan is not active within 30 minutes, please contact{' '}
        <a href={`mailto:${company.supportEmail}`}>{company.supportEmail}</a> with your payment id and we will resolve
        it promptly. No payment is ever lost — every transaction is recorded against your account.
      </p>

      <h2>4. No physical shipping</h2>
      <p>
        As a software-only product, {company.brand} does not ship any physical goods, and no shipping charges apply.
      </p>

      <h2>5. Contact</h2>
      <p>
        For delivery or access questions, contact{' '}
        <a href={`mailto:${company.supportEmail}`}>{company.supportEmail}</a>
        {company.phone ? <> or {company.phone}</> : null}.
      </p>
    </LegalPage>
  )
}
