import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const noContent = () => new NextResponse(null, { status: 204 })

/** Start-of-day (UTC) — the bucket for both the daily rollup and the visitor de-dup. */
function today(): Date {
  const d = new Date()
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  return (fwd ? fwd.split(',')[0] : '').trim() || req.headers.get('x-real-ip') || 'unknown'
}

/**
 * First-party view beacon for blog posts. Called once per session per article by
 * <ViewBeacon>. Increments the daily rollup (BlogPostView) and, for a visitor not
 * seen today, the unique/reach counter. Always returns 204 so the beacon is silent.
 */
export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get('user-agent') ?? ''
    // Ignore obvious non-humans / malformed calls — they must not inflate counts.
    if (!ua || ua.length < 8) return noContent()

    let slug: string | undefined
    try {
      slug = (await req.json())?.slug
    } catch {
      return noContent()
    }
    if (!slug || typeof slug !== 'string' || slug.length > 200) return noContent()

    const ip = clientIp(req)
    // Light abuse guard: cap beacons per IP.
    const limited = await rateLimit(`blogview:${ip}`, 120, 60_000)
    if (!limited.allowed) return noContent()

    // Only count real, published posts.
    const post = await db.blogPost.findFirst({ where: { slug, status: 'PUBLISHED' }, select: { id: true } })
    if (!post) return noContent()

    const date = today()
    const salt = process.env.REVALIDATE_SECRET ?? 'blog-view-salt'
    const visitorHash = createHash('sha256')
      .update(`${ip}|${ua}|${date.toISOString().slice(0, 10)}|${salt}`)
      .digest('hex')

    // New unique visitor for this post today? The composite PK insert fails on repeat.
    let isUnique = false
    try {
      await db.blogPostVisit.create({ data: { slug, date, visitorHash } })
      isUnique = true
    } catch {
      isUnique = false
    }

    await Promise.all([
      db.blogPostView.upsert({
        where: { slug_date: { slug, date } },
        create: { slug, date, views: 1, uniques: isUnique ? 1 : 0 },
        update: { views: { increment: 1 }, ...(isUnique ? { uniques: { increment: 1 } } : {}) },
      }),
      db.blogPost.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } }),
    ])

    return noContent()
  } catch (err) {
    logger.error('POST /api/blog/view failed', err)
    return noContent()
  }
}
