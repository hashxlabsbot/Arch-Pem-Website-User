import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sortByTier } from '@/lib/plan-order'

// Public, read-only. Returns the active plans the admin app manages, so the
// pricing page always reflects whatever is configured in admin.
// ?product=WEB lists ARC PEM Web plans; anything else lists the desktop plans.
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const product = req.nextUrl.searchParams.get('product')?.toUpperCase() === 'WEB' ? 'WEB' : 'DESKTOP'
  try {
    const plans = await db.plan.findMany({
      where: { isActive: true, product },
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

    return NextResponse.json({ plans: product === 'WEB' ? sortByTier(plans) : plans })
  } catch (err) {
    console.error('[GET /api/plans]', err)
    return NextResponse.json({ error: 'Failed to load plans' }, { status: 500 })
  }
}
