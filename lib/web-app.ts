/**
 * ARC PEM Web (app.arcpem.com): firm subscriptions and keeping the web app told about them.
 *
 * The web app has its own database. It learns about a firm's plan two ways, both carrying the same shape (the
 * contract lives in the web app at src/lib/accounts/contract.ts):
 *   - at owner sign-in, inside the ID token this site issues (lib/oidc.ts), and
 *   - after every change, as a signed `subscription.updated` event. Events are written to WebhookOutbox in the same
 *     transaction as the change and delivered afterwards with retries, so a change is never lost if the web app is
 *     briefly unreachable. Each event carries the full current state, so order and repeats don't matter.
 *
 * Arc-Pem-Admin has a copy of this file for the changes made there; keep the two in step.
 */
import { createHmac, randomBytes } from 'crypto'
import { Prisma, type Plan, type WebSubscription } from '@prisma/client'
import { db } from '@/lib/db'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

export const WEB_TIERS = ['SOLO', 'STUDIO', 'ENTERPRISE'] as const

type SubscriptionWithPlan = WebSubscription & { plan: Plan }

/** The subscription in the shape the web app expects. Limits are explicit, so admin's plan settings are the truth. */
export function subscriptionState(sub: SubscriptionWithPlan) {
  return {
    plan: sub.plan.tier,
    status: sub.status,
    ends_at: sub.currentPeriodEnd?.toISOString() ?? null,
    seats: sub.seatLimit ?? sub.plan.maxUsers,
    projects: sub.projectLimit ?? sub.plan.maxProjects,
    updated_at: sub.updatedAt.toISOString(),
  }
}

/** Queues the current state of a subscription for delivery, inside the caller's transaction. Returns the event id. */
export async function enqueueSubscriptionUpdated(tx: Prisma.TransactionClient, subscriptionId: string) {
  const sub = await tx.webSubscription.findUniqueOrThrow({ where: { id: subscriptionId }, include: { plan: true } })
  const id = `evt_${randomBytes(12).toString('hex')}`
  const payload = {
    id,
    type: 'subscription.updated',
    created_at: new Date().toISOString(),
    data: { account: { id: sub.userId, name: sub.firmName }, subscription: subscriptionState(sub) },
  }
  await tx.webhookOutbox.create({ data: { id, type: payload.type, payload } })
  return id
}

const addYear = (d: Date) => {
  const next = new Date(d)
  next.setFullYear(next.getFullYear() + 1)
  return next
}

/**
 * Applies one paid year of a web plan, inside the caller's transaction. Renewal-safe: a year bought while the
 * current one is still running starts when it ends. `paymentRef` is unique in WebSubscriptionPayment, so the same
 * payment reported twice (this site and the admin app both hear from Razorpay) raises P2002 and the caller's
 * transaction rolls back: see isDuplicatePayment.
 */
export async function activateWebTerm(
  tx: Prisma.TransactionClient,
  input: { userId: string; plan: Plan; paymentRef: string; amount: number; now?: Date },
) {
  const now = input.now ?? new Date()
  if (input.plan.product !== 'WEB' || !input.plan.tier) throw new Error(`Plan ${input.plan.id} is not a web plan`)
  const [existing, user] = await Promise.all([
    tx.webSubscription.findUnique({ where: { userId: input.userId } }),
    tx.user.findUniqueOrThrow({
      where: { id: input.userId },
      select: { name: true, billingProfile: { select: { legalName: true } } },
    }),
  ])
  const running = existing?.status === 'ACTIVE' && existing.currentPeriodEnd && existing.currentPeriodEnd > now
  const periodStart = running ? existing!.currentPeriodEnd! : now
  const periodEnd = addYear(periodStart)

  const sub = await tx.webSubscription.upsert({
    where: { userId: input.userId },
    create: {
      userId: input.userId,
      firmName: user.billingProfile?.legalName ?? user.name,
      planId: input.plan.id,
      status: 'ACTIVE',
      currentPeriodEnd: periodEnd,
    },
    update: { planId: input.plan.id, status: 'ACTIVE', currentPeriodEnd: periodEnd },
  })
  await tx.webSubscriptionPayment.create({
    data: {
      subscriptionId: sub.id,
      paymentRef: input.paymentRef,
      planId: input.plan.id,
      amount: input.amount,
      periodStart,
      periodEnd,
    },
  })
  const eventId = await enqueueSubscriptionUpdated(tx, sub.id)
  return { subscriptionId: sub.id, periodEnd, eventId }
}

