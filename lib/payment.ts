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
import { sendPaymentSuccessEmail, sendTrialStartedEmail } from '@/lib/email'
import { annualPrice } from '@/lib/pricing'
import {
  activateWebTerm,
  applyRenewalChange,
  deliverOutbox,
  isDuplicatePayment,
  readSubscriptionCharge,
  startTrial,
  type RazorpayPaymentEntity,
  type RazorpaySubscriptionEntity,
} from '@/lib/web-app'

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
  let webEventId: string | null = null
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
      if (plan.product === 'WEB') {
        // ARC PEM Web: a firm subscription, not a desktop license, so User.planId is left alone.
        const term = await activateWebTerm(tx, { userId, plan, paymentRef: paymentId, amount: yearly })
        webEventId = term.eventId
      } else {
        await tx.user.update({ where: { id: userId }, data: { planId: plan.id } })
      }
    })
  } catch (err) {
    // The admin app's Razorpay webhook applied this web payment first (paymentRef is unique): nothing left to do.
    if (plan.product === 'WEB' && isDuplicatePayment(err)) return { ok: true, alreadyProcessed: true, planName: plan.name }
    logger.error('activatePaidPlan: activation transaction failed', err, { orderId, paymentId })
    return { ok: false, status: 500, error: 'Could not activate plan.' }
  }

  if (alreadyProcessed) {
    return { ok: true, alreadyProcessed: true, planName: plan.name }
  }

  // Tell the web app now; anything that doesn't get through is retried by /api/cron/web-app-outbox.
  if (webEventId) {
    await deliverOutbox({ ids: [webEventId] }).catch((err: unknown) =>
      logger.error('activatePaidPlan: web-app delivery failed (will retry)', err),
    )
  }

  // Confirmation email — non-blocking; failure must not fail activation.
  sendPaymentSuccessEmail({
    to: user.email,
    name: user.name ?? 'there',
    planName: plan.name,
    amount: yearly,
    paymentId,
    webAppUrl: plan.product === 'WEB' ? env.webAppUrl() : undefined,
  }).catch((err: unknown) => logger.error('payment success email failed', err))

  return { ok: true, alreadyProcessed: false, planName: plan.name }
}

export type ChargeResult =
  | { ok: true; alreadyProcessed: boolean; planName: string }
  | { ok: false; status: number; error: string }

/**
 * Applies one captured charge of an ARC PEM subscription: the first payment from the browser's verify call, and
 * every charge (first and renewals) from the `subscription.charged` webhook. Idempotent by payment id, and safe
 * against the admin app's webhook applying the same charge (WebSubscriptionPayment.paymentRef is unique).
 *
 * @param expectedUserId From the browser verify flow: the signed-in user, who must own the subscription.
 */
export async function applySubscriptionCharge({
  subscription,
  payment,
  expectedUserId,
}: {
  subscription: RazorpaySubscriptionEntity
  payment: RazorpayPaymentEntity
  expectedUserId?: string
}): Promise<ChargeResult> {
  const existing = await db.pendingPayment.findFirst({ where: { utr: payment.id } })
  if (existing) {
    await retireReplacedSubscription(subscription)
    return { ok: true, alreadyProcessed: true, planName: existing.planName }
  }

  const charge = await readSubscriptionCharge(db, subscription, payment)
  if (!charge.ok) {
    logger.warn('applySubscriptionCharge: rejected', { subscriptionId: subscription.id, paymentId: payment.id, reason: charge.reason })
    return { ok: false, status: 400, error: 'This payment could not be matched to an ARC PEM plan.' }
  }
  if (expectedUserId && expectedUserId !== charge.userId) {
    logger.warn('applySubscriptionCharge: subscription does not belong to caller', { subscriptionId: subscription.id, expectedUserId })
    return { ok: false, status: 403, error: 'This subscription does not belong to you.' }
  }
  const user = await db.user.findUnique({ where: { id: charge.userId } })
  if (!user) return { ok: false, status: 400, error: 'User not found.' }

  let term: Awaited<ReturnType<typeof activateWebTerm>> | null = null
  try {
    term = await db.$transaction(async (tx) => {
      if (await tx.pendingPayment.findFirst({ where: { utr: payment.id } })) return null
      await tx.pendingPayment.create({
        data: { userId: user.id, planId: charge.plan.id, planName: charge.plan.name, amount: charge.amount, utr: payment.id, status: 'paid' },
      })
      return activateWebTerm(tx, {
        userId: user.id,
        plan: charge.plan,
        paymentRef: payment.id,
        amount: charge.amount,
        interval: charge.interval,
        razorpay: { subscriptionId: subscription.id, firstCharge: charge.firstCharge },
        addons: charge.addons,
      })
    })
  } catch (err) {
    if (isDuplicatePayment(err)) {
      await retireReplacedSubscription(subscription)
      return { ok: true, alreadyProcessed: true, planName: charge.plan.name }
    }
    logger.error('applySubscriptionCharge: activation failed', err, { subscriptionId: subscription.id, paymentId: payment.id })
    return { ok: false, status: 500, error: 'Could not activate plan.' }
  }
  await retireReplacedSubscription(subscription)
  if (!term) return { ok: true, alreadyProcessed: true, planName: charge.plan.name }

  await deliverOutbox({ ids: [term.eventId] }).catch((err: unknown) =>
    logger.error('applySubscriptionCharge: web-app delivery failed (will retry)', err),
  )

  sendPaymentSuccessEmail({
    to: user.email,
    name: user.name ?? 'there',
    planName: charge.plan.name,
    amount: charge.amount,
    paymentId: payment.id,
    webAppUrl: env.webAppUrl(),
    billing: { interval: charge.interval, renewsOn: term.periodEnd, renewal: !charge.firstCharge },
  }).catch((err: unknown) => logger.error('subscription payment email failed', err))

  return { ok: true, alreadyProcessed: false, planName: charge.plan.name }
}

