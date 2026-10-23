import 'server-only'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import type { PlansByProduct } from '@/lib/seo-entity'
import { sortByTier } from '@/lib/plan-order'
import { getBillingRules } from '@/lib/billing-rules'

/**
 * The active plans for both products, read on the server so prices are in the
 * page's HTML and JSON-LD (crawlers and answer engines don't run the pricing
 * page's client-side fetch). Same filter and order as GET /api/plans. Never
 * throws: a database hiccup at build time leaves the lists empty and the
 * pricing page falls back to fetching in the browser.
 */
export async function getPublicPlans(): Promise<PlansByProduct> {
  try {
    const rows = await db.plan.findMany({
      where: { isActive: true, product: { in: ['DESKTOP', 'WEB'] } },
      orderBy: { price: 'asc' },
      select: {
        id: true,
        name: true,
        price: true,
        period: true,
        description: true,
        features: true,
        maxProjects: true,
        maxUsers: true,
        maxSiteUsers: true,
        product: true,
        tier: true,
      },
    })
    return {
      DESKTOP: rows.filter((r) => r.product === 'DESKTOP'),
      WEB: sortByTier(rows.filter((r) => r.product === 'WEB')),
      rules: await getBillingRules(),
    }
  } catch (err) {
    logger.error('getPublicPlans: could not load plans', err)
    return { DESKTOP: [], WEB: [], rules: await getBillingRules() }
  }
}