export const isDuplicatePayment = (err: unknown) =>
  err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'

/** `t=<unix seconds>,v1=<hex HMAC-SHA256 of "<t>.<body>">`, as the web app verifies it. */
export function signatureHeader(secret: string, body: string, timestamp = Math.floor(Date.now() / 1000)) {
  return `t=${timestamp},v1=${createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')}`
}

const MAX_ATTEMPTS = 12
const LEASE_MS = 2 * 60_000
/** 30s, 1m, 2m … capped at 6h: about two days of retries before an event is marked FAILED for a human to look at. */
const backoffMs = (attempts: number) => Math.min(30_000 * 2 ** (attempts - 1), 6 * 60 * 60_000)

/**
 * Sends due events to the web app. Safe to run from several places at once (after a change, and from the cron
 * route): each event is leased before sending, and the web app ignores an event id it has already processed.
 */
export async function deliverOutbox({ ids, limit = 20 }: { ids?: string[]; limit?: number } = {}) {
  const url = env.webAppUrl()
  const secret = env.webAppWebhookSecret()
  if (!url || !secret) {
    logger.warn('web-app outbox: WEB_APP_URL / WEB_APP_WEBHOOK_SECRET not set; events stay queued')
    return { delivered: 0, failed: 0, retrying: 0 }
  }
  const due = await db.webhookOutbox.findMany({
    where: { status: 'PENDING', nextAttemptAt: { lte: new Date() }, ...(ids ? { id: { in: ids } } : {}) },
    orderBy: { createdAt: 'asc' },
    take: limit,
  })
  const counts = { delivered: 0, failed: 0, retrying: 0 }
  for (const event of due) {
    const lease = await db.webhookOutbox.updateMany({
      where: { id: event.id, status: 'PENDING', nextAttemptAt: event.nextAttemptAt },
      data: { nextAttemptAt: new Date(Date.now() + LEASE_MS) },
    })
    if (lease.count === 0) continue

    const body = JSON.stringify(event.payload)
    let error = ''
    let permanent = false
    try {
      const res = await fetch(`${url}/api/webhooks/accounts`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-arcpem-signature': signatureHeader(secret, body) },
        body,
        signal: AbortSignal.timeout(10_000),
      })
      if (!res.ok) {
        error = `HTTP ${res.status}: ${(await res.text().catch(() => '')).slice(0, 300)}`
        // The web app answers 400/401/413 only for a delivery that can never succeed as sent.
        permanent = res.status === 400 || res.status === 401 || res.status === 413
      }
    } catch (err) {
      error = String(err).slice(0, 300)
    }

    const attempts = event.attempts + 1
    if (!error) {
      await db.webhookOutbox.update({
        where: { id: event.id },
        data: { status: 'DELIVERED', attempts, deliveredAt: new Date(), lastError: null },
      })
      counts.delivered++
    } else if (permanent || attempts >= MAX_ATTEMPTS) {
      await db.webhookOutbox.update({ where: { id: event.id }, data: { status: 'FAILED', attempts, lastError: error } })
      logger.error('web-app outbox: event failed permanently', undefined, { id: event.id, error })
      counts.failed++
    } else {
      await db.webhookOutbox.update({
        where: { id: event.id },
        data: { attempts, lastError: error, nextAttemptAt: new Date(Date.now() + backoffMs(attempts)) },
      })
      counts.retrying++
    }
  }
  return counts
}
