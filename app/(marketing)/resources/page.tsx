import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import PageSchema from '@/components/seo/PageSchema'
import {
  DocumentIcon, DashboardIcon, CalculatorIcon,
  ReceiptIcon, CompareIcon, BellIcon, ChatIcon, GlobeIcon,
} from '@/components/icons'

const ICON = { size: 26, color: '#4f46e5' }

const TITLE = 'Resources — Guides, Glossary, Tools & Support'
const DESCRIPTION =
  'Buyer’s guide, construction finance glossary, free calculators, comparisons, customer stories and support — everything you need to choose and get the most out of ARC PEM.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/resources' },
  openGraph: { title: `${TITLE} · ARC PEM`, description: DESCRIPTION, url: '/resources', images: [{ url: '/og-image.jpg', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: `${TITLE} · ARC PEM`, description: DESCRIPTION, images: ['/og-image.jpg'] },
}

// Every tile goes somewhere real: a dead-end "Learn more" helps neither readers nor crawlers.
const RESOURCES = [
  { i: <DocumentIcon {...ICON} />, t: 'Buyer’s Guide', d: 'How to choose construction project and expense software in India — GST, Tally, BOQ, labour and team access compared.', href: '/guides/best-construction-software-india', delay: '' },
  { i: <ReceiptIcon {...ICON} />, t: 'Construction Glossary', d: 'BOQ, RA bills, measurement books, retention, GSTR-2B and input tax credit, explained in plain English.', href: '/glossary', delay: ' d1' },
  { i: <CalculatorIcon {...ICON} />, t: 'Free Calculators', d: 'Construction cost, concrete and bar bending schedule calculators, plus a GST contractor bill generator.', href: '/tools', delay: ' d2' },
  { i: <GlobeIcon {...ICON} />, t: 'ARC PEM + Tally', d: 'What ARC PEM does, what Tally does, and how firms use both.', href: '/compare/arc-pem-and-tally', delay: ' d3' },
  { i: <CompareIcon {...ICON} />, t: 'ARC PEM vs Excel', d: 'When spreadsheets stop working for project costs, and what changes when you move to ARC PEM.', href: '/compare/arc-pem-vs-excel', delay: '' },
  { i: <DashboardIcon {...ICON} />, t: 'Customer Stories', d: 'How architecture studios and construction firms cut GST reconciliation time and recovered pending dues.', href: '/about', delay: ' d1' },
  { i: <BellIcon {...ICON} />, t: 'Blog', d: 'Practical articles on construction costing, GST, labour and running a profitable firm.', href: '/blog', delay: ' d2' },
  { i: <ChatIcon {...ICON} />, t: 'Help & Support', d: 'Questions about the product, a purchase or your subscription — talk to the Hash X Labs team.', href: '/contact', delay: ' d3' },
]

export default function ResourcesPage() {
  return (
    <>
    <PageSchema type="CollectionPage" path="/resources" name={TITLE} description={DESCRIPTION} trail={[{ name: 'Resources', path: '/resources' }]} />
    <section className="section" id="about" style={{ paddingTop: '120px' }}>
      <div className="container">
        <div className="img-hero fade-up">
          <Image src="/images/blueprint-plans.jpg" alt="Architect working on construction blueprints" fill priority sizes="100vw" />
          <div className="img-hero-inner">
            <span className="badge badge-indigo">Resources</span>
            <h1>Everything you need to master ARC PEM</h1>
            <p>Guides, a construction finance glossary, free calculators and comparisons — from choosing software to running your hundredth project.</p>
          </div>
        </div>
        <div className="sec-hd fade-up">
          <span className="badge badge-indigo">Resources</span>
          <h2>One Stop Shop for All Resources</h2>
          <p>Everything you need to get started and get the most out of ARC PEM.</p>
        </div>
        <div className="res-grid">
          {RESOURCES.map((r) => (
            <Link key={r.t} href={r.href} className={`res-tile fade-up${r.delay}`} style={{ textDecoration: 'none' }}>
              <div className="res-tile-icon">{r.i}</div>
              <div className="res-tile-title">{r.t}</div>
              <div className="res-tile-desc">{r.d}</div>
              <div className="res-tile-link">Learn More →</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
    </>
  )
}
