/**
 * Authoritative payment activation logic, shared by the post-checkout `verify`
 * route and the Razorpay `webhook`. Keeping it here means the security checks
 * live in exactly one place and both entry points behave identically.
 *
 * Trust model: the plan and buyer are derived from the Razorpay ORDER's
 * server-set `notes` (written in create-order) — NEVER from the client. The
 * payment is independently fetched from Razorpay and confirmed captured, with
 * amount/currency cross-checked against the order and the current plan price.
 *
 * Idempotency / audit trail: each processed payment is recorded as a
 * `PendingPayment` row keyed on the Razorpay payment id (stored in `utr`,
 * `status: 'paid'`). Re-delivery (webhook retry) or a verify+webhook race is a
 * no-op. NOTE: the shared schema has no DB-level unique constraint on `utr`
 * (it is owned by the admin app), so dedup is enforced in-app via a pre-check
 * inside a transaction; the worst-case residual of a true simultaneous race is
 * a duplicate audit row — never a wrong plan or a double charge.
 */
import Razorpay from 'razorpay'
import { db } from '@/lib/db'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import { sendPaymentSuccessEmail } from '@/lib/email'
import { annualPrice } from '@/lib/pricing'

/** Lazily build a Razorpay client; returns null when keys are not configured. */
export function getRazorpay(): Razorpay | null {
  const keyId = env.razorpayKeyId()
  const keySecret = env.razorpayKeySecret()
  if (!keyId || !keySecret) return null
  return new Razorpay({ key_id: keyId, key_secret: keySecret })
}

export type ActivationResult =
  | { ok: true; alreadyProcessed: boolean; planName: string }
  | { ok: false; status: number; error: string }


/**
 * Verify a captured Razorpay payment against its order and activate the plan.
 *
 * @param orderId        Razorpay order id (razorpay_order_id).
 * @param paymentId      Razorpay payment id (razorpay_payment_id).
 * @param expectedUserId When called from the browser verify flow, the
 *                       authenticated user id — must match the order's notes.
 *                       Omit for webhook (server-to-server, no session).
 */
export async function activatePaidPlan({
  orderId,
  paymentId,
  expectedUserId,
}: {
  orderId: string
  paymentId: string
  expectedUserId?: string
}): Promise<ActivationResult> {
  // Fast idempotency path: already recorded → succeed without re-processing.
  const existing = await db.pendingPayment.findFirst({ where: { utr: paymentId } })
  if (existing) {
    return { ok: true, alreadyProcessed: true, planName: existing.planName }
  }

  const razorpay = getRazorpay()
  if (!razorpay) {
    logger.error('activatePaidPlan: Razorpay keys not configured')
    return { ok: false, status: 503, error: 'Payment processing is not configured.' }
  }

  // Fetch order + payment from Razorpay — the source of truth. (Razorpay's SDK
  // types use callback overloads, so we cast the resolved values structurally.)
  let order: { amount: number | string; currency: string; notes?: Record<string, string> }
  let payment: { order_id: string; status: string; amount: number | string; currency: string }
  try {
    order = (await razorpay.orders.fetch(orderId)) as typeof order
    payment = (await razorpay.payments.fetch(paymentId)) as typeof payment
  } catch (err) {
    logger.error('activatePaidPlan: failed to fetch order/payment', err, { orderId, paymentId })
    return { ok: false, status: 502, error: 'Could not verify payment with Razorpay.' }
  }

  // The payment must belong to the order, be captured, and match amount/currency.
  if (payment.order_id !== orderId) {
    logger.warn('activatePaidPlan: payment/order mismatch', { orderId, paymentId, paymentOrderId: payment.order_id })
    return { ok: false, status: 400, error: 'Payment does not match order.' }
  }
  if (payment.status !== 'captured') {
    logger.warn('activatePaidPlan: payment not captured', { paymentId, status: payment.status })
    return { ok: false, status: 400, error: 'Payment has not been captured.' }
  }
  if (order.currency !== 'INR' || payment.currency !== 'INR') {
    return { ok: false, status: 400, error: 'Unsupported currency.' }
  }
  if (Number(payment.amount) !== Number(order.amount)) {
    logger.warn('activatePaidPlan: payment/order amount mismatch', { orderId, orderAmount: order.amount, paymentAmount: payment.amount })
    return { ok: false, status: 400, error: 'Payment amount mismatch.' }
  }

  // Derive plan + buyer from the SERVER-SET order notes — never trust the client.
  const notes = (order.notes ?? {}) as Record<string, string>
  const userId = notes.userId
  const planId = notes.planId
  if (!userId || !planId) {
    logger.error('activatePaidPlan: order is missing notes', { orderId })
    return { ok: false, status: 400, error: 'Order is missing plan information.' }
  }
  if (expectedUserId && expectedUserId !== userId) {
    logger.warn('activatePaidPlan: order does not belong to caller', { orderId, expectedUserId, userId })
    return { ok: false, status: 403, error: 'This order does not belong to you.' }
  }

  const plan = await db.plan.findUnique({ where: { id: planId } })
  if (!plan) return { ok: false, status: 400, error: 'Plan no longer exists.' }
  // Cross-check the captured amount against the current annual plan price (paise).
  const yearly = annualPrice(plan.price)
  if (Number(order.amount) !== Math.round(yearly * 100)) {
    logger.warn('activatePaidPlan: amount does not match annual plan price', { orderId, orderAmount: order.amount, yearly })
    return { ok: false, status: 400, error: 'Paid amount does not match the plan price.' }
  }

  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) return { ok: false, status: 400, error: 'User not found.' }

  // Record the payment + activate the plan atomically. Re-check inside the
  // transaction to narrow the verify/webhook race window.
  let alreadyProcessed = false
  try {
    await db.$transaction(async (tx) => {
      const dup = await tx.pendingPayment.findFirst({ where: { utr: paymentId } })
      if (dup) {
        alreadyProcessed = true
        return
      }
      await tx.pendingPayment.create({
        data: {
          userId,
          planId: plan.id,
          planName: plan.name,
          amount: yearly,
          utr: paymentId,
          status: 'paid',
        },
      })
      await tx.user.update({ where: { id: userId }, data: { planId: plan.id } })
    })
  } catch (err) {
    logger.error('activatePaidPlan: activation transaction failed', err, { orderId, paymentId })
    return { ok: false, status: 500, error: 'Could not activate plan.' }
  }

  if (alreadyProcessed) {
    return { ok: true, alreadyProcessed: true, planName: plan.name }
  }

  // Confirmation email — non-blocking; failure must not fail activation.
  sendPaymentSuccessEmail({
    to: user.email,
    name: user.name ?? 'there',
    planName: plan.name,
    amount: yearly,
    paymentId,
  }).catch((err: unknown) => logger.error('payment success email failed', err))

  return { ok: true, alreadyProcessed: false, planName: plan.name }
}
