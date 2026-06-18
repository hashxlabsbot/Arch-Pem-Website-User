import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Public, read-only. Returns the active plans the admin app manages, so the
// pricing page always reflects whatever is configured in admin.
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const plans = await db.plan.findMany({
      where: { isActive: true },
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
      },
    })

    return NextResponse.json({ plans })
  } catch (err) {
    console.error('[GET /api/plans]', err)
    return NextResponse.json({ error: 'Failed to load plans' }, { status: 500 })
  }
}
