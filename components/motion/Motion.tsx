'use client'

/**
 * Small motion kit for the marketing site (framer-motion). Every piece renders its content on the server and in
 * no-JS browsers, and respects "reduce motion": people who ask for less movement get the final state at once.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import './motion.css'
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion'

const EASE = [0.22, 1, 0.36, 1] as const

/** Fades and lifts its children into place the first time they scroll into view. */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'article'
}) {
  const reduce = useReducedMotion()
  const Comp = motion[as]
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </Comp>
  )
}

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } }
const item: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: EASE } },
}

/** A grid or list whose children (StaggerItem) arrive one after another. */
export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      variants={container}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  )
}

/** Counts up to `to` when it scrolls into view. The final number is in the HTML for crawlers. */
export function CountUp({ to, prefix = '', suffix = '', decimals = 0 }: { to: number; prefix?: string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduce = useReducedMotion()
  const [value, setValue] = useState(to)

  useEffect(() => {
    if (!inView || reduce) return
    const controls = animate(0, to, { duration: 1.6, ease: EASE, onUpdate: setValue })
    return () => controls.stop()
  }, [inView, reduce, to])

  const shown = value.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return (
    <span ref={ref}>
      {prefix}
      {shown}
      {suffix}
    </span>
  )
}

/** An endless, pausable horizontal strip (logos, quotes). Duplicated once so the loop is seamless. */
export function Marquee({ children, speed = 40 }: { children: ReactNode; speed?: number }) {
  return (
    <div className="mq" style={{ ['--mq-speed' as string]: `${speed}s` }}>
      <div className="mq-track">
        <div className="mq-group">{children}</div>
        <div className="mq-group" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}

/** Tilts gently toward the cursor, like a card under a light. Off for touch and reduced motion. */
export function Tilt({ children, className, max = 8 }: { children: ReactNode; className?: string; max?: number }) {
  const reduce = useReducedMotion()
  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)
  const rx = useSpring(useTransform(y, [0, 1], [max, -max]), { stiffness: 160, damping: 18 })
  const ry = useSpring(useTransform(x, [0, 1], [-max, max]), { stiffness: 160, damping: 18 })
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - r.left) / r.width)
        y.set((e.clientY - r.top) / r.height)
      }}
      onPointerLeave={() => {
        x.set(0.5)
        y.set(0.5)
      }}
    >
      {children}
    </motion.div>
  )
}

/** Cycles through words in place (hero headlines). The first word is what crawlers and no-JS readers see. */
export function WordCycle({ words, interval = 2400 }: { words: string[]; interval?: number }) {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  useEffect(() => {
    if (reduce || words.length < 2) return
    const t = setInterval(() => setI((n) => (n + 1) % words.length), interval)
    return () => clearInterval(t)
  }, [reduce, words.length, interval])
  return (
    <span className="wc-wrap">
      {/* Reserves the width of the longest word so the line never jumps. */}
      <span className="wc-sizer" aria-hidden>
        {words.reduce((a, b) => (b.length > a.length ? b : a), '')}
      </span>
      <motion.span
        key={words[i]}
        className="wc-word"
        initial={reduce ? false : { opacity: 0, y: '0.45em', filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        {words[i]}
      </motion.span>
    </span>
  )
}