/**
 * A plan or billing switch: once the new subscription's first charge has gone through (whichever app applied it),
 * the firm's previous Razorpay subscription, named in the new one's server-set notes, must not charge again.
 * Razorpay refuses to cancel a subscription twice, so repeats of this are harmless.
 */
async function retireReplacedSubscription(subscription: RazorpaySubscriptionEntity) {
  const notes = Array.isArray(subscription.notes) ? {} : ((subscription.notes ?? {}) as Record<string, string>)
  if (!notes.replaces || notes.replaces === subscription.id || (subscription.paid_count ?? 1) > 1) return
  const razorpay = getRazorpay()
  if (!razorpay) return
  try {
    const old = (await razorpay.subscriptions.fetch(notes.replaces)) as unknown as { status: string }
    if (['cancelled', 'completed', 'expired'].includes(old.status)) return
    await razorpay.subscriptions.cancel(notes.replaces, false)
    logger.info('retired replaced subscription', { replaced: notes.replaces, by: subscription.id })
  } catch (err) {
    logger.error('retireReplacedSubscription: could not cancel the replaced subscription', err, { replaced: notes.replaces })
  }
}

/**
 * Stops a Razorpay subscription from charging again, because the owner turned auto-renew off or switched plans.
 * It is cancelled at Razorpay straight away (cancel-at-cycle-end is not available for every payment method); the
 * time already paid for is ours to keep track of and is never taken away.
 */
export async function stopRenewals(razorpaySubscriptionId: string): Promise<boolean> {
  const razorpay = getRazorpay()
  if (!razorpay) return false
  try {
    await razorpay.subscriptions.cancel(razorpaySubscriptionId, false)
  } catch (err) {
    logger.error('stopRenewals: Razorpay cancel failed', err, { razorpaySubscriptionId })
    return false
  }
  const eventId = await db.$transaction((tx) => applyRenewalChange(tx, razorpaySubscriptionId, 'cancelled'))
  if (eventId) await deliverOutbox({ ids: [eventId] }).catch(() => undefined)
  return true
}

/**
 * Starts the free trial of a subscription whose auto-pay was just set up (from the verify call or the
 * `subscription.authenticated` webhook). Safe to call more than once. The trial end comes from the server-set notes.
 */
export async function startSubscriptionTrial(subscription: RazorpaySubscriptionEntity): Promise<ChargeResult> {
  const notes = (Array.isArray(subscription.notes) ? {} : subscription.notes ?? {}) as Record<string, string>
  const ends = new Date(notes.trialEndsAt ?? '')
  if (notes.trial !== '1' || Number.isNaN(ends.getTime())) return { ok: false, status: 400, error: 'Not a trial subscription.' }
  // Only once auto-pay has really been authorised at Razorpay.
  if (!['authenticated', 'active'].includes(subscription.status)) {
    return { ok: false, status: 400, error: 'Auto-pay has not been set up for this subscription yet.' }
  }
  let eventId: string | null
  try {
    eventId = await db.$transaction((tx) => startTrial(tx, { subscription, trialEndsAt: ends }))
  } catch (err) {
    if (isDuplicatePayment(err)) return { ok: true, alreadyProcessed: true, planName: '' }
    logger.error('startSubscriptionTrial: failed', err, { subscriptionId: subscription.id })
    return { ok: false, status: 500, error: 'Could not start the trial.' }
  }
  if (eventId) {
    await deliverOutbox({ ids: [eventId] }).catch((err: unknown) => logger.error('trial: web-app delivery failed (will retry)', err))
    const user = notes.userId ? await db.user.findUnique({ where: { id: notes.userId } }) : null
    const plan = notes.planId ? await db.plan.findUnique({ where: { id: notes.planId } }) : null
    if (user && plan) {
      sendTrialStartedEmail({
        to: user.email,
        name: user.name ?? 'there',
        planName: plan.name.replace(/^web\s+/i, 'ARC PEM '),
        trialEndsAt: ends,
        webAppUrl: env.webAppUrl(),
      }).catch((err: unknown) => logger.error('trial email failed', err))
    }
  }
  return { ok: true, alreadyProcessed: !eventId, planName: '' }
}
