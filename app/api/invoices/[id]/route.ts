import { NextResponse } from 'next/server'
import { getActiveSession } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** Downloads one of the signed-in customer's GST invoices as a PDF. Someone else's invoice is simply not found. */
export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const session = await getActiveSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const invoice = await db.invoice.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { invoiceNumber: true, pdf: true },
  })
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return new NextResponse(new Uint8Array(invoice.pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Invoice-${invoice.invoiceNumber.replace(/[^A-Za-z0-9-]/g, '-')}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
