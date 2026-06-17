import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resources — ARC PEM Guides, Templates & Support',
  description: 'User guides, video tutorials, BOQ templates, GST export guides, and the help centre — everything you need to get the most out of ARC PEM.',
}

export default function ResourcesPage() {
  return (
    <section className="section" id="about" style={{ paddingTop: '120px' }}>
      <div className="container">
        <div className="sec-hd fade-up">
          <span className="badge badge-indigo">Resources</span>
          <h2>One Stop Shop for All Resources</h2>
          <p>Everything you need to get started and get the most out of ARC PEM.</p>
        </div>
        <div className="res-grid">
          {[
            {i:'📝',t:'User Guide',d:'Complete 860-page documentation covering every feature with step-by-step screenshots.',delay:''},
            {i:'📹',t:'Video Tutorials',d:'Step-by-step walkthroughs for BOQ creation, expense entry, and report generation.',delay:' d1'},
            {i:'📊',t:'Case Studies',d:'How 30+ firms reduced budget overruns and streamlined accounting with ARC PEM.',delay:' d2'},
            {i:'📥',t:'BOQ Templates',d:'Pre-built Bill of Quantities templates for residential, commercial, and MEP projects.',delay:' d3'},
            {i:'🧾',t:'GST Guide',d:'How to set up GST categories, generate the Purchase Register, and export to Tally.',delay:''},
            {i:'🆚',t:'ARC PEM vs. Others',d:'Side-by-side comparison with Excel, Tally, and other construction management tools.',delay:' d1'},
            {i:'🔔',t:'Product Updates',d:'Changelog, new features, and release notes for every ARC PEM version.',delay:' d2'},
            {i:'💬',t:'Help Centre',d:'FAQs, troubleshooting guides, and live support from the HashX Labs team.',delay:' d3'},
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
