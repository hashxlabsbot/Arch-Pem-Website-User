import { env } from '@/lib/env'

/**
 * The IndexNow ownership key (see lib/indexnow.ts). Search engines fetch this
 * to confirm that URL submissions for arcpem.com really come from us.
 */
export const dynamic = 'force-dynamic'

export function GET() {
  const key = env.indexNowKey()
  if (!key) return new Response('Not found', { status: 404 })
  return new Response(key, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
