'use client'
import { useId } from 'react'

interface Props {
  size?: number
  style?: React.CSSProperties
}

export default function LogoMark({ size = 36, style }: Props) {
  const uid = useId().replace(/:/g, '_')

  const bg   = `${uid}bg`
  const gl   = `${uid}gl`
  const dp   = `${uid}dp`
  const ed   = `${uid}ed`
  const beam = `${uid}bm`

  return (
    <svg
      width={size} height={size} viewBox="0 0 44 44" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, ...style }}
    >
      <defs>
        {/* Deep-space base gradient */}
        <linearGradient id={bg} x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#080d1c"/>
          <stop offset="48%"  stopColor="#18276a"/>
          <stop offset="100%" stopColor="#3730a3"/>
        </linearGradient>

        {/* Top-left specular gloss */}
        <radialGradient id={gl} cx="34%" cy="20%" r="62%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.26)"/>
          <stop offset="55%"  stopColor="rgba(255,255,255,0.06)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </radialGradient>

        {/* Bottom inner shadow for depth */}
        <radialGradient id={dp} cx="50%" cy="105%" r="68%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.32)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </radialGradient>

        {/* Edge border: bright top-left, fades bottom-right */}
        <linearGradient id={ed} x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="rgba(147,197,253,0.65)"/>
          <stop offset="45%"  stopColor="rgba(99,102,241,0.18)"/>
          <stop offset="100%" stopColor="rgba(8,13,28,0.08)"/>
        </linearGradient>

        {/* Beam glow gradient */}
        <linearGradient id={beam} x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="rgba(147,197,253,0.4)"/>
          <stop offset="50%"  stopColor="#93c5fd"/>
          <stop offset="100%" stopColor="rgba(147,197,253,0.4)"/>
        </linearGradient>
      </defs>

      {/* ── Base shape ── */}
      <rect width="44" height="44" rx="11.5" fill={`url(#${bg})`}/>

      {/* ── Depth shadow at bottom ── */}
      <rect width="44" height="44" rx="11.5" fill={`url(#${dp})`}/>

      {/* ── Glossy top-left shine ── */}
      <rect width="44" height="44" rx="11.5" fill={`url(#${gl})`}/>

      {/* ── Edge highlight border ── */}
      <rect x="0.5" y="0.5" width="43" height="43" rx="11"
            fill="none" stroke={`url(#${ed})`} strokeWidth="1"/>

      {/* ── "A" left leg ── */}
      <path d="M 10.5 37 L 22 8.5" stroke="rgba(255,255,255,0.95)" strokeWidth="2.8" strokeLinecap="round"/>

      {/* ── "A" right leg ── */}
      <path d="M 22 8.5 L 33.5 37" stroke="rgba(255,255,255,0.95)" strokeWidth="2.8" strokeLinecap="round"/>

      {/* ── Electric cyan cross-beam ── */}
      <path d="M 15.8 27.5 L 28.2 27.5" stroke={`url(#${beam})`} strokeWidth="2.2" strokeLinecap="round"/>

      {/* ── Architectural ground line ── */}
      <path d="M 6.5 38.5 L 37.5 38.5" stroke="rgba(147,197,253,0.25)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
