'use client'

import { useId } from 'react'
import type { BarRow } from '@/lib/bbs'
import { rowGlyph, type Dim, type MemberDiagram } from '@/lib/bbs-diagram'

/**
 * Render-only SVG for the BBS drawings. Every coordinate comes from
 * lib/bbs-diagram.ts — deliberately no arithmetic here, so the geometry stays
 * unit-testable in plain Node.
 */

function DimText({ dim, className }: { dim: Dim; className: string }) {
  return (
    <>
      <path d={dim.path} className={`${className}`} />
      <text
        x={dim.tx}
        y={dim.ty}
        textAnchor={dim.anchor}
        dominantBaseline={dim.anchor === 'middle' ? undefined : 'middle'}
        className={`${className}-t`}
      >
        {dim.label}
      </text>
    </>
  )
}

/** The Shape cell of a schedule row: a glyph plus the plain-language label. */
export function BarShapeCell({ row }: { row: BarRow }) {
  const g = rowGlyph(row)
  const titleId = useId()
  // The straight glyph asserts nothing the Shape/Dia/Cutting Length columns
  // don't already say, so it is decorative. The link glyph carries the internal
  // a/b dimensions, which appear nowhere else, so it is informative.
  const informative = g.kind === 'rect-link'

  return (
    <div className="bbs-shape-cell">
      <svg
        // Links are portrait-ish and straights landscape, so they need
        // different viewport heights to end up at a comparable drawn scale.
        className={`bbs-glyph${g.kind === 'rect-link' ? ' bbs-glyph--link' : ''}${g.indicative ? ' is-indicative' : ''}`}
        viewBox={`0 0 ${g.viewW} ${g.viewH}`}
        preserveAspectRatio="xMinYMid meet"
        {...(informative ? { role: 'img', 'aria-labelledby': titleId } : { 'aria-hidden': true })}
      >
        {informative && <title id={titleId}>{g.title}</title>}
        {g.kind === 'straight' ? (
          g.paths.map((d) => <path key={d} d={d} className="bbs-bar" />)
        ) : (
          <>
            <path d={g.bodyPath} className="bbs-bar" />
            {g.hookPaths.map((d) => <path key={d} d={d} className="bbs-bar" />)}
            {g.aDim && <DimText dim={g.aDim} className="bbs-dim" />}
            {g.bDim && <DimText dim={g.bDim} className="bbs-dim" />}
          </>
        )}
      </svg>
      <span className="bbs-shape-label">
        {row.shape}
        {g.indicative ? ' (n.t.s.)' : ''}
      </span>
    </div>
  )
}

/** A member section or plan drawing, with its caption owned by the caller. */
export function MemberFigure({
  diagram,
  caption,
  className,
}: {
  diagram: MemberDiagram
  caption: React.ReactNode
  className?: string
}) {
  const titleId = useId()

  return (
    <figure className={`bbs-figure${className ? ` ${className}` : ''}`}>
      <svg
        className={`bbs-section${diagram.variant === 'elevation' ? ' bbs-elevation' : ''}`}
        viewBox={`0 0 ${diagram.viewW} ${diagram.viewH}`}
        width={diagram.viewW}
        height={diagram.viewH}
        role="img"
        aria-labelledby={titleId}
      >
        <title id={titleId}>{diagram.title}</title>

        {diagram.variant === 'elevation' ? (
          <>
            <rect
              x={diagram.beam.x}
              y={diagram.beam.y}
              width={diagram.beam.w}
              height={diagram.beam.h}
              className="bbs-outline"
            />
            {diagram.mainLines.map((d) => <path key={`m${d}`} d={d} className="bbs-link" />)}
            {diagram.stirrups.map((d) => <path key={`s${d}`} d={d} className="bbs-mesh" />)}
            {diagram.zoneBands.map((b) => (
              <g key={b.path}>
                <path d={b.path} className="bbs-dim" />
                <text x={b.tx} y={b.ty} className="bbs-dim-t" textAnchor="middle">{b.label}</text>
              </g>
            ))}
          </>
        ) : diagram.variant === 'section' ? (
          <>
            <rect
              x={diagram.outer.x}
              y={diagram.outer.y}
              width={diagram.outer.w}
              height={diagram.outer.h}
              className="bbs-outline"
            />
            <rect
              x={diagram.link.x}
              y={diagram.link.y}
              width={diagram.link.w}
              height={diagram.link.h}
              className="bbs-link"
            />
            {diagram.bars.map((b, i) => (
              <circle key={`${b.cx}-${b.cy}-${i}`} cx={b.cx} cy={b.cy} r={b.r} className="bbs-barfill" />
            ))}
          </>
        ) : (
          <>
            <rect
              x={diagram.panel.x}
              y={diagram.panel.y}
              width={diagram.panel.w}
              height={diagram.panel.h}
              className="bbs-outline"
            />
            {diagram.dir1.lines.map((d) => <path key={`a${d}`} d={d} className="bbs-mesh" />)}
            {diagram.dir2.lines.map((d) => <path key={`b${d}`} d={d} className="bbs-mesh bbs-mesh-2" />)}
          </>
        )}

        {diagram.dims.map((d) => <DimText key={d.path} dim={d} className="bbs-dim" />)}
      </svg>
      <figcaption className="bbs-figure-cap">{caption}</figcaption>
    </figure>
  )
}
