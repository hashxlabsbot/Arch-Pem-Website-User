import './final-cta.css'
import './site-ledger.css'
import './preloader.css'
import MarketingShell from '@/components/marketing/MarketingShell'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <MarketingShell>{children}</MarketingShell>
}
