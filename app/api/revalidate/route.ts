import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'
import { submitToIndexNow } from '@/lib/indexnow'

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
  let kind: string | undefined
  try {
    const body = await req.json()
    slug = typeof body?.slug === 'string' ? body.slug : undefined
    kind = typeof body?.kind === 'string' ? body.kind : undefined
  } catch {
    /* body optional */
  }

  // { kind: 'plans' }: a plan's price or features changed in admin. The prices live in the HTML and JSON-LD of
  // the home and pricing pages and in the AI briefings.
  if (kind === 'plans') {
    for (const path of ['/', '/pricing', '/llms.txt', '/llms-full.txt']) revalidatePath(path)
    await submitToIndexNow(['/', '/pricing'])
    return NextResponse.json({ revalidated: true, kind, at: Date.now() })
  }

  // Listing, category archives, feed, sitemap and the AI briefing always change when any post does.
  revalidatePath('/blog')
  revalidatePath('/blog/category/[category]', 'page')
  revalidatePath('/blog/rss.xml')
  revalidatePath('/sitemap.xml')
  revalidatePath('/llms.txt')
  // The specific post (and its OG image share the segment).
  if (slug) revalidatePath(`/blog/${slug}`)

  // Ask Bing & co. to recrawl now rather than whenever they next visit (a deleted post's URL then 404s for them).
  await submitToIndexNow(['/blog', ...(slug ? [`/blog/${slug}`] : [])])

  return NextResponse.json({ revalidated: true, slug: slug ?? null, at: Date.now() })
}
