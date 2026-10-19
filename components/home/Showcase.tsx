'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Reveal } from '@/components/motion/Motion'
import { ArrowRightIcon, CheckIcon } from '@/components/icons'
import { entity } from '@/lib/seo-entity'

/* Photography: public/images (licensed stock). Sizes are hinted so next/image serves small files on phones. */

const SEGMENTS = [
  {
    key: 'arch',
    label: 'Architects',
    img: '/images/blueprint-plans.jpg',
    alt: 'Architect drawing building plans with a scale ruler',
    line: 'Fees, consultants and site spends for every project, against the BOQ you drew up.',
    href: '/for/architects',
  },
  {
    key: 'contractors',
    label: 'Contractors',
    img: '/images/construction-workers.jpg',
    alt: 'Construction workers tying rebar on a building site',
    line: 'Daily labour, material bills and RA bills with TDS, on the phone at the site.',
    href: '/for/contractors',
  },
  {
    key: 'builders',
    label: 'Builders',
    img: '/images/architecture-modern.jpg',
    alt: 'Modern building with an angular glass facade',
    line: 'Cost per sq ft, budget burn and pending dues across every tower and phase.',
    href: '/for/builders',
  },
  {
    key: 'interiors',
    label: 'Interior firms',
    img: '/images/engineer-site.jpg',
    alt: 'Designer sketching layouts on a desk full of drawings',
    line: 'Vendor bills, carpenters and site expenses, with GST ready for your CA.',
    href: '/for/interior-designers',
  },
  {
    key: 'accounts',
    label: 'Accounts teams',
    img: '/images/finance-laptop.jpg',
    alt: 'Accountant reviewing figures on a laptop',
    line: 'GSTR-2B matched, approvals logged, Tally export at month-end. No retyping.',
    href: '/solutions#expense-mgmt',
  },
]

/** Hover / tap to expand: one wide photo panel per kind of firm (an "image accordion"). */
export function SegmentAccordion() {
  const [active, setActive] = useState(SEGMENTS[0].key)
  return (
    <section className="w-section sc-seg" aria-labelledby="sc-seg-title">
      <div className="container">
        <Reveal className="w-head">
          <span className="w-eyebrow">Who it&apos;s for</span>
          <h2 id="sc-seg-title" className="w-h2">One platform, <span className="w-grad">every kind of firm</span></h2>
        </Reveal>
        <div className="sc-acc" role="list">
          {SEGMENTS.map((s) => {
            const on = s.key === active
            return (
              <motion.div
                key={s.key}
                role="listitem"
                className={`sc-acc-item${on ? ' on' : ''}`}
                onMouseEnter={() => setActive(s.key)}
                onFocus={() => setActive(s.key)}
                onClick={() => setActive(s.key)}
                layout
                transition={{ type: 'spring', stiffness: 220, damping: 30 }}
                tabIndex={0}
              >
                <Image src={s.img} alt={s.alt} fill sizes="(max-width: 900px) 100vw, 50vw" className="sc-acc-img" />
                <div className="sc-acc-shade" />
                <div className="sc-acc-copy">
                  <span className="sc-acc-label">{s.label}</span>
                  <motion.div
                    className="sc-acc-more"
                    initial={false}
                    animate={{ opacity: on ? 1 : 0, y: on ? 0 : 12 }}
                    transition={{ duration: 0.35, delay: on ? 0.15 : 0 }}
                  >
                    <p>{s.line}</p>
                    <Link href={s.href} tabIndex={on ? 0 : -1}>
                      ARC PEM for {s.label.toLowerCase()} <ArrowRightIcon size={14} />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/** Full-bleed site photo that drifts on scroll, with glass cards of what ARC PEM shows the office. */
export function SiteBand() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-12%', '12%'])
  const cardY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [40, -40])

  return (
    <section ref={ref} className="sc-band" aria-labelledby="sc-band-title">
      <motion.div className="sc-band-bg" style={{ y }}>
        <Image src="/images/construction-crane.jpg" alt="Site engineers walking a foundation slab" fill sizes="100vw" className="sc-band-img" />
      </motion.div>
      <div className="sc-band-shade" />
      <div className="container sc-band-inner">
        <Reveal className="sc-band-copy">
          <span className="w-eyebrow light">From the slab to the books</span>
          <h2 id="sc-band-title" className="w-h2 light">
            What happens on site <span className="w-grad-light">shows up in the office</span> — the same minute.
          </h2>
          <ul className="sc-band-list">
            <li><CheckIcon size={14} /> Bills with receipt photos, from any phone</li>
            <li><CheckIcon size={14} /> Wages worked out from the day&apos;s headcount</li>
            <li><CheckIcon size={14} /> Approvals before money leaves the account</li>
          </ul>
        </Reveal>
        <motion.div className="sc-glass-stack" style={{ y: cardY }} aria-hidden>
          <div className="sc-glass">
            <small>Site A · today</small>
            <b>₹1,24,800</b>
            <span className="sc-pill ok">Labour paid</span>
          </div>
          <div className="sc-glass sc-glass-2">
            <small>Shree Cement · Bill #4021</small>
            <b>₹3,85,000</b>
            <span className="sc-pill wait">Awaiting approval</span>
          </div>
          <div className="sc-glass sc-glass-3">
            <small>Budget used · Resident Villa</small>
            <div className="sc-meter"><i style={{ width: '64%' }} /></div>
            <span className="sc-meter-l">64% of ₹32.8L</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/** Owner-confirmed customer results on an endless, pausable marquee. */
export function StoryMarquee() {
  const stories = entity.proof.stories
  const loop = [...stories, ...stories, ...stories]
  return (
    <section className="sc-stories" aria-label="Customer results">
      <div className="sc-marquee">
        <div className="sc-track">
          {[...loop, ...loop].map((s, i) => (
            <figure key={i} className="sc-story" aria-hidden={i >= stories.length}>
              <div className="sc-story-top">
                <span className="sc-avatar">{s.company.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
                <div>
                  <b>{s.company}</b>
                  <small>{s.segment}</small>
                </div>
              </div>
              <blockquote>{s.result}</blockquote>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
