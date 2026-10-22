import type { Metadata } from 'next'
import Image from 'next/image'
import PageSchema from '@/components/seo/PageSchema'

const TITLE = 'About Us — Customer Success Stories'
const DESCRIPTION =
  'See how architecture studios and construction firms across India use ARC PEM to reduce costs, speed up accounting, and take control of project finances.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/about' },
  openGraph: { title: `${TITLE} · ARC PEM`, description: DESCRIPTION, url: '/about', images: [{ url: '/og-image.jpg', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: `${TITLE} · ARC PEM`, description: DESCRIPTION, images: ['/og-image.jpg'] },
}

export default function AboutPage() {
  return (
    <>
    <PageSchema type="AboutPage" path="/about" name={TITLE} description={DESCRIPTION} trail={[{ name: 'About', path: '/about' }]} />
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
              <div className="img-hero-stat"><div className="ihs-num">24×7</div><div className="ihs-lbl">Live on any device</div></div>
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
            { initials: 'AC', company: 'Arch Consultancy', badge: 'badge-indigo', badgeTxt: 'Interior & Fit-out', grad: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', metric: '80% Faster GST Filing', metricSub: 'Monthly GST reconciliation: 2 days → 2 hours', quote: 'We used to maintain 14 separate Excel sheets per project. ARC PEM consolidated everything. The GST Purchase Register alone saves us two full days every month during filing season.', delay: '' },
            { initials: 'MA', company: 'Munesh Associates', badge: 'badge-gray', badgeTxt: 'Residential', grad: 'linear-gradient(135deg,#0ea5e9,#0284c7)', metric: '₹35L Pending Recovered', metricSub: '35% reduction in outstanding dues in 3 months', quote: 'The Pending Payments dashboard gave us instant visibility across all 12 active projects. We follow up on dues the same week — not after a month of confusion.', delay: ' d1' },
            { initials: 'SS', company: 'SS Constructions', badge: 'badge-green', badgeTxt: 'MEP & Civil', grad: 'linear-gradient(135deg,#10b981,#059669)', metric: 'Zero Labour Disputes', metricSub: 'Daily wage records verified against PDF muster rolls', quote: 'The site supervisor imports the daily muster PDF, wages are auto-calculated, and everyone signs off on the same number. Labour disputes have become a thing of the past.', delay: ' d2' },
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
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  )
}
