import 'server-only'
import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { DEFAULT_BILLING_RULES, type BillingRules } from '@/lib/pricing'

const TTL_MS = 60_000
let cached: { at: number; rules: BillingRules } | null = null

/**
 * The billing rules staff set in admin Settings (add-on seat prices, trial, annual discount). Cached for a minute;
 * the defaults apply if the row is missing or the database can't be reached, so pages never fail over it.
 */
export async function getBillingRules(client: Prisma.TransactionClient | typeof db = db): Promise<BillingRules> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.rules
  try {
    const row = await client.billingSettings.findUnique({ where: { id: 'default' } })
    const rules = row
      ? {
          seatAddonMonthly: row.seatAddonMonthly,
          siteSeatAddonMonthly: row.siteSeatAddonMonthly,
          annualBilledMonths: row.annualBilledMonths,
          trialDays: row.trialDays,
          maxAddonSeats: row.maxAddonSeats,
        }
      : DEFAULT_BILLING_RULES
    cached = { at: Date.now(), rules }
    return rules
  } catch (err) {
    logger.error('getBillingRules: using defaults', err)
    return DEFAULT_BILLING_RULES
  }
}
