import { NextRequest, NextResponse } from 'next/server'
import { getActiveSession } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await getActiveSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  if (name.trim().length < 2) return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 })

  await db.user.update({
    where: { id: session.user.id },
    data:  { name: name.trim() },
  })

  return NextResponse.json({ success: true })
}
