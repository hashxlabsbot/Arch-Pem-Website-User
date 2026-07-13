import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * Called machine-to-machine by the admin app (Arc-Pem-Admin) when a blog post
 * is published/edited/deleted, so the affected static pages rebuild immediately
 * — a post goes live within seconds, no redeploy. Authenticated by a shared
 * secret, NOT a user session (the caller is a server, not a browser).
 */
export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) {
    logger.error('POST /api/revalidate: REVALIDATE_SECRET not configured')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }
  if (req.headers.get('x-revalidate-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let slug: string | undefined
  try {
    slug = (await req.json())?.slug
  } catch {
    /* body optional */
  }

  // Listing, category archives, feed and sitemap always change when any post does.
  revalidatePath('/blog')
  revalidatePath('/blog/category/[category]', 'page')
  revalidatePath('/blog/rss.xml')
  revalidatePath('/sitemap.xml')
  // The specific post (and its OG image share the segment).
  if (slug) revalidatePath(`/blog/${slug}`)

  return NextResponse.json({ revalidated: true, slug: slug ?? null, at: Date.now() })
}
