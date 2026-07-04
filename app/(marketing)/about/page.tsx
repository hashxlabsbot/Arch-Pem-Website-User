import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'About Us — ARC PEM Customer Success Stories',
  description: 'See how architecture studios and construction firms across India use ARC PEM to reduce costs, speed up accounting, and take control of project finances.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <section className="section bg-gray" id="testimonials" style={{ paddingTop: '120px' }}>
      <div className="container">
        <div className="img-hero fade-up">
          <Image src="/images/management-team.jpg" alt="Construction and architecture team reviewing a project" fill priority sizes="100vw" />
          <div className="img-hero-inner">
            <span className="badge badge-indigo">About ARC PEM</span>
            <h1>Software built alongside India&apos;s builders</h1>
            <p>We spent two years on real sites and in real studios — watching how architects, contractors and accountants actually move money. ARC PEM is the result: one platform that fits the way Indian construction firms work.</p>
            <div className="img-hero-stats">
              <div className="img-hero-stat"><div className="ihs-num">30+</div><div className="ihs-lbl">Firms onboard</div></div>
              <div className="img-hero-stat"><div className="ihs-num">₹120Cr+</div><div className="ihs-lbl">Project value tracked</div></div>
              <div className="img-hero-stat"><div className="ihs-num">100%</div><div className="ihs-lbl">Offline &amp; secure</div></div>
            </div>
          </div>
        </div>
        <div className="sec-hd fade-up">
          <span className="badge badge-indigo">Customer Stories</span>
          <h2>Our Customer Success Stories</h2>
          <p>See how architecture studios and construction firms across India use ARC PEM to reduce costs, speed up accounting, and take complete control of project finances.</p>
        </div>
        <div className="case-grid">
          {[
            { initials: 'DC', company: 'DesignCraft Architects', badge: 'badge-indigo', badgeTxt: 'Interior & Fit-out', grad: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', metric: '80% Faster GST Filing', metricSub: 'Monthly GST reconciliation: 2 days → 2 hours', quote: 'We used to maintain 14 separate Excel sheets per project. ARC PEM consolidated everything. The GST Purchase Register alone saves us two full days every month during filing season.', avInitials: 'AR', name: 'Arun Rajan', role: 'Director · Bengaluru', delay: '' },
            { initials: 'VC', company: 'Vertex Constructions', badge: 'badge-gray', badgeTxt: 'Residential', grad: 'linear-gradient(135deg,#0ea5e9,#0284c7)', metric: '₹35L Pending Recovered', metricSub: '35% reduction in outstanding dues in 3 months', quote: 'The Pending Payments dashboard gave us instant visibility across all 12 active projects. We follow up on dues the same week — not after a month of confusion.', avInitials: 'PS', name: 'Priya Sharma', role: 'Project Head · Pune', delay: ' d1' },
            { initials: 'BR', company: 'BuildRight Infra', badge: 'badge-green', badgeTxt: 'MEP & Civil', grad: 'linear-gradient(135deg,#10b981,#059669)', metric: 'Zero Labour Disputes', metricSub: 'Daily wage records verified against PDF muster rolls', quote: 'The site supervisor imports the daily muster PDF, wages are auto-calculated, and everyone signs off on the same number. Labour disputes have become a thing of the past.', avInitials: 'MK', name: 'Mohammed Khan', role: 'Owner · Hyderabad', delay: ' d2' },
          ].map(c => (
            <div key={c.company} className={`case-card fade-up${c.delay}`}>
              <div className="cc-top">
                <div className="cc-company-row">
                  <div className="cc-logo"><div className="cc-initials" style={{ background: c.grad }}>{c.initials}</div>{c.company}</div>
                  <span className={`badge ${c.badge}`}>{c.badgeTxt}</span>
                </div>
                <div className="cc-metric-box"><div className="cc-metric-val">{c.metric}</div><div className="cc-metric-label">{c.metricSub}</div></div>
                <div className="cc-quote"><div className="cc-quote-inner">{c.quote}</div></div>
              </div>
              <div className="cc-foot">
                <div className="cc-person"><div className="cc-avatar" style={{ background: c.grad }}>{c.avInitials}</div><div><div className="cc-name">{c.name}</div><div className="cc-role">{c.role}</div></div></div>
                <a href="#" className="cc-read">Read more →</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
