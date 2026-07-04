import type { Metadata } from 'next'
import Image from 'next/image'
import {
  DocumentIcon, VideoIcon, DashboardIcon, DownloadIcon,
  ReceiptIcon, CompareIcon, BellIcon, ChatIcon,
} from '@/components/icons'

const ICON = { size: 26, color: '#4f46e5' }

export const metadata: Metadata = {
  title: 'Resources — ARC PEM Guides, Templates & Support',
  description: 'User guides, video tutorials, BOQ templates, GST export guides, and the help centre — everything you need to get the most out of ARC PEM.',
  alternates: { canonical: '/resources' },
}

export default function ResourcesPage() {
  return (
    <section className="section" id="about" style={{ paddingTop: '120px' }}>
      <div className="container">
        <div className="img-hero fade-up">
          <Image src="/images/blueprint-plans.jpg" alt="Architect working on construction blueprints" fill priority sizes="100vw" />
          <div className="img-hero-inner">
            <span className="badge badge-indigo">Resources</span>
            <h1>Everything you need to master ARC PEM</h1>
            <p>Guides, video walkthroughs, ready-made BOQ templates and a complete GST-to-Tally workflow — from your first project to your hundredth.</p>
          </div>
        </div>
        <div className="sec-hd fade-up">
          <span className="badge badge-indigo">Resources</span>
          <h2>One Stop Shop for All Resources</h2>
          <p>Everything you need to get started and get the most out of ARC PEM.</p>
        </div>
        <div className="res-grid">
          {[
            {i:<DocumentIcon {...ICON} />, t:'User Guide',d:'Complete 860-page documentation covering every feature with step-by-step screenshots.',delay:''},
            {i:<VideoIcon {...ICON} />,    t:'Video Tutorials',d:'Step-by-step walkthroughs for BOQ creation, expense entry, and report generation.',delay:' d1'},
            {i:<DashboardIcon {...ICON} />,t:'Case Studies',d:'How 30+ firms reduced budget overruns and streamlined accounting with ARC PEM.',delay:' d2'},
            {i:<DownloadIcon {...ICON} />, t:'BOQ Templates',d:'Pre-built Bill of Quantities templates for residential, commercial, and MEP projects.',delay:' d3'},
            {i:<ReceiptIcon {...ICON} />,  t:'GST Guide',d:'How to set up GST categories, generate the Purchase Register, and export to Tally.',delay:''},
            {i:<CompareIcon {...ICON} />,  t:'ARC PEM vs. Others',d:'Side-by-side comparison with Excel, Tally, and other construction management tools.',delay:' d1'},
            {i:<BellIcon {...ICON} />,     t:'Product Updates',d:'Changelog, new features, and release notes for every ARC PEM version.',delay:' d2'},
            {i:<ChatIcon {...ICON} />,     t:'Help Centre',d:'FAQs, troubleshooting guides, and live support from the HashX Labs team.',delay:' d3'},
          ].map(r=>(
            <div key={r.t} className={`res-tile fade-up${r.delay}`}>
              <div className="res-tile-icon">{r.i}</div>
              <div className="res-tile-title">{r.t}</div>
              <div className="res-tile-desc">{r.d}</div>
              <div className="res-tile-link">Learn More →</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
