import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import SessionProvider from '@/components/SessionProvider'
import DashboardShell from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Re-seeds the session this layout already fetched for the auth check above,
          so dashboard's useSession() consumers (Sidebar, Header) hydrate instantly
          instead of flashing unauthenticated — the root layout no longer does this
          fetch itself so public marketing/tools pages aren't forced fully dynamic. */}
      <SessionProvider session={session}>
        <DashboardShell>{children}</DashboardShell>
      </SessionProvider>
    </div>
  )
}
